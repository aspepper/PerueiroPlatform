package com.softwareinc.perueiroapp.data.remote

sealed interface PasswordResetResult {
    object Success : PasswordResetResult
    object NotFound : PasswordResetResult
    data class Failure(val message: String) : PasswordResetResult
}
