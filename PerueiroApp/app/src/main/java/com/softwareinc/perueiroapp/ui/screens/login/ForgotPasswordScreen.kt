package com.softwareinc.perueiroapp.ui.screens.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.data.remote.PasswordResetResult
import com.softwareinc.perueiroapp.ui.components.ScreenScaffold
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(
    onBack: () -> Unit,
    requestPasswordReset: suspend (String, String) -> PasswordResetResult
) {
    ScreenScaffold(title = "Recuperar senha", onBack = onBack) { paddingValues, snackbarHostState ->
        var cpf by remember { mutableStateOf("") }
        var email by remember { mutableStateOf("") }
        var isSubmitting by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Informe o CPF e o e-mail cadastrados para receber o link de redefinição de senha.",
                style = MaterialTheme.typography.bodyMedium
            )

            OutlinedTextField(
                value = cpf,
                onValueChange = { cpf = it },
                label = { Text("CPF") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("E-mail") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    if (isSubmitting) return@Button
                    coroutineScope.launch {
                        isSubmitting = true
                        val result = try {
                            requestPasswordReset(cpf, email)
                        } finally {
                            isSubmitting = false
                        }

                        val message = when (result) {
                            PasswordResetResult.Success -> {
                                "Se os dados estiverem corretos, você receberá um e-mail com instruções para redefinir a senha."
                            }
                            PasswordResetResult.NotFound -> {
                                "Não encontramos nenhum cadastro com os dados informados."
                            }
                            is PasswordResetResult.Failure -> result.message
                        }

                        snackbarHostState.showSnackbar(message)

                        if (result is PasswordResetResult.Success) {
                            onBack()
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = cpf.isNotBlank() && email.isNotBlank() && !isSubmitting
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("Enviar instruções")
                }
            }
        }
    }
}
