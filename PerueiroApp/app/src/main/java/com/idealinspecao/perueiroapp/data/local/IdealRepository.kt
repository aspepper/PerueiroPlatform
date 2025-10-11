package com.idealinspecao.perueiroapp.data.local

import kotlinx.coroutines.flow.Flow

class IdealRepository(private val dao: IdealDao) {
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

    suspend fun saveDriver(driver: DriverEntity) = dao.upsertDriver(driver)
    suspend fun getDriver(cpf: String) = dao.getDriver(cpf)
    suspend fun deleteDriver(cpf: String) = dao.deleteDriver(cpf)

    suspend fun saveStudent(student: StudentEntity) = dao.upsertStudent(student)
    suspend fun getStudent(id: Long) = dao.getStudent(id)
    fun observeStudentsByGuardian(cpf: String) = dao.observeStudentsByGuardian(cpf)
    suspend fun deleteStudent(id: Long) = dao.deleteStudent(id)

    suspend fun savePayment(payment: PaymentEntity) = dao.upsertPayment(payment)
    fun observePaymentsByStudent(studentId: Long) = dao.observePaymentsByStudent(studentId)
    suspend fun deletePayment(id: Long) = dao.deletePayment(id)
}
