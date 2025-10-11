package com.idealinspecao.perueiroapp.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.userSessionDataStore by preferencesDataStore(name = "user_session")

data class UserSession(val cpf: String, val role: String)

class UserSessionDataSource(private val context: Context) {
    private val cpfKey = stringPreferencesKey("cpf")
    private val roleKey = stringPreferencesKey("role")

    val session: Flow<UserSession?> = context.userSessionDataStore.data.map { preferences ->
        val cpf = preferences[cpfKey]
        val role = preferences[roleKey]
        if (!cpf.isNullOrBlank() && !role.isNullOrBlank()) {
            UserSession(cpf = cpf, role = role)
        } else {
            null
        }
    }

    suspend fun setSession(cpf: String, role: String) {
        context.userSessionDataStore.edit { preferences ->
            preferences[cpfKey] = cpf
            preferences[roleKey] = role
        }
    }

    suspend fun clear() {
        context.userSessionDataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
