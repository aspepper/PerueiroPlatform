package com.softwareinc.perueiroapp.data.remote

import com.softwareinc.perueiroapp.data.local.DriverEntity
import com.softwareinc.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class DriverApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val driversUrl: String = RemoteApiConfig.driversUrl
) {

    suspend fun syncDriver(driver: DriverEntity, alreadyExists: Boolean) {
        withContext(Dispatchers.IO) {
            val payload = buildPayload(driver)
            val payloadString = payload.toString()
            val mediaType = JSON_MEDIA_TYPE

            val driverUrl = buildDriverUrl(driver.cpf)
            val requestBuilder = Request.Builder()
                .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)

            val request = if (alreadyExists) {
                requestBuilder
                    .url(driverUrl)
                    .method("PUT", payloadString.toRequestBody(mediaType))
                    .withApiKey()
                    .build()
            } else {
                requestBuilder
                    .url(driversUrl)
                    .post(payloadString.toRequestBody(mediaType))
                    .withApiKey()
                    .build()
            }

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) return@withContext

                if (!alreadyExists && response.code == HTTP_CONFLICT) {
                    val updateRequest = Request.Builder()
                        .url(driverUrl)
                        .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)
                        .method("PUT", payloadString.toRequestBody(mediaType))
                        .withApiKey()
                        .build()

                    client.newCall(updateRequest).execute().use { updateResponse ->
                        if (updateResponse.isSuccessful) return@withContext

                        if (updateResponse.code == HTTP_NOT_FOUND) {
                            createDriver(payloadString)
                            return@withContext
                        }

                        throw IOException("Falha ao sincronizar motorista: HTTP ${updateResponse.code}")
                    }
                } else if (alreadyExists && response.code == HTTP_NOT_FOUND) {
                    val createRequest = Request.Builder()
                        .url(driversUrl)
                        .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)
                        .post(payloadString.toRequestBody(mediaType))
                        .withApiKey()
                        .build()

                    client.newCall(createRequest).execute().use { createResponse ->
                        if (createResponse.isSuccessful) return@withContext
                        throw IOException("Falha ao sincronizar motorista: HTTP ${createResponse.code}")
                    }
                } else {
                    throw IOException("Falha ao sincronizar motorista: HTTP ${response.code}")
                }

                if (alreadyExists && response.code == HTTP_NOT_FOUND) {
                    createDriver(payloadString)
                    return@withContext
                }

                throw IOException("Falha ao sincronizar motorista: HTTP ${response.code}")
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
        json.put("password", driver.password)
        return json
    }

    private fun JSONObject.putNullable(key: String, value: String?) {
        if (value.isNullOrBlank()) {
            put(key, JSONObject.NULL)
        } else {
            put(key, value.trim())
        }
    }

    private fun buildDriverUrl(cpf: String): String {
        return driversUrl
            .toHttpUrl()
            .newBuilder()
            .addPathSegment(cpf.trim())
            .build()
            .toString()
    }

    private fun createDriver(payloadString: String) {
        val request = Request.Builder()
            .url(driversUrl)
            .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)
            .post(payloadString.toRequestBody(JSON_MEDIA_TYPE))
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao sincronizar motorista: HTTP ${response.code}")
            }
        }
    }

    companion object {
        private const val JSON_MEDIA_TYPE_STRING = RemoteApiConfig.jsonMediaTypeString
        private val JSON_MEDIA_TYPE = RemoteApiConfig.jsonMediaType
        private const val HTTP_CONFLICT = 409
        private const val HTTP_NOT_FOUND = 404
    }
}
