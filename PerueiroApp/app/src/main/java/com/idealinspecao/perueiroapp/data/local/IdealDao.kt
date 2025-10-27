package com.idealinspecao.perueiroapp.data.local

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface IdealDao {
    @Upsert
    suspend fun upsertGuardian(guardian: GuardianEntity)

    @Upsert
    suspend fun upsertGuardians(guardians: List<GuardianEntity>)

    @Query("SELECT * FROM guardians ORDER BY name")
    fun observeGuardians(): Flow<List<GuardianEntity>>

    @Query("SELECT * FROM guardians WHERE cpf = :cpf LIMIT 1")
    suspend fun getGuardian(cpf: String): GuardianEntity?

    @Query("SELECT * FROM guardians WHERE cpf IN (:cpfs) LIMIT 1")
    suspend fun getGuardianByCpfs(cpfs: List<String>): GuardianEntity?

    @Query("SELECT * FROM guardians")
    suspend fun getAllGuardians(): List<GuardianEntity>

    @Query("DELETE FROM guardians WHERE cpf = :cpf")
    suspend fun deleteGuardian(cpf: String)

    @Query("DELETE FROM guardians")
    suspend fun clearGuardians()

    @Query("UPDATE guardians SET isBlacklisted = 0")
    suspend fun clearGuardianBlacklist()

    @Query("UPDATE guardians SET isBlacklisted = 0 WHERE cpf IN (:cpfs)")
    suspend fun clearSpecificGuardiansFromBlacklist(cpfs: List<String>)

    @Query("UPDATE guardians SET isBlacklisted = 1 WHERE cpf IN (:cpfs)")
    suspend fun setGuardiansBlacklisted(cpfs: List<String>)

    @Upsert
    suspend fun upsertSchool(school: SchoolEntity)

    @Upsert
    suspend fun upsertSchools(schools: List<SchoolEntity>)

    @Query("SELECT * FROM schools ORDER BY fantasyName")
    fun observeSchools(): Flow<List<SchoolEntity>>

    @Query("SELECT * FROM schools WHERE id = :id")
    suspend fun getSchool(id: Long): SchoolEntity?

    @Query("DELETE FROM schools WHERE id = :id")
    suspend fun deleteSchool(id: Long)

    @Query("DELETE FROM schools")
    suspend fun clearSchools()

    @Upsert
    suspend fun upsertVan(van: VanEntity)

    @Upsert
    suspend fun upsertVans(vans: List<VanEntity>)

    @Query("SELECT * FROM vans ORDER BY model")
    fun observeVans(): Flow<List<VanEntity>>

    @Query("SELECT * FROM vans WHERE id = :id")
    suspend fun getVan(id: Long): VanEntity?

    @Query("SELECT * FROM vans WHERE plate = :plate LIMIT 1")
    suspend fun getVanByPlate(plate: String): VanEntity?

    @Query("DELETE FROM vans WHERE id = :id")
    suspend fun deleteVan(id: Long)

    @Query("DELETE FROM vans")
    suspend fun clearVans()

    @Upsert
    suspend fun upsertPendingVan(pending: PendingVanEntity)

    @Query("SELECT * FROM pending_vans")
    suspend fun getPendingVans(): List<PendingVanEntity>

    @Query("DELETE FROM pending_vans WHERE id = :id")
    suspend fun deletePendingVan(id: Long)

    @Query("DELETE FROM pending_vans WHERE localVanId = :localVanId")
    suspend fun deletePendingVanByLocalId(localVanId: Long)

    @Upsert
    suspend fun upsertDriver(driver: DriverEntity)

    @Upsert
    suspend fun upsertDrivers(drivers: List<DriverEntity>)

    @Query("SELECT * FROM drivers ORDER BY name")
    fun observeDrivers(): Flow<List<DriverEntity>>

    @Query("SELECT * FROM drivers WHERE cpf = :cpf LIMIT 1")
    suspend fun getDriver(cpf: String): DriverEntity?

    @Query("SELECT * FROM drivers WHERE cpf IN (:cpfs) LIMIT 1")
    suspend fun getDriverByCpfs(cpfs: List<String>): DriverEntity?

    @Query("SELECT * FROM drivers")
    suspend fun getAllDrivers(): List<DriverEntity>

    @Query("DELETE FROM drivers WHERE cpf = :cpf")
    suspend fun deleteDriver(cpf: String)

    @Query("DELETE FROM drivers")
    suspend fun clearDrivers()

    @Upsert
    suspend fun upsertStudent(student: StudentEntity)

    @Upsert
    suspend fun upsertStudents(students: List<StudentEntity>)

    @Query("SELECT * FROM students ORDER BY name")
    fun observeStudents(): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students WHERE id = :id")
    suspend fun getStudent(id: Long): StudentEntity?

    @Query("SELECT * FROM students WHERE fatherCpf = :cpf OR motherCpf = :cpf")
    fun observeStudentsByGuardian(cpf: String): Flow<List<StudentEntity>>

    @Query("DELETE FROM students WHERE id = :id")
    suspend fun deleteStudent(id: Long)

    @Query("DELETE FROM students")
    suspend fun clearStudents()

    @Upsert
    suspend fun upsertPayment(payment: PaymentEntity)

    @Upsert
    suspend fun upsertPayments(payments: List<PaymentEntity>)

    @Query("SELECT * FROM payments ORDER BY paymentDate DESC")
    fun observePayments(): Flow<List<PaymentEntity>>

    @Query("SELECT * FROM payments WHERE studentId = :studentId ORDER BY paymentDate DESC")
    fun observePaymentsByStudent(studentId: Long): Flow<List<PaymentEntity>>

    @Query("DELETE FROM payments WHERE id = :id")
    suspend fun deletePayment(id: Long)

    @Query("DELETE FROM payments")
    suspend fun clearPayments()

    @Upsert
    suspend fun upsertSyncStatus(status: SyncStatusEntity)

    @Query("SELECT * FROM sync_status WHERE id = :id LIMIT 1")
    suspend fun getSyncStatus(id: String): SyncStatusEntity?
}
