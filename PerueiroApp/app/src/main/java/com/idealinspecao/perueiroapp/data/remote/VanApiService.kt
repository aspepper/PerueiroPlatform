package com.idealinspecao.perueiroapp.data.remote

import com.idealinspecao.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class VanApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val vansUrl: String = RemoteApiConfig.vansUrl
) {

    suspend fun findVan(plate: String): RemoteVan? {
        return withContext(Dispatchers.IO) {
            val normalizedPlate = plate.trim().uppercase()
            if (normalizedPlate.isEmpty()) return@withContext null

            val requestUrl = vansUrl
                .toHttpUrl()
                .newBuilder()
                .addPathSegment(normalizedPlate)
                .build()
                .toString()

            val request = Request.Builder()
                .url(requestUrl)
                .withApiKey()
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                when (response.code) {
                    HTTP_OK -> {
                        val body = response.body?.string()?.takeIf { it.isNotBlank() }
                            ?: throw IOException("Resposta vazia ao buscar van")
                        return@withContext parseVan(body)
                    }

                    HTTP_NOT_FOUND -> null
                    else -> throw IOException("Falha ao buscar van: HTTP ${response.code}")
                }
            }
        }
    }

    suspend fun upsertVan(payload: VanPayload): RemoteVan {
        return withContext(Dispatchers.IO) {
            val normalizedPlate = payload.plate.trim().uppercase()
            if (normalizedPlate.isEmpty()) {
                throw IOException("Placa inválida para sincronização")
            }

            val payloadJson = buildPayload(payload.copy(plate = normalizedPlate))
            val payloadString = payloadJson.toString()

            val updateId = payload.id
            if (updateId != null) {
                return@withContext updateVan(updateId, payloadString, normalizedPlate)
            }

            try {
                return@withContext createVan(payloadString)
            } catch (conflict: HttpConflictException) {
                val existing = findVan(normalizedPlate)
                    ?: throw IOException("Van em conflito não encontrada para atualização", conflict)
                return@withContext updateVan(existing.id ?: throw IOException("Van sem identificador remoto"), payloadString, normalizedPlate)
            }
        }
    }

    private fun createVan(payloadString: String): RemoteVan {
        val request = Request.Builder()
            .url(vansUrl)
            .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)
            .post(payloadString.toRequestBody(JSON_MEDIA_TYPE))
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            when (response.code) {
                HTTP_OK, HTTP_CREATED -> {
                    val body = response.body?.string()?.takeIf { it.isNotBlank() }
                    return if (body != null) {
                        parseVan(body)
                    } else {
                        throw IOException("Resposta vazia ao criar van")
                    }
                }

                HTTP_CONFLICT -> throw HttpConflictException()
                else -> throw IOException("Falha ao criar van: HTTP ${response.code}")
            }
        }
    }

    private fun updateVan(remoteId: Long, payloadString: String, plate: String): RemoteVan {
        val updateUrl = vansUrl
            .toHttpUrl()
            .newBuilder()
            .addPathSegment(remoteId.toString())
            .build()
            .toString()

        val request = Request.Builder()
            .url(updateUrl)
            .addHeader("Content-Type", JSON_MEDIA_TYPE_STRING)
            .method("PUT", payloadString.toRequestBody(JSON_MEDIA_TYPE))
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            when (response.code) {
                HTTP_OK, HTTP_CREATED -> {
                    val body = response.body?.string()?.takeIf { it.isNotBlank() }
                    return if (body != null) {
                        parseVan(body)
                    } else {
                        findVan(plate)
                            ?: throw IOException("Não foi possível confirmar atualização da van")
                    }
                }

                HTTP_NO_CONTENT -> {
                    return findVan(plate)
                        ?: RemoteVan(
                            id = remoteId,
                            model = "",
                            color = null,
                            year = null,
                            plate = plate,
                            driverCpf = null
                        )
                }

                HTTP_NOT_FOUND -> {
                    return createVan(payloadString)
                }

                else -> throw IOException("Falha ao atualizar van: HTTP ${response.code}")
            }
        }
    }

    private fun buildPayload(payload: VanPayload): JSONObject {
        val json = JSONObject()
        payload.id?.let { json.put("id", it) }
        json.put("model", payload.model)
        json.putNullable("color", payload.color)
        json.putNullable("year", payload.year)
        json.put("plate", payload.plate)
        json.putNullable("driverCpf", payload.driverCpf)
        return json
    }

    private fun parseVan(body: String): RemoteVan {
        val json = JSONObject(body)
        val vanJson = when {
            json.has("van") -> json.optJSONObject("van") ?: json
            json.has("data") -> json.optJSONObject("data") ?: json
            else -> json
        }

        val plate = vanJson.optString("plate").trim()
        val model = vanJson.optString("model").trim()
        if (plate.isEmpty() || model.isEmpty()) {
            throw IOException("Resposta inválida ao processar van")
        }

        val driverCpf = when {
            vanJson.has("driverCpf") -> vanJson.optNullableString("driverCpf")
            vanJson.has("driver") -> vanJson.optJSONObject("driver")?.optString("cpf")?.takeIf { it.isNotBlank() }
            else -> null
        }

        return RemoteVan(
            id = vanJson.optLongFromAny("id"),
            model = model,
            color = vanJson.optNullableString("color"),
            year = vanJson.optNullableString("year"),
            plate = plate,
            driverCpf = driverCpf
        )
    }

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

    private fun JSONObject.putNullable(key: String, value: String?) {
        if (value.isNullOrBlank()) {
            put(key, JSONObject.NULL)
        } else {
            put(key, value.trim())
        }
    }

    data class RemoteVan(
        val id: Long?,
        val model: String,
        val color: String?,
        val year: String?,
        val plate: String,
        val driverCpf: String?
    )

    data class VanPayload(
        val id: Long?,
        val model: String,
        val color: String?,
        val year: String?,
        val plate: String,
        val driverCpf: String?
    )

    private class HttpConflictException : IOException()

    companion object {
        private const val JSON_MEDIA_TYPE_STRING = RemoteApiConfig.jsonMediaTypeString
        private val JSON_MEDIA_TYPE = RemoteApiConfig.jsonMediaType
        private const val HTTP_OK = 200
        private const val HTTP_CREATED = 201
        private const val HTTP_NO_CONTENT = 204
        private const val HTTP_NOT_FOUND = 404
        private const val HTTP_CONFLICT = 409
    }
}
