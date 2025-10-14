package com.idealinspecao.perueiroapp.data.local

import android.util.Log
import com.idealinspecao.perueiroapp.BuildConfig
import com.idealinspecao.perueiroapp.data.remote.DriverApiService
import com.idealinspecao.perueiroapp.data.remote.SyncApiService
import com.idealinspecao.perueiroapp.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class IdealRepository(
    private val dao: IdealDao,
    private val driverApiService: DriverApiService = DriverApiService(),
    private val syncApiService: SyncApiService = SyncApiService()
) {
    val guardians: Flow<List<GuardianEntity>> = dao.observeGuardians()
    val schools: Flow<List<SchoolEntity>> = dao.observeSchools()
    val vans: Flow<List<VanEntity>> = dao.observeVans()
    val drivers: Flow<List<DriverEntity>> = dao.observeDrivers()
    val students: Flow<List<StudentEntity>> = dao.observeStudents()
    val payments: Flow<List<PaymentEntity>> = dao.observePayments()

    suspend fun saveGuardian(guardian: GuardianEntity) = dao.upsertGuardian(guardian)

    suspend fun getGuardian(cpf: String): GuardianEntity? {
        val cpfs = possibleCpfs(cpf)
        if (cpfs.isEmpty()) return null
        return dao.getGuardianByCpfs(cpfs)
    }
    suspend fun deleteGuardian(cpf: String) = dao.deleteGuardian(cpf)

    suspend fun saveSchool(school: SchoolEntity) = dao.upsertSchool(school)
    suspend fun getSchool(id: Long) = dao.getSchool(id)
    suspend fun deleteSchool(id: Long) = dao.deleteSchool(id)

    suspend fun saveVan(van: VanEntity) = dao.upsertVan(van)
    suspend fun getVan(id: Long) = dao.getVan(id)
    suspend fun deleteVan(id: Long) = dao.deleteVan(id)

    suspend fun saveDriver(driver: DriverEntity) {
        val normalizedDriver = driver.copy(cpf = normalizeCpfValue(driver.cpf))
        val cpfs = possibleCpfs(normalizedDriver.cpf)
        val alreadyExists = if (cpfs.isEmpty()) {
            false
        } else {
            dao.getDriverByCpfs(cpfs) != null
        }
        dao.upsertDriver(normalizedDriver)

        try {
            driverApiService.syncDriver(normalizedDriver, alreadyExists)
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao sincronizar motorista ${normalizedDriver.cpf}", exception)
        }
    }

    suspend fun registerDriver(driver: DriverEntity) {
        val normalizedDriver = driver.copy(cpf = normalizeCpfValue(driver.cpf))
        val cpfs = possibleCpfs(normalizedDriver.cpf)
        val alreadyExists = if (cpfs.isEmpty()) {
            false
        } else {
            dao.getDriverByCpfs(cpfs) != null
        }
        dao.upsertDriver(normalizedDriver)

        driverApiService.syncDriver(normalizedDriver, alreadyExists)
        syncFromServer(UserRole.DRIVER, normalizedDriver.cpf)
    }
    suspend fun getDriver(cpf: String): DriverEntity? {
        val cpfs = possibleCpfs(cpf)
        if (cpfs.isEmpty()) return null
        return dao.getDriverByCpfs(cpfs)
    }
    suspend fun deleteDriver(cpf: String) = dao.deleteDriver(cpf)

    suspend fun saveStudent(student: StudentEntity) = dao.upsertStudent(student)
    suspend fun getStudent(id: Long) = dao.getStudent(id)
    fun observeStudentsByGuardian(cpf: String) = dao.observeStudentsByGuardian(cpf)
    suspend fun deleteStudent(id: Long) = dao.deleteStudent(id)

    suspend fun savePayment(payment: PaymentEntity) = dao.upsertPayment(payment)
    fun observePaymentsByStudent(studentId: Long) = dao.observePaymentsByStudent(studentId)
    suspend fun deletePayment(id: Long) = dao.deletePayment(id)
    suspend fun syncFromServer(userRole: UserRole?, userCpf: String?) {
        withContext(Dispatchers.IO) {
            try {
                val normalizedUserCpf = userCpf?.let { normalizeCpfValue(it) }
                val payload = syncApiService.fetchFullSync(userRole, normalizedUserCpf)

                val existingGuardians = dao.getAllGuardians().associateBy { normalizeCpfValue(it.cpf) }
                val guardiansToPersist = payload.guardians.map { remote ->
                    val normalizedCpf = normalizeCpfValue(remote.cpf)
                    remote.toEntity(normalizedCpf, existingGuardians[normalizedCpf])
                }
                if (guardiansToPersist.isNotEmpty()) {
                    dao.upsertGuardians(guardiansToPersist)
                }

                val existingDrivers = dao.getAllDrivers().associateBy { normalizeCpfValue(it.cpf) }
                val driversToPersist = payload.drivers.map { remote ->
                    val normalizedCpf = normalizeCpfValue(remote.cpf)
                    remote.toEntity(normalizedCpf, existingDrivers[normalizedCpf])
                }
                if (driversToPersist.isNotEmpty()) {
                    dao.upsertDrivers(driversToPersist)
                }

                if (payload.schools.isNotEmpty()) {
                    dao.upsertSchools(payload.schools.map { it.toEntity() })
                }

                if (payload.vans.isNotEmpty()) {
                    dao.upsertVans(payload.vans.map { it.toEntity() })
                }

                val studentsToPersist = payload.students.map { it.toEntity() }
                if (studentsToPersist.isNotEmpty()) {
                    dao.upsertStudents(studentsToPersist)
                }

                val filteredPayments = payload.filterPayments(userRole, normalizedUserCpf)
                if (filteredPayments.isNotEmpty()) {
                    dao.upsertPayments(filteredPayments.map { it.toEntity() })
                }

                val blacklistedGuardians = payload.students
                    .filter { it.blacklist }
                    .mapNotNull { normalizeOptionalCpf(it.guardianCpf) }
                    .distinct()

                val guardianCpfs = payload.guardians.map { normalizeCpfValue(it.cpf) }
                if (userRole == null) {
                    dao.clearGuardianBlacklist()
                } else if (guardianCpfs.isNotEmpty()) {
                    dao.clearSpecificGuardiansFromBlacklist(guardianCpfs)
                }

                if (blacklistedGuardians.isNotEmpty()) {
                    dao.setGuardiansBlacklisted(blacklistedGuardians)
                }
            } catch (exception: Exception) {
                Log.e(TAG, "Erro ao sincronizar base local", exception)
            }
        }
    }
}

private fun SyncApiService.RemoteGuardian.toEntity(
    normalizedCpf: String,
    existing: GuardianEntity?,
): GuardianEntity {
    val basePassword = existing?.password ?: BuildConfig.DEFAULT_REMOTE_PASSWORD
    val baseMustChange = existing?.mustChangePassword ?: true

    return GuardianEntity(
        cpf = normalizedCpf,
        name = name,
        kinship = kinship ?: existing?.kinship ?: "",
        birthDate = formatDate(birthDate) ?: (existing?.birthDate ?: ""),
        spouseName = spouseName ?: existing?.spouseName ?: "",
        address = address ?: existing?.address ?: "",
        mobile = mobile ?: existing?.mobile ?: "",
        landline = landline ?: existing?.landline,
        workAddress = workAddress ?: existing?.workAddress ?: "",
        workPhone = workPhone ?: existing?.workPhone,
        email = existing?.email ?: "",
        password = basePassword,
        mustChangePassword = baseMustChange,
        pendingStatus = existing?.pendingStatus ?: "Desconhecido",
        pendingReasons = existing?.pendingReasons ?: "",
        pendingVans = existing?.pendingVans ?: "",
        isBlacklisted = existing?.isBlacklisted ?: false
    )
}

private fun SyncApiService.RemoteDriver.toEntity(
    normalizedCpf: String,
    existing: DriverEntity?,
): DriverEntity {
    val password = existing?.password ?: BuildConfig.DEFAULT_REMOTE_PASSWORD
    return DriverEntity(
        cpf = normalizedCpf,
        name = name,
        birthDate = existing?.birthDate ?: "",
        address = address ?: existing?.address ?: "",
        phone = phone ?: existing?.phone ?: "",
        workPhone = existing?.workPhone,
        email = email ?: existing?.email ?: "",
        password = password
    )
}

private fun SyncApiService.RemoteSchool.toEntity(): SchoolEntity {
    return SchoolEntity(
        id = id ?: 0,
        fantasyName = name,
        corporateName = name,
        address = address ?: "",
        phone = phone ?: "",
        contact = contact ?: "",
        principal = principal ?: "",
        doorman = doorman ?: ""
    )
}

private fun SyncApiService.RemoteVan.toEntity(): VanEntity {
    return VanEntity(
        id = id ?: 0,
        model = model,
        color = color ?: "",
        year = year ?: "",
        plate = plate,
        driverCpfs = driverCpf?.let { normalizeCpfValue(it) } ?: ""
    )
}

private fun SyncApiService.RemoteStudent.toEntity(): StudentEntity {
    return StudentEntity(
        id = id ?: 0,
        name = name,
        birthDate = formatDate(birthDate) ?: "",
        fatherCpf = normalizeOptionalCpf(guardianCpf),
        motherCpf = null,
        schoolId = schoolId,
        mobile = mobile,
        vanId = vanId,
        driverCpf = normalizeOptionalCpf(driverCpf)
    )
}

private fun SyncApiService.RemotePayment.toEntity(): PaymentEntity {
    return PaymentEntity(
        id = id ?: 0,
        studentId = studentId,
        paymentDate = formatDate(dueDate) ?: "",
        amount = amount ?: 0.0,
        discount = discount ?: 0.0,
        status = localizedStatus(status)
    )
}

private fun SyncApiService.RemoteSyncPayload.filterPayments(
    userRole: UserRole?,
    userCpf: String?
): List<SyncApiService.RemotePayment> {
    val paymentsSorted = payments.sortedWith(
        compareByDescending<SyncApiService.RemotePayment> { it.dueDate ?: Date(0) }
    )
    if (userRole == null || userCpf.isNullOrBlank()) {
        return paymentsSorted
    }

    val normalizedUserCpf = normalizeOptionalCpf(userCpf) ?: return emptyList()

    return when (userRole) {
        UserRole.DRIVER -> {
            val driverVans = vans.filter {
                normalizeOptionalCpf(it.driverCpf) == normalizedUserCpf
            }
                .mapNotNull { it.id }
                .toSet()
            val driverStudents = students.filter {
                normalizeOptionalCpf(it.driverCpf) == normalizedUserCpf
            }.mapNotNull { it.id }.toSet()

            paymentsSorted.filter { payment ->
                val matchesVan = payment.vanId?.let { driverVans.contains(it) } ?: false
                val matchesStudent = driverStudents.contains(payment.studentId)
                matchesVan || matchesStudent
            }
        }

        UserRole.GUARDIAN -> {
            val guardianStudents = students.filter {
                normalizeOptionalCpf(it.guardianCpf) == normalizedUserCpf
            }.mapNotNull { it.id }.toSet()

            if (guardianStudents.isEmpty()) return emptyList()

            val relevantPayments = paymentsSorted.filter { guardianStudents.contains(it.studentId) }
            if (relevantPayments.isEmpty()) return emptyList()

            val earliestDue = relevantPayments
                .mapNotNull { it.dueDate }
                .minOrNull()
            val now = Calendar.getInstance()
            val currentYear = now.get(Calendar.YEAR)
            val currentMonth = now.get(Calendar.MONTH)

            relevantPayments.filter { payment ->
                val dueDate = payment.dueDate ?: return@filter false
                val dueCalendar = Calendar.getInstance().apply { time = dueDate }
                val isCurrentMonth = dueCalendar.get(Calendar.YEAR) == currentYear &&
                    dueCalendar.get(Calendar.MONTH) == currentMonth
                val isPaid = payment.status.equals("PAID", ignoreCase = true)
                val isAfterStart = earliestDue?.let { !dueDate.before(it) } ?: true
                isAfterStart && (isCurrentMonth || isPaid)
            }
        }
    }
}

private fun normalizeCpfValue(raw: String): String {
    val digits = raw.filter { it.isDigit() }
    if (digits.isNotEmpty()) return digits
    return raw.trim()
}

private fun normalizeOptionalCpf(raw: String?): String? {
    if (raw == null) return null
    val normalized = normalizeCpfValue(raw)
    return normalized.ifBlank { null }
}

private fun possibleCpfs(raw: String): List<String> {
    val trimmed = raw.trim()
    if (trimmed.isEmpty()) return emptyList()
    val normalized = normalizeCpfValue(trimmed)
    return if (normalized == trimmed) listOf(trimmed) else listOf(trimmed, normalized)
}

private fun formatDate(date: Date?): String? {
    if (date == null) return null
    val formatter = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
    return formatter.format(date)
}

private fun localizedStatus(status: String?): String {
    return when (status?.uppercase(Locale.ROOT)) {
        "PAID" -> "Pago"
        "OVERDUE" -> "Atrasado"
        "CANCELED" -> "Cancelado"
        else -> "Pendente"
    }
}

private const val TAG = "IdealRepository"
