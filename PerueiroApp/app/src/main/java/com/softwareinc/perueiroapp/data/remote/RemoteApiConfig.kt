package com.softwareinc.perueiroapp.data.remote

import com.softwareinc.perueiroapp.BuildConfig
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request

object RemoteApiConfig {
    private const val DEFAULT_JSON_MEDIA_TYPE = "application/json; charset=utf-8"

    val baseUrl: String = BuildConfig.REMOTE_API_BASE_URL.trimEnd('/')

    val driversUrl: String = "$baseUrl/drivers"
    val vansUrl: String = "$baseUrl/vans"
    val guardiansUrl: String = "$baseUrl/clients"
    val syncPullUrl: String = "$baseUrl/sync/pull"
    val syncPushUrl: String = "$baseUrl/sync/push"
    val mobileLoginUrl: String = "$baseUrl/mobile/login"
    val forgotPasswordUrl: String = "$baseUrl/mobile/forgot-password"

    const val jsonMediaTypeString: String = DEFAULT_JSON_MEDIA_TYPE
    val jsonMediaType = DEFAULT_JSON_MEDIA_TYPE.toMediaType()

    private val apiKey: String = BuildConfig.REMOTE_API_KEY

    fun Request.Builder.withApiKey(): Request.Builder {
        if (apiKey.isNotBlank()) {
            addHeader("x-api-key", apiKey)
        }
        return this
    }

    fun HttpUrl.Builder.withApiKey(): HttpUrl.Builder {
        if (apiKey.isNotBlank()) {
            addQueryParameter("apiKey", apiKey)
        }
        return this
    }
}
