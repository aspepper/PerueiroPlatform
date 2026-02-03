package com.softwareinc.perueiroapp.data.remote

import com.softwareinc.perueiroapp.data.remote.RemoteApiConfig.withApiKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class ContractApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val pendingUrl: String = RemoteApiConfig.contractsPendingUrl,
    private val signedUrl: String = RemoteApiConfig.contractsSignedUrl,
    private val sendUrl: String = RemoteApiConfig.contractsSendUrl,
    private val markPendingUrl: String = RemoteApiConfig.contractsMarkPendingUrl
) {
    suspend fun fetchPendingContracts(
        guardianCpf: String? = null,
        driverCpf: String? = null,
        vanId: Long? = null
    ): List<RemoteContract> = withContext(Dispatchers.IO) {
        fetchContracts(pendingUrl, guardianCpf, driverCpf, vanId)
    }

    suspend fun fetchSignedContracts(
        guardianCpf: String? = null,
        driverCpf: String? = null,
        vanId: Long? = null
    ): List<RemoteContract> = withContext(Dispatchers.IO) {
        fetchContracts(signedUrl, guardianCpf, driverCpf, vanId)
    }

    suspend fun sendContracts(contractIds: List<Long>): List<Long> = withContext(Dispatchers.IO) {
        if (contractIds.isEmpty()) return@withContext emptyList()
        val payload = JSONObject().apply {
            put(
                "contractIds",
                JSONArray().apply {
                    contractIds.forEach { put(it.toString()) }
                }
            )
        }

        val request = Request.Builder()
            .url(sendUrl)
            .addHeader("Content-Type", RemoteApiConfig.jsonMediaTypeString)
            .post(payload.toString().toRequestBody(RemoteApiConfig.jsonMediaType))
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao enviar contratos: HTTP ${response.code}")
            }

            val body = response.body?.string() ?: return@withContext emptyList()
            val json = JSONObject(body)
            val results = json.optJSONArray("results") ?: JSONArray()
            return@withContext buildList {
                for (index in 0 until results.length()) {
                    val item = results.optJSONObject(index) ?: continue
                    if (item.optBoolean("sent", false)) {
                        item.optString("contractId")?.toLongOrNull()?.let { add(it) }
                    }
                }
            }
        }
    }

    suspend fun markContractPending(contractId: Long, driverCpf: String) = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("contractId", contractId.toString())
            put("driverCpf", driverCpf)
        }

        val request = Request.Builder()
            .url(markPendingUrl)
            .addHeader("Content-Type", RemoteApiConfig.jsonMediaTypeString)
            .post(payload.toString().toRequestBody(RemoteApiConfig.jsonMediaType))
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao marcar contrato como pendente: HTTP ${response.code}")
            }
        }
    }

    private fun fetchContracts(
        baseUrl: String,
        guardianCpf: String?,
        driverCpf: String?,
        vanId: Long?
    ): List<RemoteContract> {
        val url = baseUrl
            .toHttpUrl()
            .newBuilder()
            .apply {
                guardianCpf?.takeIf { it.isNotBlank() }?.let { addQueryParameter("guardianCpf", it) }
                driverCpf?.takeIf { it.isNotBlank() }?.let { addQueryParameter("driverCpf", it) }
                vanId?.let { addQueryParameter("vanId", it.toString()) }
            }
            .withApiKey()
            .build()
            .toString()

        val request = Request.Builder()
            .url(url)
            .get()
            .withApiKey()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Falha ao buscar contratos: HTTP ${response.code}")
            }

            val body = response.body?.string() ?: throw IOException("Resposta vazia ao buscar contratos")
            val json = JSONObject(body)
            val contracts = json.optJSONArray("contracts") ?: JSONArray()
            return buildList {
                for (index in 0 until contracts.length()) {
                    val item = contracts.optJSONObject(index) ?: continue
                    val id = item.optString("id").trim()
                    val studentId = item.optString("studentId").trim()
                    val guardianCpfValue = item.optString("guardianCpf").trim()
                    val vanIdValue = item.optString("vanId").trim()
                    if (id.isEmpty() || studentId.isEmpty() || guardianCpfValue.isEmpty() || vanIdValue.isEmpty()) {
                        continue
                    }
                    add(
                        RemoteContract(
                            id = id.toLong(),
                            studentId = studentId.toLong(),
                            studentName = item.optString("studentName"),
                            guardianCpf = guardianCpfValue,
                            guardianName = item.optString("guardianName"),
                            vanId = vanIdValue.toLong(),
                            driverCpf = item.optNullableString("driverCpf"),
                            period = item.optString("period"),
                            startDate = item.optString("startDate"),
                            endDate = item.optString("endDate"),
                            billingDay = item.optInt("billingDay"),
                            rescissionFine = item.optDouble("rescissionFine"),
                            forumCity = item.optString("forumCity"),
                            pdfUrl = item.optNullableString("pdfUrl"),
                            signedPdfUrl = item.optNullableString("signedPdfUrl"),
                            signed = item.optBoolean("signed", false),
                            signedAt = item.optNullableString("signedAt"),
                            createdAt = item.optString("createdAt")
                        )
                    )
                }
            }
        }
    }

    data class RemoteContract(
        val id: Long,
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
        val pdfUrl: String?,
        val signedPdfUrl: String?,
        val signed: Boolean,
        val signedAt: String?,
        val createdAt: String
    )

    private fun JSONObject.optNullableString(key: String): String? {
        if (isNull(key)) return null
        val value = optString(key, "").trim()
        if (value.isEmpty() || value.equals("null", ignoreCase = true)) return null
        return value
    }
}
