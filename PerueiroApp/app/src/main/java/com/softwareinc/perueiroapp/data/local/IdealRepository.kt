package com.softwareinc.perueiroapp.data.local

import android.util.Log
import com.softwareinc.perueiroapp.BuildConfig
import com.softwareinc.perueiroapp.data.remote.AuthApiService
import com.softwareinc.perueiroapp.data.remote.ContractApiService
import com.softwareinc.perueiroapp.data.remote.DriverApiService
import com.softwareinc.perueiroapp.data.remote.GuardianApiService
import com.softwareinc.perueiroapp.data.remote.PasswordResetResult
import com.softwareinc.perueiroapp.data.remote.SyncApiService
import com.softwareinc.perueiroapp.data.remote.VanApiService
import com.softwareinc.perueiroapp.data.sync.SyncQueueWorker
import com.softwareinc.perueiroapp.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class IdealRepository(
    private val dao: IdealDao,
    private val context: android.content.Context,
    private val driverApiService: DriverApiService = DriverApiService(),
    private val syncApiService: SyncApiService = SyncApiService(),
    private val authApiService: AuthApiService = AuthApiService(),
    private val guardianApiService: GuardianApiService = GuardianApiService(),
    private val vanApiService: VanApiService = VanApiService(),
    private val contractApiService: ContractApiService = ContractApiService()
) {
    val guardians: Flow<List<GuardianEntity>> = dao.observeGuardians()
    val schools: Flow<List<SchoolEntity>> = dao.observeSchools()
    val vans: Flow<List<VanEntity>> = dao.observeVans()
    val drivers: Flow<List<DriverEntity>> = dao.observeDrivers()
    val students: Flow<List<StudentEntity>> = dao.observeStudents()
    val payments: Flow<List<PaymentEntity>> = dao.observePayments()
    val contracts: Flow<List<ContractEntity>> = dao.observeContracts()

    suspend fun authenticateDriver(cpf: String, password: String): AuthenticationResult<DriverEntity> {
        val trimmedCpf = cpf.trim()
        val cpfs = possibleCpfs(trimmedCpf)
        val localDriver = if (cpfs.isEmpty()) null else dao.getDriverByCpfs(cpfs)

        if (localDriver != null && localDriver.password == password) {
            syncFromServer(UserRole.DRIVER, localDriver.cpf, token = null)
            val refreshed = dao.getDriverByCpfs(cpfs) ?: localDriver
            return AuthenticationResult.Success(refreshed, token = null)
        }

        return try {
            val remote = authApiService.login(trimmedCpf, password, UserRole.DRIVER)
            val remoteDriver = remote.driver?.toEntity(password, localDriver)
                ?: localDriver?.copy(password = password)
                ?: DriverEntity(
                    cpf = normalizeCpfValue(trimmedCpf),
                    name = trimmedCpf,
                    birthDate = "",
                    address = "",
                    phone = "",
                    workPhone = null,
                    email = "",
                    password = password
                )

            dao.upsertDriver(remoteDriver)
            syncFromServer(UserRole.DRIVER, remoteDriver.cpf, token = remote.token)
            val refreshed = dao.getDriverByCpfs(possibleCpfs(remoteDriver.cpf)) ?: remoteDriver
            AuthenticationResult.Success(refreshed, token = remote.token)
        } catch (exception: AuthApiService.InvalidCredentialsException) {
            AuthenticationResult.InvalidCredentials
        } catch (exception: AuthApiService.NotFoundException) {
            AuthenticationResult.NotFound
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao autenticar motorista ${trimmedCpf}", exception)
            AuthenticationResult.Failure("Não foi possível autenticar o motorista.", exception)
        }
    }

    suspend fun authenticateGuardian(cpf: String, password: String): AuthenticationResult<GuardianEntity> {
        val trimmedCpf = cpf.trim()
        val cpfs = possibleCpfs(trimmedCpf)
        val localGuardian = if (cpfs.isEmpty()) null else dao.getGuardianByCpfs(cpfs)

        if (localGuardian != null && localGuardian.password == password) {
            syncFromServer(UserRole.GUARDIAN, localGuardian.cpf, token = null)
            val refreshed = dao.getGuardianByCpfs(cpfs) ?: localGuardian
            return AuthenticationResult.Success(refreshed, token = null)
        }

        return try {
            val remote = authApiService.login(trimmedCpf, password, UserRole.GUARDIAN)
            val remoteGuardian = remote.guardian?.toEntity(password, localGuardian)
                ?: localGuardian?.copy(password = password, mustChangePassword = false)
                ?: GuardianEntity(
                    cpf = normalizeCpfValue(trimmedCpf),
                    name = trimmedCpf,
                    kinship = localGuardian?.kinship ?: "",
                    rg = localGuardian?.rg,
                    birthDate = localGuardian?.birthDate ?: "",
                    spouseName = localGuardian?.spouseName ?: "",
                    address = localGuardian?.address ?: "",
                    mobile = localGuardian?.mobile ?: "",
                    landline = localGuardian?.landline,
                    workAddress = localGuardian?.workAddress ?: "",
                    workPhone = localGuardian?.workPhone,
                    email = localGuardian?.email ?: "",
                    password = password,
                    mustChangePassword = false,
                    pendingStatus = localGuardian?.pendingStatus ?: "Desconhecido",
                    pendingReasons = localGuardian?.pendingReasons ?: "",
                    pendingVans = localGuardian?.pendingVans ?: "",
                    isBlacklisted = localGuardian?.isBlacklisted ?: false
                )

            dao.upsertGuardian(remoteGuardian)
            syncFromServer(UserRole.GUARDIAN, remoteGuardian.cpf, token = remote.token)
            val refreshed = dao.getGuardianByCpfs(possibleCpfs(remoteGuardian.cpf)) ?: remoteGuardian
            AuthenticationResult.Success(refreshed, token = remote.token)
        } catch (exception: AuthApiService.InvalidCredentialsException) {
            AuthenticationResult.InvalidCredentials
        } catch (exception: AuthApiService.NotFoundException) {
            AuthenticationResult.NotFound
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao autenticar responsável ${trimmedCpf}", exception)
            AuthenticationResult.Failure("Não foi possível autenticar o responsável.", exception)
        }
    }

    suspend fun requestPasswordReset(cpf: String, email: String): PasswordResetResult {
        val trimmedCpf = cpf.trim()
        val trimmedEmail = email.trim()

        if (trimmedCpf.isEmpty() || trimmedEmail.isEmpty()) {
            return PasswordResetResult.Failure("CPF e e-mail são obrigatórios.")
        }

        return try {
            authApiService.requestPasswordReset(trimmedCpf, trimmedEmail)
            PasswordResetResult.Success
        } catch (exception: AuthApiService.PasswordResetNotFoundException) {
            PasswordResetResult.NotFound
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao solicitar redefinição de senha para $trimmedCpf", exception)
            PasswordResetResult.Failure("Não foi possível solicitar a redefinição de senha. Tente novamente mais tarde.")
        }
    }

    suspend fun saveGuardian(guardian: GuardianEntity) {
        dao.upsertGuardian(guardian)
        enqueueSyncOperation(
            entityType = "guardian",
            entityId = guardian.cpf,
            operation = "UPSERT",
            payload = JSONObject()
                .put("cpf", guardian.cpf)
                .put("name", guardian.name)
                .put("kinship", guardian.kinship)
                .put("rg", guardian.rg)
                .put("birthDate", guardian.birthDate)
                .put("spouseName", guardian.spouseName)
                .put("address", guardian.address)
                .put("mobile", guardian.mobile)
                .put("landline", guardian.landline)
                .put("workAddress", guardian.workAddress)
                .put("workPhone", guardian.workPhone)
        )
    }

    suspend fun getGuardian(cpf: String): GuardianEntity? {
        val cpfs = possibleCpfs(cpf)
        if (cpfs.isEmpty()) return null
        return dao.getGuardianByCpfs(cpfs)
    }

    suspend fun lookupGuardian(cpf: String): GuardianLookupResult {
        val trimmedCpf = cpf.trim()
        if (trimmedCpf.isEmpty()) {
            return GuardianLookupResult(null, false)
        }

        val cpfs = possibleCpfs(trimmedCpf)
        if (cpfs.isNotEmpty()) {
            val localGuardian = dao.getGuardianByCpfs(cpfs)
            if (localGuardian != null) {
                return GuardianLookupResult(localGuardian, true)
            }
        }

        return try {
            val remoteGuardian = guardianApiService.findGuardian(trimmedCpf)
            if (remoteGuardian != null) {
                val normalizedCpf = normalizeCpfValue(remoteGuardian.cpf)
                GuardianLookupResult(
                    guardian = remoteGuardian.toEntity(
                        normalizedCpf,
                        existing = null
                    ),
                    alreadyExists = true
                )
            } else {
                GuardianLookupResult(null, false)
            }
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao buscar responsável $trimmedCpf", exception)
            throw exception
        }
    }
    suspend fun deleteGuardian(cpf: String) {
        dao.deleteGuardian(cpf)
        enqueueSyncOperation(
            entityType = "guardian",
            entityId = cpf,
            operation = "DELETE",
            payload = JSONObject().put("cpf", cpf)
        )
    }

    suspend fun lookupVan(plate: String): VanLookupResult {
        val normalizedPlate = normalizePlate(plate)
        if (normalizedPlate.isEmpty()) {
            return VanLookupResult(null, false)
        }

        val localVan = dao.getVanByPlate(normalizedPlate)
        if (localVan != null) {
            return VanLookupResult(localVan, true)
        }

        return try {
            val remoteVan = vanApiService.findVan(normalizedPlate)
            if (remoteVan != null) {
                val entity = remoteVan.toEntity().copy(plate = normalizedPlate)
                dao.upsertVan(entity)
                VanLookupResult(entity, true)
            } else {
                VanLookupResult(null, false)
            }
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao buscar van $normalizedPlate", exception)
            throw exception
        }
    }

    suspend fun saveSchool(school: SchoolEntity) {
        dao.upsertSchool(school)
        enqueueSyncOperation(
            entityType = "school",
            entityId = school.id.toString(),
            operation = "UPSERT",
            payload = JSONObject()
                .put("id", school.id)
                .put("name", school.fantasyName)
                .put("address", school.address)
                .put("phone", school.phone)
                .put("contact", school.contact)
                .put("principal", school.principal)
                .put("doorman", school.doorman)
        )
    }
    suspend fun getSchool(id: Long) = dao.getSchool(id)
    suspend fun deleteSchool(id: Long) {
        dao.deleteSchool(id)
        enqueueSyncOperation(
            entityType = "school",
            entityId = id.toString(),
            operation = "DELETE",
            payload = JSONObject().put("id", id)
        )
    }

    suspend fun saveVan(
        van: VanEntity,
        driverCpf: String?,
        syncWithServer: Boolean
    ): VanSaveResult {
        val normalizedPlate = normalizePlate(van.plate)
        if (normalizedPlate.isEmpty()) {
            throw IllegalArgumentException("Placa da van é obrigatória")
        }

        val normalizedDriverCpf = driverCpf?.let { normalizeCpfValue(it) }
        val sanitizedDrivers = when {
            normalizedDriverCpf != null -> normalizedDriverCpf
            van.driverCpfs.isBlank() -> ""
            else -> van.driverCpfs.split(',')
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .map { normalizeCpfValue(it) }
                .distinct()
                .joinToString(", ")
        }

        val sanitizedVan = van.copy(
            plate = normalizedPlate,
            driverCpfs = sanitizedDrivers
        )

        dao.upsertVan(sanitizedVan)
        val persisted = dao.getVanByPlate(normalizedPlate) ?: sanitizedVan

        if (!syncWithServer || normalizedDriverCpf == null) {
            enqueueSyncOperation(
                entityType = "van",
                entityId = persisted.id.toString(),
                operation = "UPSERT",
                payload = JSONObject()
                    .put("id", persisted.id.takeIf { it > 0 })
                    .put("model", persisted.model)
                    .put("color", persisted.color)
                    .put("year", persisted.year)
                    .put("plate", persisted.plate)
                    .put("driverCpf", normalizedDriverCpf)
                    .put("city", persisted.city)
                    .put("billingDay", persisted.billingDay)
                    .put("monthlyFee", persisted.monthlyFee)
            )
            return VanSaveResult.Synced(persisted)
        }

        dao.deletePendingVanByLocalId(persisted.id)

        return try {
            val remote = vanApiService.upsertVan(
                VanApiService.VanPayload(
                    id = persisted.id.takeIf { it > 0 },
                    model = sanitizedVan.model,
                    color = sanitizedVan.color.takeIf { it.isNotBlank() },
                    year = sanitizedVan.year.takeIf { it.isNotBlank() },
                    plate = normalizedPlate,
                    driverCpf = normalizedDriverCpf,
                    city = sanitizedVan.city,
                    billingDay = sanitizedVan.billingDay,
                    monthlyFee = sanitizedVan.monthlyFee
                )
            )
            val targetId = remote.id ?: persisted.id
            val remoteEntity = remote.toEntity().copy(
                id = targetId,
                model = remote.model.ifBlank { sanitizedVan.model },
                color = remote.color.orEmpty().ifBlank { sanitizedVan.color },
                year = remote.year.orEmpty().ifBlank { sanitizedVan.year },
                plate = normalizedPlate,
                driverCpfs = normalizedDriverCpf
            )

            if (persisted.id != 0L && targetId != persisted.id) {
                dao.deleteVan(persisted.id)
            }
            dao.upsertVan(remoteEntity)
            val refreshed = dao.getVanByPlate(normalizedPlate) ?: remoteEntity
            VanSaveResult.Synced(refreshed)
        } catch (exception: Exception) {
            if (exception.isNetworkIssue()) {
                dao.upsertPendingVan(
                    PendingVanEntity(
                        localVanId = persisted.id,
                        remoteId = sanitizedVan.id.takeIf { it > 0 },
                        model = sanitizedVan.model,
                        color = sanitizedVan.color,
                        year = sanitizedVan.year,
                        plate = normalizedPlate,
                        driverCpf = normalizedDriverCpf
                    )
                )
                VanSaveResult.Pending(persisted)
            } else {
                Log.e(TAG, "Erro ao sincronizar van ${normalizedPlate}", exception)
                throw exception
            }
        }
    }
    suspend fun getVan(id: Long) = dao.getVan(id)
    suspend fun deleteVan(id: Long) {
        dao.deleteVan(id)
        enqueueSyncOperation(
            entityType = "van",
            entityId = id.toString(),
            operation = "DELETE",
            payload = JSONObject().put("id", id)
        )
    }

    suspend fun saveDriver(driver: DriverEntity) {
        val normalizedDriver = driver.copy(cpf = normalizeCpfValue(driver.cpf))
        val cpfs = possibleCpfs(normalizedDriver.cpf)
        val alreadyExists = if (cpfs.isEmpty()) {
            false
        } else {
            dao.getDriverByCpfs(cpfs) != null
        }
        dao.upsertDriver(normalizedDriver)
        enqueueSyncOperation(
            entityType = "driver",
            entityId = normalizedDriver.cpf,
            operation = "UPSERT",
            payload = JSONObject()
                .put("cpf", normalizedDriver.cpf)
                .put("name", normalizedDriver.name)
                .put("phone", normalizedDriver.phone)
                .put("email", normalizedDriver.email)
                .put("address", normalizedDriver.address)
        )

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
        syncFromServer(UserRole.DRIVER, normalizedDriver.cpf, token = null)
    }
    suspend fun getDriver(cpf: String): DriverEntity? {
        val cpfs = possibleCpfs(cpf)
        if (cpfs.isEmpty()) return null
        return dao.getDriverByCpfs(cpfs)
    }
    suspend fun deleteDriver(cpf: String) {
        dao.deleteDriver(cpf)
        enqueueSyncOperation(
            entityType = "driver",
            entityId = cpf,
            operation = "DELETE",
            payload = JSONObject().put("cpf", cpf)
        )
    }

    suspend fun saveStudent(student: StudentEntity) {
        dao.upsertStudent(student)
        enqueueSyncOperation(
            entityType = "student",
            entityId = student.id.toString(),
            operation = "UPSERT",
            payload = JSONObject()
                .put("id", student.id.takeIf { it > 0 })
                .put("name", student.name)
                .put("birthDate", student.birthDate)
                .put("cpf", student.cpf)
                .put("rg", student.rg)
                .put("period", student.period)
                .put("guardianCpf", student.motherCpf ?: student.fatherCpf)
                .put("schoolId", student.schoolId)
                .put("vanId", student.vanId)
                .put("driverCpf", student.driverCpf)
                .put("mobile", student.mobile)
        )
    }

    suspend fun getStudent(id: Long) = dao.getStudent(id)
    fun observeStudentsByGuardian(cpf: String) = dao.observeStudentsByGuardian(cpf)
    suspend fun deleteStudent(id: Long) {
        dao.deleteStudent(id)
        enqueueSyncOperation(
            entityType = "student",
            entityId = id.toString(),
            operation = "DELETE",
            payload = JSONObject().put("id", id)
        )
    }

    suspend fun savePayment(payment: PaymentEntity) {
        dao.upsertPayment(payment)
        enqueueSyncOperation(
            entityType = "payment",
            entityId = payment.id.toString(),
            operation = "UPSERT",
            payload = JSONObject()
                .put("id", payment.id.takeIf { it > 0 })
                .put("studentId", payment.studentId)
                .put("dueDate", payment.paymentDate)
                .put("amount", payment.amount)
                .put("discount", payment.discount)
                .put("status", payment.status)
        )
    }
    fun observePaymentsByStudent(studentId: Long) = dao.observePaymentsByStudent(studentId)
    suspend fun deletePayment(id: Long) {
        dao.deletePayment(id)
        enqueueSyncOperation(
            entityType = "payment",
            entityId = id.toString(),
            operation = "DELETE",
            payload = JSONObject().put("id", id)
        )
    }
    suspend fun syncFromServer(userRole: UserRole?, userCpf: String?, token: String?) {
        withContext(Dispatchers.IO) {
            try {
                try {
                    pushPendingVans(token)
                } catch (exception: Exception) {
                    Log.e(TAG, "Erro ao sincronizar vans pendentes", exception)
                }

                val normalizedUserCpf = userCpf?.let { normalizeCpfValue(it) }
                val updatedSince = loadLastSyncAt(userRole, normalizedUserCpf)
                val payload = syncApiService.fetchFullSync(
                    userRole,
                    normalizedUserCpf,
                    updatedSince,
                    token
                )

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

                val guardianLinks = payload.students
                    .mapNotNull { student ->
                        val studentId = student.id ?: return@mapNotNull null
                        val guardianCpf = normalizeOptionalCpf(student.guardianCpf) ?: return@mapNotNull null
                        StudentGuardianEntity(studentId = studentId, guardianCpf = guardianCpf)
                    }

                if (guardianLinks.isNotEmpty()) {
                    dao.upsertStudentGuardians(guardianLinks)
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

                val syncTimestamp = payload.syncedAt ?: Date()
                recordSuccessfulSync(userRole, normalizedUserCpf, syncTimestamp)
            } catch (exception: Exception) {
                Log.e(TAG, "Erro ao sincronizar base local", exception)
            }
        }
    }

    fun observeContractsByGuardian(cpf: String): Flow<List<ContractEntity>> =
        dao.observeContractsByGuardian(cpf)

    fun observeContractsByDriver(cpf: String): Flow<List<ContractEntity>> =
        dao.observeContractsByDriver(cpf)

    suspend fun refreshPendingContracts(guardianCpf: String? = null, driverCpf: String? = null) {
        try {
            val contracts = contractApiService.fetchPendingContracts(guardianCpf, driverCpf, null)
            if (contracts.isNotEmpty()) {
                dao.upsertContracts(contracts.map { it.toEntity() })
            }
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao sincronizar contratos pendentes", exception)
        }
    }

    suspend fun refreshSignedContracts(guardianCpf: String? = null, driverCpf: String? = null) {
        try {
            val contracts = contractApiService.fetchSignedContracts(guardianCpf, driverCpf, null)
            if (contracts.isNotEmpty()) {
                dao.upsertContracts(contracts.map { it.toEntity() })
            }
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao sincronizar contratos assinados", exception)
        }
    }

    suspend fun sendContracts(contractIds: List<Long>): List<Long> {
        return try {
            contractApiService.sendContracts(contractIds)
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao enviar contratos", exception)
            emptyList()
        }
    }

    suspend fun markContractPending(contractId: Long, driverCpf: String): Boolean {
        return try {
            contractApiService.markContractPending(contractId, driverCpf)
            val local = dao.getContract(contractId)
            if (local != null) {
                dao.upsertContracts(
                    listOf(
                        local.copy(
                            signed = false,
                            signedAt = null,
                            signedPdfUrl = null
                        )
                    )
                )
            }
            true
        } catch (exception: Exception) {
            Log.e(TAG, "Erro ao marcar contrato como pendente", exception)
            false
        }
    }

    private suspend fun pushPendingVans(token: String?) {
        val pendings = dao.getPendingVans()
        if (pendings.isEmpty()) return

        for (pending in pendings) {
            try {
                val remote = vanApiService.upsertVan(
                    VanApiService.VanPayload(
                        id = pending.remoteId,
                        model = pending.model,
                        color = pending.color.takeIf { it.isNotBlank() },
                        year = pending.year.takeIf { it.isNotBlank() },
                        plate = pending.plate,
                        driverCpf = pending.driverCpf
                    )
                )

                val targetId = remote.id ?: pending.remoteId ?: pending.localVanId
                val existingLocal = dao.getVanByPlate(pending.plate)
                val remoteEntity = remote.toEntity().copy(
                    id = targetId,
                    model = remote.model.ifBlank { pending.model },
                    color = remote.color.orEmpty().ifBlank { pending.color },
                    year = remote.year.orEmpty().ifBlank { pending.year },
                    plate = pending.plate,
                    driverCpfs = pending.driverCpf
                )

                if (existingLocal != null && existingLocal.id != targetId) {
                    dao.deleteVan(existingLocal.id)
                }

                dao.upsertVan(remoteEntity)
                dao.deletePendingVan(pending.id)
            } catch (exception: Exception) {
                if (exception.isNetworkIssue()) {
                    break
                } else {
                    Log.e(TAG, "Erro ao sincronizar van pendente ${pending.plate}", exception)
                    dao.deletePendingVan(pending.id)
                }
            }
        }
    }

    private suspend fun loadLastSyncAt(userRole: UserRole?, userCpf: String?): Date? {
        val statusId = syncStatusId(userRole, userCpf)
        val status = dao.getSyncStatus(statusId) ?: return null
        return status.lastSyncedAt.takeIf { it > 0 }?.let { Date(it) }
    }

    private suspend fun recordSuccessfulSync(userRole: UserRole?, userCpf: String?, syncedAt: Date) {
        val statusId = syncStatusId(userRole, userCpf)
        dao.upsertSyncStatus(SyncStatusEntity(id = statusId, lastSyncedAt = syncedAt.time))
    }

    private fun syncStatusId(userRole: UserRole?, userCpf: String?): String {
        val rolePart = userRole?.name ?: "GLOBAL"
        val cpfPart = userCpf?.takeIf { it.isNotBlank() }?.let { normalizeCpfValue(it) } ?: "-"
        return "$rolePart:$cpfPart"
    }

    private suspend fun enqueueSyncOperation(
        entityType: String,
        entityId: String?,
        operation: String,
        payload: JSONObject
    ) {
        val now = System.currentTimeMillis()
        dao.upsertSyncQueue(
            SyncQueueEntity(
                entityType = entityType,
                entityId = entityId,
                operation = operation,
                payload = payload.toString(),
                enqueuedAt = now
            )
        )
        SyncQueueWorker.enqueue(context)
    }
}

sealed class AuthenticationResult<out T> {
    data class Success<T>(val user: T, val token: String?) : AuthenticationResult<T>()
    data object NotFound : AuthenticationResult<Nothing>()
    data object InvalidCredentials : AuthenticationResult<Nothing>()
    data class Failure(val message: String, val throwable: Throwable? = null) : AuthenticationResult<Nothing>()
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
        rg = rg ?: existing?.rg,
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

private fun AuthApiService.RemoteDriver.toEntity(
    password: String,
    existing: DriverEntity?,
): DriverEntity {
    val normalizedCpf = normalizeCpfValue(cpf)
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

private fun AuthApiService.RemoteGuardian.toEntity(
    password: String,
    existing: GuardianEntity?,
): GuardianEntity {
    val normalizedCpf = normalizeCpfValue(cpf)
    return GuardianEntity(
        cpf = normalizedCpf,
        name = name,
        kinship = kinship ?: existing?.kinship ?: "",
        rg = rg ?: existing?.rg,
        birthDate = formatDate(birthDate) ?: (existing?.birthDate ?: ""),
        spouseName = spouseName ?: existing?.spouseName ?: "",
        address = address ?: existing?.address ?: "",
        mobile = mobile ?: existing?.mobile ?: "",
        landline = landline ?: existing?.landline,
        workAddress = workAddress ?: existing?.workAddress ?: "",
        workPhone = workPhone ?: existing?.workPhone,
        email = existing?.email ?: "",
        password = password,
        mustChangePassword = false,
        pendingStatus = existing?.pendingStatus ?: "Desconhecido",
        pendingReasons = existing?.pendingReasons ?: "",
        pendingVans = existing?.pendingVans ?: "",
        isBlacklisted = existing?.isBlacklisted ?: false
    )
}

private fun GuardianApiService.RemoteGuardian.toEntity(
    normalizedCpf: String,
    existing: GuardianEntity?,
): GuardianEntity {
    val basePassword = existing?.password ?: BuildConfig.DEFAULT_REMOTE_PASSWORD
    val baseMustChange = existing?.mustChangePassword ?: true

    return GuardianEntity(
        cpf = normalizedCpf,
        name = name,
        kinship = kinship ?: existing?.kinship ?: "",
        rg = rg ?: existing?.rg,
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
        driverCpfs = driverCpf?.let { normalizeCpfValue(it) } ?: "",
        city = city,
        billingDay = billingDay ?: 5,
        monthlyFee = monthlyFee ?: 0.0
    )
}

private fun VanApiService.RemoteVan.toEntity(): VanEntity {
    return VanEntity(
        id = id ?: 0,
        model = model,
        color = color.orEmpty(),
        year = year.orEmpty(),
        plate = plate,
        driverCpfs = driverCpf?.let { normalizeCpfValue(it) } ?: "",
        city = null,
        billingDay = 5,
        monthlyFee = 0.0
    )
}

private fun SyncApiService.RemoteStudent.toEntity(): StudentEntity {
    return StudentEntity(
        id = id ?: 0,
        name = name,
        birthDate = formatDate(birthDate) ?: "",
        cpf = cpf,
        rg = rg,
        period = period,
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

private fun ContractApiService.RemoteContract.toEntity(): ContractEntity {
    return ContractEntity(
        id = id,
        studentId = studentId,
        studentName = studentName,
        guardianCpf = normalizeCpfValue(guardianCpf),
        guardianName = guardianName,
        vanId = vanId,
        driverCpf = driverCpf?.let { normalizeCpfValue(it) },
        period = period,
        startDate = startDate,
        endDate = endDate,
        billingDay = billingDay,
        rescissionFine = rescissionFine,
        forumCity = forumCity,
        signed = signed,
        signedAt = signedAt,
        pdfUrl = pdfUrl,
        signedPdfUrl = signedPdfUrl,
        createdAt = createdAt
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

data class GuardianLookupResult(
    val guardian: GuardianEntity?,
    val alreadyExists: Boolean
)

data class VanLookupResult(
    val van: VanEntity?,
    val alreadyExists: Boolean
)

sealed class VanSaveResult {
    data class Synced(val van: VanEntity) : VanSaveResult()
    data class Pending(val van: VanEntity) : VanSaveResult()
}

private fun normalizeCpfValue(raw: String): String {
    val digits = raw.filter { it.isDigit() }
    if (digits.isNotEmpty()) return digits
    return raw.trim()
}

private fun Exception.isNetworkIssue(): Boolean {
    if (this is IOException) return true
    val rootCause = cause
    return rootCause is IOException
}

private fun normalizePlate(raw: String): String {
    return raw.trim().uppercase(Locale.ROOT)
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
