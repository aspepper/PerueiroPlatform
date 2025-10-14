package com.idealinspecao.perueiroapp.data.remote

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class SyncApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val baseUrl: String = DEFAULT_BASE_URL
) {

    suspend fun fetchSchools(): List<RemoteSchool> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl/schools")
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao carregar escolas: HTTP ${response.code}")
            }

            val body = response.body?.string() ?: throw IOException("Resposta vazia ao carregar escolas")
            val json = JSONObject(body)
            val schoolsArray = json.optJSONArray("schools") ?: JSONArray()

            buildList {
                for (index in 0 until schoolsArray.length()) {
                    val item = schoolsArray.optJSONObject(index) ?: continue
                    add(
                        RemoteSchool(
                            id = item.optNullableString("id")?.toLongOrNull(),
                            name = item.optNullableString("name") ?: continue,
                            address = item.optNullableString("address"),
                            phone = item.optNullableString("phone"),
                            contact = item.optNullableString("contact"),
                            principal = item.optNullableString("principal"),
                            doorman = item.optNullableString("doorman")
                        )
                    )
                }
            }
        }
    }

    suspend fun fetchBlacklistedGuardians(): List<String> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl/students")
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao carregar lista negra: HTTP ${response.code}")
            }

            val body = response.body?.string() ?: throw IOException("Resposta vazia ao carregar lista negra")
            val json = JSONObject(body)
            val studentsArray = json.optJSONArray("students") ?: JSONArray()

            buildSet {
                for (index in 0 until studentsArray.length()) {
                    val item = studentsArray.optJSONObject(index) ?: continue
                    if (!item.optBoolean("blacklist", false)) continue

                    val guardianCpf = item.optNullableString("guardianCpf") ?: continue
                    add(guardianCpf)
                }
            }.toList()
        }
    }

    data class RemoteSchool(
        val id: Long?,
        val name: String,
        val address: String?,
        val phone: String?,
        val contact: String?,
        val principal: String?,
        val doorman: String?
    )

    private fun JSONObject.optNullableString(key: String): String? {
        if (isNull(key)) return null
        val value = optString(key, "").trim()
        if (value.isEmpty() || value.equals("null", ignoreCase = true)) return null
        return value
    }

    companion object {
        private const val DEFAULT_BASE_URL = "https://icy-water-08508ba0f.2.azurestaticapps.net/api"
    }
}
