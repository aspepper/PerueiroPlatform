package com.softwareinc.perueiroapp.ui.screens.login

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.ui.components.FormTextField
import com.softwareinc.perueiroapp.ui.components.ScreenScaffold
import kotlinx.coroutines.launch

@Composable
fun ChangePasswordScreen(
    cpf: String,
    onPasswordChanged: () -> Unit,
    onBack: () -> Unit,
    changePassword: (String, String) -> Unit
) {
    ScreenScaffold(title = "Alterar senha", onBack = onBack) { padding, snackbar ->
        var password by remember { mutableStateOf("") }
        var confirmation by remember { mutableStateOf("") }
        val coroutineScope = rememberCoroutineScope()

        Column(modifier = Modifier.padding(padding).padding(24.dp)) {
            Text(text = "CPF: $cpf")
            Spacer(modifier = Modifier.height(16.dp))
            FormTextField(
                value = password,
                onValueChange = { password = it },
                label = "Nova senha",
                visualTransformation = PasswordVisualTransformation()
            )
            Spacer(modifier = Modifier.height(12.dp))
            FormTextField(
                value = confirmation,
                onValueChange = { confirmation = it },
                label = "Confirmar senha",
                visualTransformation = PasswordVisualTransformation()
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = {
                    if (password.length < 6) {
                        coroutineScope.launch { snackbar.showSnackbar("A senha deve ter pelo menos 6 caracteres") }
                    } else if (password != confirmation) {
                        coroutineScope.launch { snackbar.showSnackbar("As senhas não conferem") }
                    } else {
                        changePassword(cpf, password)
                        onPasswordChanged()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Salvar")
            }
        }
    }
}
