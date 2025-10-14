package com.idealinspecao.perueiroapp.data.remote

import com.idealinspecao.perueiroapp.data.local.DriverEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class DriverApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val baseUrl: String = DEFAULT_BASE_URL
) {

    suspend fun syncDriver(driver: DriverEntity, alreadyExists: Boolean) {
        withContext(Dispatchers.IO) {
            val payload = buildPayload(driver)
            val payloadString = payload.toString()
            val mediaType = JSON_MEDIA_TYPE

            val requestBuilder = Request.Builder()
                .url(if (alreadyExists) "$baseUrl/${driver.cpf}" else baseUrl)
                .header("Content-Type", JSON_MEDIA_TYPE_STRING)

            val request = if (alreadyExists) {
                requestBuilder.put(payloadString.toRequestBody(mediaType)).build()
            } else {
                requestBuilder.post(payloadString.toRequestBody(mediaType)).build()
            }

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) return@withContext

                if (!alreadyExists && response.code == HTTP_CONFLICT) {
                    val updateRequest = Request.Builder()
                        .url("$baseUrl/${driver.cpf}")
                        .header("Content-Type", JSON_MEDIA_TYPE_STRING)
                        .put(payloadString.toRequestBody(mediaType))
                        .build()

                    client.newCall(updateRequest).execute().use { updateResponse ->
                        if (updateResponse.isSuccessful) return@withContext
                        throw IOException("Falha ao sincronizar motorista: HTTP ${updateResponse.code}")
                    }
                } else {
                    throw IOException("Falha ao sincronizar motorista: HTTP ${response.code}")
                }
            }
        }
    }

    private fun buildPayload(driver: DriverEntity): JSONObject {
        val json = JSONObject()
        json.put("cpf", driver.cpf)
        json.put("name", driver.name)
        json.put("cnh", JSONObject.NULL)
        json.putNullable("phone", driver.phone)
        json.putNullable("email", driver.email)
        return json
    }

    private fun JSONObject.putNullable(key: String, value: String?) {
        if (value.isNullOrBlank()) {
            put(key, JSONObject.NULL)
        } else {
            put(key, value.trim())
        }
    }

    companion object {
        private const val DEFAULT_BASE_URL = "https://icy-water-08508ba0f.2.azurestaticapps.net/api/drivers"
        private const val JSON_MEDIA_TYPE_STRING = "application/json; charset=utf-8"
        private val JSON_MEDIA_TYPE = JSON_MEDIA_TYPE_STRING.toMediaType()
        private const val HTTP_CONFLICT = 409
    }
}
