package com.softwareinc.perueiroapp.data.remote

import com.softwareinc.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import com.softwareinc.perueiroapp.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class AuthApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val loginUrl: String = RemoteApiConfig.mobileLoginUrl,
    private val forgotPasswordUrl: String = RemoteApiConfig.forgotPasswordUrl
) {

    suspend fun login(cpf: String, password: String, role: UserRole): RemoteLoginPayload = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("cpf", cpf)
            put("password", password)
            put("role", role.name)
        }

        val request = Request.Builder()
            .url(loginUrl)
            .addHeader("Content-Type", RemoteApiConfig.jsonMediaTypeString)
            .withApiKey()
            .post(payload.toString().toRequestBody(RemoteApiConfig.jsonMediaType))
            .build()

        client.newCall(request).execute().use { response ->
            when (response.code) {
                200 -> {
                    val body = response.body?.string()?.takeIf { it.isNotBlank() }
                        ?: throw IOException("Resposta vazia ao autenticar")
                    parsePayload(body)
                }

                401 -> throw InvalidCredentialsException()
                404 -> throw NotFoundException()
                else -> throw IOException("Falha ao autenticar: HTTP ${response.code}")
            }
        }
    }

    suspend fun requestPasswordReset(cpf: String, email: String) = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("cpf", cpf)
            put("email", email)
        }

        val request = Request.Builder()
            .url(forgotPasswordUrl)
            .addHeader("Content-Type", RemoteApiConfig.jsonMediaTypeString)
            .withApiKey()
            .post(payload.toString().toRequestBody(RemoteApiConfig.jsonMediaType))
            .build()

        client.newCall(request).execute().use { response ->
            when (response.code) {
                200, 202, 204 -> Unit
                404 -> throw PasswordResetNotFoundException()
                else -> throw IOException("Falha ao solicitar redefinição de senha: HTTP ${response.code}")
            }
        }
    }

    private fun parsePayload(body: String): RemoteLoginPayload {
        val json = JSONObject(body)
        val role = UserRole.entries.firstOrNull { it.name.equals(json.optString("role"), ignoreCase = true) }
            ?: throw IOException("Resposta de autenticação inválida")

        val token = json.optString("token").takeIf { it.isNotBlank() }

        val driver = json.optJSONObject("driver")?.let { driverJson ->
            val cpf = driverJson.optString("cpf").takeIf { it.isNotBlank() }
                ?: throw IOException("Resposta de autenticação inválida")
            val name = driverJson.optString("name").takeIf { it.isNotBlank() }
                ?: throw IOException("Resposta de autenticação inválida")

            RemoteDriver(
                cpf = cpf,
                name = name,
                phone = driverJson.optNullableString("phone"),
                email = driverJson.optNullableString("email"),
                address = driverJson.optNullableString("address"),
                updatedAt = driverJson.optNullableString("updatedAt")?.toDateOrNull()
            )
        }

        val guardian = json.optJSONObject("guardian")?.let { guardianJson ->
            val cpf = guardianJson.optString("cpf").takeIf { it.isNotBlank() }
                ?: throw IOException("Resposta de autenticação inválida")
            val name = guardianJson.optString("name").takeIf { it.isNotBlank() }
                ?: throw IOException("Resposta de autenticação inválida")

            RemoteGuardian(
                cpf = cpf,
                name = name,
                kinship = guardianJson.optNullableString("kinship"),
                birthDate = guardianJson.optNullableString("birthDate")?.toDateOrNull(),
                spouseName = guardianJson.optNullableString("spouseName"),
                address = guardianJson.optNullableString("address"),
                mobile = guardianJson.optNullableString("mobile"),
                landline = guardianJson.optNullableString("landline"),
                workAddress = guardianJson.optNullableString("workAddress"),
                workPhone = guardianJson.optNullableString("workPhone"),
                updatedAt = guardianJson.optNullableString("updatedAt")?.toDateOrNull()
            )
        }

        return RemoteLoginPayload(
            role = role,
            driver = driver,
            guardian = guardian,
            syncedAt = json.optNullableString("syncedAt")?.toDateOrNull(),
            token = token
        )
    }

    data class RemoteLoginPayload(
        val role: UserRole,
        val driver: RemoteDriver?,
        val guardian: RemoteGuardian?,
        val syncedAt: Date?,
        val token: String?
    )

    data class RemoteDriver(
        val cpf: String,
        val name: String,
        val phone: String?,
        val email: String?,
        val address: String?,
        val updatedAt: Date?
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
        val workPhone: String?,
        val updatedAt: Date?
    )

    class InvalidCredentialsException : Exception()
    class NotFoundException : Exception()
    class PasswordResetNotFoundException : Exception()

    companion object {
        private val DATE_PATTERNS = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd"
        )
    }

    private fun JSONObject.optNullableString(key: String): String? {
        if (isNull(key)) return null
        val value = optString(key, "").trim()
        if (value.isEmpty() || value.equals("null", ignoreCase = true)) return null
        return value
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
}
