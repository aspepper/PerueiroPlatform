package com.idealinspecao.perueiroapp.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.idealinspecao.perueiroapp.data.local.DriverEntity
import com.idealinspecao.perueiroapp.data.local.GuardianEntity
import com.idealinspecao.perueiroapp.data.local.IdealDatabase
import com.idealinspecao.perueiroapp.data.local.IdealRepository
import com.idealinspecao.perueiroapp.data.local.PaymentEntity
import com.idealinspecao.perueiroapp.data.local.SchoolEntity
import com.idealinspecao.perueiroapp.data.local.StudentEntity
import com.idealinspecao.perueiroapp.data.local.VanEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class IdealAppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = IdealRepository(IdealDatabase.getInstance(application).idealDao())

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

    suspend fun login(cpf: String, password: String, userRole: UserRole): LoginOutcome {
        return when (userRole) {
            UserRole.DRIVER -> {
                val driver = repository.getDriver(cpf)
                when {
                    driver == null -> LoginOutcome.Error("Motorista não encontrado")
                    driver.password != password -> LoginOutcome.Error("Senha inválida")
                    else -> LoginOutcome.Driver(driver)
                }
            }

            UserRole.GUARDIAN -> {
                val guardian = repository.getGuardian(cpf)
                when {
                    guardian == null -> LoginOutcome.Error("Responsável não encontrado")
                    guardian.password != password -> LoginOutcome.Error("Senha inválida")
                    guardian.mustChangePassword -> LoginOutcome.MustChangePassword(guardian.cpf)
                    guardian.isBlacklisted -> LoginOutcome.Error("Responsável bloqueado devido a pendências")
                    else -> LoginOutcome.Guardian(guardian)
                }
            }
        }
    }

    fun saveGuardian(guardian: GuardianEntity) {
        viewModelScope.launch { repository.saveGuardian(guardian) }
    }

    fun saveSchool(school: SchoolEntity) {
        viewModelScope.launch { repository.saveSchool(school) }
    }

    fun saveVan(van: VanEntity) {
        viewModelScope.launch { repository.saveVan(van) }
    }

    fun saveDriver(driver: DriverEntity) {
        viewModelScope.launch { repository.saveDriver(driver) }
    }

    fun saveStudent(student: StudentEntity) {
        viewModelScope.launch { repository.saveStudent(student) }
    }

    fun savePayment(payment: PaymentEntity) {
        viewModelScope.launch { repository.savePayment(payment) }
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

enum class UserRole { DRIVER, GUARDIAN }

sealed interface LoginOutcome {
    data class Driver(val driver: DriverEntity) : LoginOutcome
    data class Guardian(val guardian: GuardianEntity) : LoginOutcome
    data class MustChangePassword(val cpf: String) : LoginOutcome
    data class Error(val message: String) : LoginOutcome
}
