package com.softwareinc.perueiroapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "guardians")
data class GuardianEntity(
    @PrimaryKey val cpf: String,
    val name: String,
    val kinship: String,
    val rg: String? = null,
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
    val driverCpfs: String,
    val city: String? = null,
    val billingDay: Int = 5,
    val monthlyFee: Double = 0.0
)

@Entity(tableName = "pending_vans")
data class PendingVanEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val localVanId: Long,
    val remoteId: Long?,
    val model: String,
    val color: String,
    val year: String,
    val plate: String,
    val driverCpf: String
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
    val cpf: String? = null,
    val rg: String? = null,
    val period: String? = null,
    val fatherCpf: String?,
    val motherCpf: String?,
    val schoolId: Long?,
    val mobile: String?,
    val vanId: Long?,
    val driverCpf: String?
)

@Entity(tableName = "student_guardians", primaryKeys = ["studentId", "guardianCpf"])
data class StudentGuardianEntity(
    val studentId: Long,
    val guardianCpf: String
)

@Entity(tableName = "contract_groups")
data class ContractGroupEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val vanId: Long,
    val period: String,
    val startDate: String,
    val endDate: String,
    val billingDay: Int,
    val rescissionFine: Double,
    val forumCity: String
)

@Entity(tableName = "contracts")
data class ContractEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: Long,
    val studentName: String,
    val guardianCpf: String,
    val guardianName: String,
    val vanId: Long,
    val driverCpf: String?,
    val period: String,
    val startDate: String,
    val endDate: String,
    val billingDay: Int,
    val rescissionFine: Double,
    val forumCity: String,
    val signed: Boolean = false,
    val signedAt: String? = null,
    val pdfUrl: String? = null,
    val signedPdfUrl: String? = null,
    val createdAt: String
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

@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val entityType: String,
    val entityId: String?,
    val operation: String,
    val payload: String,
    val enqueuedAt: Long,
    val attempts: Int = 0,
    val lastAttemptAt: Long? = null
)
