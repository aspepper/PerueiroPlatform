package com.idealinspecao.perueiroapp.data.local

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface IdealDao {
    @Upsert
    suspend fun upsertGuardian(guardian: GuardianEntity)

    @Query("SELECT * FROM guardians ORDER BY name")
    fun observeGuardians(): Flow<List<GuardianEntity>>

    @Query("SELECT * FROM guardians WHERE cpf = :cpf LIMIT 1")
    suspend fun getGuardian(cpf: String): GuardianEntity?

    @Query("DELETE FROM guardians WHERE cpf = :cpf")
    suspend fun deleteGuardian(cpf: String)

    @Upsert
    suspend fun upsertSchool(school: SchoolEntity)

    @Query("SELECT * FROM schools ORDER BY fantasyName")
    fun observeSchools(): Flow<List<SchoolEntity>>

    @Query("SELECT * FROM schools WHERE id = :id")
    suspend fun getSchool(id: Long): SchoolEntity?

    @Query("DELETE FROM schools WHERE id = :id")
    suspend fun deleteSchool(id: Long)

    @Upsert
    suspend fun upsertVan(van: VanEntity)

    @Query("SELECT * FROM vans ORDER BY model")
    fun observeVans(): Flow<List<VanEntity>>

    @Query("SELECT * FROM vans WHERE id = :id")
    suspend fun getVan(id: Long): VanEntity?

    @Query("DELETE FROM vans WHERE id = :id")
    suspend fun deleteVan(id: Long)

    @Upsert
    suspend fun upsertDriver(driver: DriverEntity)

    @Query("SELECT * FROM drivers ORDER BY name")
    fun observeDrivers(): Flow<List<DriverEntity>>

    @Query("SELECT * FROM drivers WHERE cpf = :cpf LIMIT 1")
    suspend fun getDriver(cpf: String): DriverEntity?

    @Query("DELETE FROM drivers WHERE cpf = :cpf")
    suspend fun deleteDriver(cpf: String)

    @Upsert
    suspend fun upsertStudent(student: StudentEntity)

    @Query("SELECT * FROM students ORDER BY name")
    fun observeStudents(): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students WHERE id = :id")
    suspend fun getStudent(id: Long): StudentEntity?

    @Query("SELECT * FROM students WHERE fatherCpf = :cpf OR motherCpf = :cpf")
    fun observeStudentsByGuardian(cpf: String): Flow<List<StudentEntity>>

    @Query("DELETE FROM students WHERE id = :id")
    suspend fun deleteStudent(id: Long)

    @Upsert
    suspend fun upsertPayment(payment: PaymentEntity)

    @Query("SELECT * FROM payments ORDER BY paymentDate DESC")
    fun observePayments(): Flow<List<PaymentEntity>>

    @Query("SELECT * FROM payments WHERE studentId = :studentId ORDER BY paymentDate DESC")
    fun observePaymentsByStudent(studentId: Long): Flow<List<PaymentEntity>>

    @Query("DELETE FROM payments WHERE id = :id")
    suspend fun deletePayment(id: Long)
}
