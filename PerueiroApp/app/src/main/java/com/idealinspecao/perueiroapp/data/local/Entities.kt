package com.idealinspecao.perueiroapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "guardians")
data class GuardianEntity(
    @PrimaryKey val cpf: String,
    val name: String,
    val kinship: String,
    val birthDate: String,
    val spouseName: String,
    val address: String,
    val mobile: String,
    val landline: String?,
    val workAddress: String,
    val workPhone: String?,
    val email: String,
    val password: String,
    val mustChangePassword: Boolean = true,
    val pendingStatus: String = "Desconhecido",
    val pendingReasons: String = "",
    val pendingVans: String = "",
    val isBlacklisted: Boolean = false
)

@Entity(tableName = "schools")
data class SchoolEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fantasyName: String,
    val corporateName: String,
    val address: String,
    val phone: String,
    val contact: String,
    val principal: String,
    val doorman: String
)

@Entity(tableName = "vans")
data class VanEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val model: String,
    val color: String,
    val year: String,
    val plate: String,
    val driverCpfs: String
)

@Entity(tableName = "drivers")
data class DriverEntity(
    @PrimaryKey val cpf: String,
    val name: String,
    val birthDate: String,
    val address: String,
    val phone: String,
    val workPhone: String?,
    val email: String,
    val password: String
)

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val birthDate: String,
    val fatherCpf: String?,
    val motherCpf: String?,
    val schoolId: Long?,
    val mobile: String?,
    val vanId: Long?,
    val driverCpf: String?
)

@Entity(tableName = "payments")
data class PaymentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: Long,
    val paymentDate: String,
    val amount: Double,
    val discount: Double,
    val status: String
)

@Entity(tableName = "sync_status")
data class SyncStatusEntity(
    @PrimaryKey val id: String,
    val lastSyncedAt: Long
)
