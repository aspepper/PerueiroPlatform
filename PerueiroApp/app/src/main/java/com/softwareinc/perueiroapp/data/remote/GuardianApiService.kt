package com.softwareinc.perueiroapp.data.remote

import com.softwareinc.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class GuardianApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val guardiansUrl: String = RemoteApiConfig.guardiansUrl
) {

    suspend fun findGuardian(cpf: String): RemoteGuardian? {
        return withContext(Dispatchers.IO) {
            val trimmedCpf = cpf.trim()
            if (trimmedCpf.isEmpty()) return@withContext null

            val guardianUrl = guardiansUrl
                .toHttpUrl()
                .newBuilder()
                .addPathSegment(trimmedCpf)
                .build()
                .toString()

            val request = Request.Builder()
                .url(guardianUrl)
                .withApiKey()
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                when (response.code) {
                    HTTP_OK -> {
                        val body = response.body?.string()?.takeIf { it.isNotBlank() }
                            ?: throw IOException("Resposta vazia ao buscar responsável")
                        val json = JSONObject(body)
                        val guardianJson = json.optJSONObject("client") ?: return@withContext null
                        return@withContext guardianJson.toRemoteGuardian()
                    }

                    HTTP_NOT_FOUND -> null
                    else -> throw IOException("Falha ao buscar responsável: HTTP ${response.code}")
                }
            }
        }
    }

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

    private fun JSONObject.toRemoteGuardian(): RemoteGuardian {
        val cpf = optString("cpf").trim()
        val name = optString("name").trim()
        if (cpf.isEmpty() || name.isEmpty()) {
            throw IOException("Resposta inválida ao buscar responsável")
        }

        return RemoteGuardian(
            cpf = cpf,
            name = name,
            kinship = optNullableString("kinship"),
            birthDate = optNullableString("birthDate")?.toDateOrNull(),
            spouseName = optNullableString("spouseName"),
            address = optNullableString("address"),
            mobile = optNullableString("mobile"),
            landline = optNullableString("landline"),
            workAddress = optNullableString("workAddress"),
            workPhone = optNullableString("workPhone"),
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

    companion object {
        private const val HTTP_OK = 200
        private const val HTTP_NOT_FOUND = 404
        private val DATE_PATTERNS = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd"
        )
    }
}
