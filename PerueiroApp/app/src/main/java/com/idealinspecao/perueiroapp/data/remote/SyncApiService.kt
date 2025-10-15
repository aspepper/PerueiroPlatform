package com.idealinspecao.perueiroapp.data.remote

import com.idealinspecao.perueiroapp.data.remote.RemoteApiConfig
import com.idealinspecao.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import com.idealinspecao.perueiroapp.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SyncApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val pullUrl: String = RemoteApiConfig.syncPullUrl
) {

    suspend fun fetchFullSync(
        userRole: UserRole? = null,
        userCpf: String? = null,
        updatedSince: Date? = null
    ): RemoteSyncPayload = withContext(Dispatchers.IO) {
        val urlBuilder = pullUrl
            .toHttpUrl()
            .newBuilder()
            .withApiKey()
        userRole?.let { urlBuilder.addQueryParameter("role", it.name) }
        userCpf?.let { urlBuilder.addQueryParameter("cpf", it) }
        updatedSince?.let { urlBuilder.addQueryParameter("updatedSince", formatUpdatedSince(it)) }

        val request = Request.Builder()
            .url(urlBuilder.build())
            .get()
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao carregar sincronização: HTTP ${response.code}")
            }

            val body = response.body?.string() ?: throw IOException("Resposta vazia ao carregar sincronização")
            val json = JSONObject(body)

            val guardians = parseGuardians(json.optJSONArray("guardians") ?: JSONArray())
            val schools = parseSchools(json.optJSONArray("schools") ?: JSONArray())
            val drivers = parseDrivers(json.optJSONArray("drivers") ?: JSONArray())
            val vans = parseVans(json.optJSONArray("vans") ?: JSONArray())
            val students = parseStudents(json.optJSONArray("students") ?: JSONArray())
            val payments = parsePayments(json.optJSONArray("payments") ?: JSONArray())

            RemoteSyncPayload(
                guardians = guardians,
                schools = schools,
                drivers = drivers,
                vans = vans,
                students = students,
                payments = payments,
                syncedAt = json.optNullableString("syncedAt")?.toDateOrNull()
            )
        }
    }

    private fun parseGuardians(array: JSONArray): List<RemoteGuardian> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val cpf = item.optNullableString("cpf") ?: continue
            val name = item.optNullableString("name") ?: continue

            add(
                RemoteGuardian(
                    cpf = cpf,
                    name = name,
                    kinship = item.optNullableString("kinship"),
                    birthDate = item.optNullableString("birthDate")?.toDateOrNull(),
                    spouseName = item.optNullableString("spouseName"),
                    address = item.optNullableString("address"),
                    mobile = item.optNullableString("mobile"),
                    landline = item.optNullableString("landline"),
                    workAddress = item.optNullableString("workAddress"),
                    workPhone = item.optNullableString("workPhone")
                )
            )
        }
    }

    private fun parseSchools(array: JSONArray): List<RemoteSchool> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val name = item.optNullableString("name") ?: continue
            add(
                RemoteSchool(
                    id = item.optLongFromAny("id"),
                    name = name,
                    address = item.optNullableString("address"),
                    phone = item.optNullableString("phone"),
                    contact = item.optNullableString("contact"),
                    principal = item.optNullableString("principal"),
                    doorman = item.optNullableString("doorman")
                )
            )
        }
    }

    private fun parseDrivers(array: JSONArray): List<RemoteDriver> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val cpf = item.optNullableString("cpf") ?: continue
            val name = item.optNullableString("name") ?: continue
            add(
                RemoteDriver(
                    cpf = cpf,
                    name = name,
                    phone = item.optNullableString("phone"),
                    email = item.optNullableString("email"),
                    address = item.optNullableString("address")
                )
            )
        }
    }

    private fun parseVans(array: JSONArray): List<RemoteVan> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val model = item.optNullableString("model") ?: continue
            val plate = item.optNullableString("plate") ?: continue
            add(
                RemoteVan(
                    id = item.optLongFromAny("id"),
                    model = model,
                    color = item.optNullableString("color"),
                    year = item.optNullableString("year"),
                    plate = plate,
                    driverCpf = item.optNullableString("driverCpf"),
                    billingDay = item.optLongFromAny("billingDay")?.toInt(),
                    monthlyFee = item.optDoubleFromAny("monthlyFee")
                )
            )
        }
    }

    private fun parseStudents(array: JSONArray): List<RemoteStudent> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val name = item.optNullableString("name") ?: continue
            add(
                RemoteStudent(
                    id = item.optLongFromAny("id"),
                    name = name,
                    birthDate = item.optNullableString("birthDate")?.toDateOrNull(),
                    grade = item.optNullableString("grade"),
                    guardianCpf = item.optNullableString("guardianCpf"),
                    schoolId = item.optLongFromAny("schoolId"),
                    vanId = item.optLongFromAny("vanId"),
                    driverCpf = item.optNullableString("driverCpf"),
                    mobile = item.optNullableString("mobile"),
                    blacklist = item.optBoolean("blacklist", false)
                )
            )
        }
    }

    private fun parsePayments(array: JSONArray): List<RemotePayment> = buildList {
        for (index in 0 until array.length()) {
            val item = array.optJSONObject(index) ?: continue
            val studentId = item.optLongFromAny("studentId") ?: continue
            add(
                RemotePayment(
                    id = item.optLongFromAny("id"),
                    studentId = studentId,
                    vanId = item.optLongFromAny("vanId"),
                    dueDate = item.optNullableString("dueDate")?.toDateOrNull(),
                    paidAt = item.optNullableString("paidAt")?.toDateOrNull(),
                    amount = item.optDoubleFromAny("amount"),
                    discount = item.optDoubleFromAny("discount"),
                    status = item.optNullableString("status") ?: "PENDING"
                )
            )
        }
    }

    data class RemoteSyncPayload(
        val guardians: List<RemoteGuardian>,
        val schools: List<RemoteSchool>,
        val drivers: List<RemoteDriver>,
        val vans: List<RemoteVan>,
        val students: List<RemoteStudent>,
        val payments: List<RemotePayment>,
        val syncedAt: Date?
    )

    data class RemoteGuardian(
        val cpf: String,
        val name: String,
        val kinship: String?,
        val birthDate: Date?,
        val spouseName: String?,
        val address: String?,
        val mobile: String?,
        val landline: String?,
        val workAddress: String?,
        val workPhone: String?
    )

    data class RemoteSchool(
        val id: Long?,
        val name: String,
        val address: String?,
        val phone: String?,
        val contact: String?,
        val principal: String?,
        val doorman: String?
    )

    data class RemoteDriver(
        val cpf: String,
        val name: String,
        val phone: String?,
        val email: String?,
        val address: String?
    )

    data class RemoteVan(
        val id: Long?,
        val model: String,
        val color: String?,
        val year: String?,
        val plate: String,
        val driverCpf: String?,
        val billingDay: Int?,
        val monthlyFee: Double?
    )

    data class RemoteStudent(
        val id: Long?,
        val name: String,
        val birthDate: Date?,
        val grade: String?,
        val guardianCpf: String?,
        val schoolId: Long?,
        val vanId: Long?,
        val driverCpf: String?,
        val mobile: String?,
        val blacklist: Boolean
    )

    data class RemotePayment(
        val id: Long?,
        val studentId: Long,
        val vanId: Long?,
        val dueDate: Date?,
        val paidAt: Date?,
        val amount: Double?,
        val discount: Double?,
        val status: String
    )

    private fun JSONObject.optNullableString(key: String): String? {
        if (isNull(key)) return null
        val value = optString(key, "").trim()
        if (value.isEmpty() || value.equals("null", ignoreCase = true)) return null
        return value
    }

    private fun JSONObject.optLongFromAny(key: String): Long? {
        if (isNull(key)) return null
        val value = opt(key)
        return when (value) {
            is Number -> value.toLong()
            is String -> value.trim().takeIf { it.isNotEmpty() }?.toLongOrNull()
            else -> null
        }
    }

    private fun JSONObject.optDoubleFromAny(key: String): Double? {
        if (isNull(key)) return null
        val value = opt(key)
        return when (value) {
            is Number -> value.toDouble()
            is String -> value.trim().takeIf { it.isNotEmpty() }?.replace(',', '.')?.toDoubleOrNull()
            else -> null
        }
    }

    private fun String.toDateOrNull(): Date? {
        for (pattern in DATE_PATTERNS) {
            try {
                val formatter = SimpleDateFormat(pattern, Locale.US)
                formatter.timeZone = TimeZone.getTimeZone("UTC")
                return formatter.parse(this)
            } catch (_: ParseException) {
                // continue
            }
        }
        return null
    }

    private fun formatUpdatedSince(date: Date): String {
        val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        formatter.timeZone = TimeZone.getTimeZone("UTC")
        return formatter.format(date)
    }

    companion object {
        private val DATE_PATTERNS = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd"
        )
    }
}
