package com.idealinspecao.perueiroapp.data.local

import android.util.Log
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
import java.util.UUID

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
    suspend fun getGuardian(cpf: String) = dao.getGuardian(cpf)
    suspend fun deleteGuardian(cpf: String) = dao.deleteGuardian(cpf)

    suspend fun saveSchool(school: SchoolEntity) = dao.upsertSchool(school)
    suspend fun getSchool(id: Long) = dao.getSchool(id)
    suspend fun deleteSchool(id: Long) = dao.deleteSchool(id)

    suspend fun saveVan(van: VanEntity) = dao.upsertVan(van)
    suspend fun getVan(id: Long) = dao.getVan(id)
    suspend fun deleteVan(id: Long) = dao.deleteVan(id)

    suspend fun saveDriver(driver: DriverEntity) {
        val alreadyExists = dao.getDriver(driver.cpf) != null
        dao.upsertDriver(driver)

        try {
            driverApiService.syncDriver(driver, alreadyExists)
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao sincronizar motorista ${driver.cpf}", exception)
        }
    }

    suspend fun registerDriver(driver: DriverEntity) {
        val alreadyExists = dao.getDriver(driver.cpf) != null
        dao.upsertDriver(driver)

        driverApiService.syncDriver(driver, alreadyExists)
        syncFromServer(UserRole.DRIVER, driver.cpf)
    }
    suspend fun getDriver(cpf: String) = dao.getDriver(cpf)
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
                val payload = syncApiService.fetchFullSync()

                val existingGuardians = dao.getAllGuardians().associateBy { it.cpf }
                val guardiansToPersist = payload.guardians.map { it.toEntity(existingGuardians[it.cpf]) }
                dao.clearGuardians()
                if (guardiansToPersist.isNotEmpty()) {
                    dao.upsertGuardians(guardiansToPersist)
                }

                val existingDrivers = dao.getAllDrivers().associateBy { it.cpf }
                val driversToPersist = payload.drivers.map { it.toEntity(existingDrivers[it.cpf]) }
                dao.clearDrivers()
                if (driversToPersist.isNotEmpty()) {
                    dao.upsertDrivers(driversToPersist)
                }

                dao.clearSchools()
                if (payload.schools.isNotEmpty()) {
                    dao.upsertSchools(payload.schools.map { it.toEntity() })
                }

                dao.clearVans()
                if (payload.vans.isNotEmpty()) {
                    dao.upsertVans(payload.vans.map { it.toEntity() })
                }

                dao.clearStudents()
                val studentsToPersist = payload.students.map { it.toEntity() }
                if (studentsToPersist.isNotEmpty()) {
                    dao.upsertStudents(studentsToPersist)
                }

                val filteredPayments = payload.filterPayments(userRole, userCpf)
                dao.clearPayments()
                if (filteredPayments.isNotEmpty()) {
                    dao.upsertPayments(filteredPayments.map { it.toEntity() })
                }

                val blacklistedGuardians = payload.students
                    .filter { it.blacklist }
                    .mapNotNull { it.guardianCpf }
                    .distinct()

                dao.clearGuardianBlacklist()
                if (blacklistedGuardians.isNotEmpty()) {
                    dao.setGuardiansBlacklisted(blacklistedGuardians)
                }
            } catch (exception: Exception) {
                Log.e(TAG, "Erro ao sincronizar base local", exception)
            }
        }
    }
}

private fun SyncApiService.RemoteGuardian.toEntity(existing: GuardianEntity?): GuardianEntity {
    val basePassword = existing?.password ?: UUID.randomUUID().toString().take(8)
    val baseMustChange = existing?.mustChangePassword ?: true

    return GuardianEntity(
        cpf = cpf,
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

private fun SyncApiService.RemoteDriver.toEntity(existing: DriverEntity?): DriverEntity {
    val password = existing?.password ?: UUID.randomUUID().toString().take(8)
    return DriverEntity(
        cpf = cpf,
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
        driverCpfs = driverCpf ?: ""
    )
}

private fun SyncApiService.RemoteStudent.toEntity(): StudentEntity {
    return StudentEntity(
        id = id ?: 0,
        name = name,
        birthDate = formatDate(birthDate) ?: "",
        fatherCpf = guardianCpf,
        motherCpf = null,
        schoolId = schoolId,
        mobile = mobile,
        vanId = vanId,
        driverCpf = driverCpf
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

    return when (userRole) {
        UserRole.DRIVER -> {
            val driverVans = vans.filter { it.driverCpf.equals(userCpf, ignoreCase = true) }
                .mapNotNull { it.id }
                .toSet()
            val driverStudents = students.filter {
                it.driverCpf.equals(userCpf, ignoreCase = true)
            }.mapNotNull { it.id }.toSet()

            paymentsSorted.filter { payment ->
                val matchesVan = payment.vanId?.let { driverVans.contains(it) } ?: false
                val matchesStudent = driverStudents.contains(payment.studentId)
                matchesVan || matchesStudent
            }
        }

        UserRole.GUARDIAN -> {
            val guardianStudents = students.filter {
                it.guardianCpf.equals(userCpf, ignoreCase = true)
            }.mapNotNull { it.id }.toSet()

            if (guardianStudents.isEmpty()) return emptyList()

            val relevantPayments = paymentsSorted.filter { guardianStudents.contains(it.studentId) }
            if (relevantPayments.isEmpty()) return emptyList()

            val earliestDue = relevantPayments.minOfOrNull { it.dueDate }
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
