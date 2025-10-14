package com.idealinspecao.perueiroapp.data.local

import android.util.Log
import com.idealinspecao.perueiroapp.data.remote.DriverApiService
import com.idealinspecao.perueiroapp.data.remote.SyncApiService
import kotlinx.coroutines.flow.Flow

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
        syncSchoolsAndBlacklist()
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
    suspend fun syncSchoolsAndBlacklist() {
        val remoteSchools = syncApiService.fetchSchools()
        val blacklistedGuardians = syncApiService.fetchBlacklistedGuardians()

        dao.clearSchools()
        if (remoteSchools.isNotEmpty()) {
            dao.upsertSchools(remoteSchools.map { it.toEntity() })
        }

        dao.clearGuardianBlacklist()
        if (blacklistedGuardians.isNotEmpty()) {
            dao.setGuardiansBlacklisted(blacklistedGuardians)
        }
    }
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

private const val TAG = "IdealRepository"
