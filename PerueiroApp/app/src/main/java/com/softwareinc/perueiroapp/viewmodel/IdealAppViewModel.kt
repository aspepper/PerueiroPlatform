package com.softwareinc.perueiroapp.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.softwareinc.perueiroapp.data.local.AuthenticationResult
import com.softwareinc.perueiroapp.data.local.DriverEntity
import com.softwareinc.perueiroapp.data.local.GuardianEntity
import com.softwareinc.perueiroapp.data.local.IdealDatabase
import com.softwareinc.perueiroapp.data.local.IdealRepository
import com.softwareinc.perueiroapp.data.local.PaymentEntity
import com.softwareinc.perueiroapp.data.local.SchoolEntity
import com.softwareinc.perueiroapp.data.local.StudentEntity
import com.softwareinc.perueiroapp.data.local.ContractEntity
import com.softwareinc.perueiroapp.data.local.UserSession
import com.softwareinc.perueiroapp.data.local.UserSessionDataSource
import com.softwareinc.perueiroapp.data.local.VanEntity
import com.softwareinc.perueiroapp.data.local.VanLookupResult
import com.softwareinc.perueiroapp.data.local.VanSaveResult
import com.softwareinc.perueiroapp.data.remote.PasswordResetResult
import com.softwareinc.perueiroapp.model.UserRole
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class IdealAppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository =
        IdealRepository(IdealDatabase.getInstance(application).idealDao(), application)
    private val sessionDataSource = UserSessionDataSource(application)

    val loggedUser: StateFlow<LoggedUser?> = sessionDataSource.session
        .map { session ->
            session?.toLoggedUser()
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = null
        )

    val guardians = repository.guardians.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val schools = repository.schools.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val vans = repository.vans.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val drivers = repository.drivers.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val students = repository.students.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val payments = repository.payments.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    val contracts = repository.contracts.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )

    suspend fun login(cpf: String, password: String, userRole: UserRole): LoginOutcome {
        return when (userRole) {
            UserRole.DRIVER -> {
                when (val result = repository.authenticateDriver(cpf, password)) {
                    is AuthenticationResult.Success -> {
                        val driver = result.user
                        sessionDataSource.setSession(
                            driver.cpf,
                            UserRole.DRIVER.name,
                            result.token
                        )
                        LoginOutcome.Driver(driver)
                    }

                    AuthenticationResult.NotFound -> LoginOutcome.Error("Usuário não cadastrado.")
                    AuthenticationResult.InvalidCredentials -> LoginOutcome.Error("Senha inválida")
                    is AuthenticationResult.Failure -> LoginOutcome.Error(result.message)
                }
            }

            UserRole.GUARDIAN -> {
                when (val result = repository.authenticateGuardian(cpf, password)) {
                    is AuthenticationResult.Success -> {
                        val guardian = result.user
                        when {
                            guardian.mustChangePassword -> LoginOutcome.MustChangePassword(guardian.cpf)
                            guardian.isBlacklisted -> LoginOutcome.Error("Responsável bloqueado devido a pendências")
                            else -> {
                                sessionDataSource.setSession(
                                    guardian.cpf,
                                    UserRole.GUARDIAN.name,
                                    result.token
                                )
                                LoginOutcome.Guardian(guardian)
                            }
                        }
                    }

                    AuthenticationResult.NotFound -> LoginOutcome.Error("Usuário não cadastrado.")
                    AuthenticationResult.InvalidCredentials -> LoginOutcome.Error("Senha inválida")
                    is AuthenticationResult.Failure -> LoginOutcome.Error(result.message)
                }
            }
        }
    }

    suspend fun requestPasswordReset(cpf: String, email: String): PasswordResetResult {
        return repository.requestPasswordReset(cpf, email)
    }

    fun logout() {
        viewModelScope.launch {
            sessionDataSource.clear()
        }
    }

    fun saveGuardian(guardian: GuardianEntity, preservePassword: Boolean) {
        viewModelScope.launch {
            val finalGuardian = if (preservePassword) {
                val existing = repository.getGuardian(guardian.cpf)
                val preservedPassword = existing?.password ?: guardian.password
                guardian.copy(
                    password = preservedPassword,
                    mustChangePassword = existing?.mustChangePassword ?: guardian.mustChangePassword
                )
            } else {
                guardian
            }
            repository.saveGuardian(finalGuardian)
        }
    }

    fun deleteGuardian(cpf: String) {
        viewModelScope.launch { repository.deleteGuardian(cpf) }
    }

    fun saveSchool(school: SchoolEntity) {
        viewModelScope.launch { repository.saveSchool(school) }
    }

    fun deleteSchool(id: Long) {
        viewModelScope.launch { repository.deleteSchool(id) }
    }

    suspend fun saveVan(
        van: VanEntity,
        driverCpf: String?,
        syncWithServer: Boolean
    ): VanSaveResult {
        return repository.saveVan(van, driverCpf, syncWithServer)
    }

    fun deleteVan(id: Long) {
        viewModelScope.launch { repository.deleteVan(id) }
    }

    fun saveDriver(driver: DriverEntity) {
        viewModelScope.launch { repository.saveDriver(driver) }
    }

    suspend fun registerDriver(driver: DriverEntity) {
        repository.registerDriver(driver)
    }

    fun deleteDriver(cpf: String) {
        viewModelScope.launch { repository.deleteDriver(cpf) }
    }

    fun saveStudent(student: StudentEntity) {
        viewModelScope.launch { repository.saveStudent(student) }
    }

    fun deleteStudent(id: Long) {
        viewModelScope.launch { repository.deleteStudent(id) }
    }

    fun savePayment(payment: PaymentEntity) {
        viewModelScope.launch { repository.savePayment(payment) }
    }

    fun deletePayment(id: Long) {
        viewModelScope.launch { repository.deletePayment(id) }
    }

    fun refreshPendingContracts(guardianCpf: String? = null, driverCpf: String? = null) {
        viewModelScope.launch { repository.refreshPendingContracts(guardianCpf, driverCpf) }
    }

    fun refreshSignedContracts(guardianCpf: String? = null, driverCpf: String? = null) {
        viewModelScope.launch { repository.refreshSignedContracts(guardianCpf, driverCpf) }
    }

    fun observeContractsByGuardian(cpf: String): StateFlow<List<ContractEntity>> {
        return repository.observeContractsByGuardian(cpf).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList()
        )
    }

    fun observeContractsByDriver(cpf: String): StateFlow<List<ContractEntity>> {
        return repository.observeContractsByDriver(cpf).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList()
        )
    }

    fun sendContracts(contractIds: List<Long>, onComplete: (List<Long>) -> Unit) {
        viewModelScope.launch {
            val sent = repository.sendContracts(contractIds)
            onComplete(sent)
        }
    }

    fun markContractPending(contractId: Long, driverCpf: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            val ok = repository.markContractPending(contractId, driverCpf)
            onComplete(ok)
        }
    }

    fun changeGuardianPassword(cpf: String, newPassword: String) {
        viewModelScope.launch {
            val guardian = repository.getGuardian(cpf) ?: return@launch
            repository.saveGuardian(
                guardian.copy(password = newPassword, mustChangePassword = false)
            )
        }
    }

    suspend fun getDriver(cpf: String): DriverEntity? = repository.getDriver(cpf)

    suspend fun getGuardian(cpf: String): GuardianEntity? = repository.getGuardian(cpf)

    suspend fun lookupGuardian(cpf: String): GuardianLookupResult {
        val result = repository.lookupGuardian(cpf)
        return GuardianLookupResult(result.guardian, result.alreadyExists)
    }

    suspend fun lookupVan(plate: String): VanLookupResult {
        return repository.lookupVan(plate)
    }

    suspend fun syncFromServer(loggedUser: LoggedUser?) {
        repository.syncFromServer(loggedUser?.role, loggedUser?.cpf, loggedUser?.token)
    }

    fun studentsForGuardian(cpf: String): StateFlow<List<StudentEntity>> {
        return repository.observeStudentsByGuardian(cpf)
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList()
            )
    }

    fun paymentsForStudent(studentId: Long): StateFlow<List<PaymentEntity>> {
        return repository.observePaymentsByStudent(studentId)
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList()
            )
    }

    suspend fun refreshGuardianPendencies(cpf: String): GuardianPendencies {
        val guardian = repository.getGuardian(cpf)
        val status = when {
            guardian == null -> "Desconhecido"
            guardian.isBlacklisted -> "Bloqueado"
            guardian.pendingStatus.isBlank() -> "OK"
            else -> guardian.pendingStatus
        }
        val reasons = guardian?.pendingReasons?.takeIf { it.isNotBlank() }
            ?.split(';')?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        val vans = guardian?.pendingVans?.takeIf { it.isNotBlank() }
            ?.split(';')?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        return GuardianPendencies(status = status, reasons = reasons, vans = vans)
    }
}

data class GuardianPendencies(
    val status: String,
    val reasons: List<String>,
    val vans: List<String>
)

data class GuardianLookupResult(
    val guardian: GuardianEntity?,
    val alreadyExists: Boolean
)

data class LoggedUser(val cpf: String, val role: UserRole, val token: String?)

private fun UserSession.toLoggedUser(): LoggedUser? =
    runCatching { UserRole.valueOf(role) }.getOrNull()?.let {
        LoggedUser(cpf = cpf, role = it, token = token)
    }

sealed interface LoginOutcome {
    data class Driver(val driver: DriverEntity) : LoginOutcome
    data class Guardian(val guardian: GuardianEntity) : LoginOutcome
    data class MustChangePassword(val cpf: String) : LoginOutcome
    data class Error(val message: String) : LoginOutcome
}
