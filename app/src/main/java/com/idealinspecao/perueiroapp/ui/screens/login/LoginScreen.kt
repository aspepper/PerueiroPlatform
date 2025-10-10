package com.idealinspecao.perueiroapp.ui.screens.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.Row
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import com.idealinspecao.perueiroapp.ui.theme.IdealInspecaoTheme
import com.idealinspecao.perueiroapp.viewmodel.LoginOutcome
import com.idealinspecao.perueiroapp.viewmodel.UserRole
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onDriverLogged: (String) -> Unit,
    onGuardianLogged: (String) -> Unit,
    onChangePasswordRequired: (String) -> Unit,
    onRegisterDriver: () -> Unit,
    login: suspend (String, String, UserRole) -> LoginOutcome
) {
    ScreenScaffold(title = "Ideal Inspeção", onBack = null) { padding, snackbarHost ->
        var cpf by remember { mutableStateOf("") }
        var password by remember { mutableStateOf("") }
        var role by remember { mutableStateOf(UserRole.DRIVER) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "APP Ideal Inspeção",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))
            FormTextField(
                value = cpf,
                onValueChange = { cpf = it },
                label = "CPF",
                keyboardOptions = KeyboardOptions.Default
            )
            Spacer(modifier = Modifier.height(16.dp))
            FormTextField(
                value = password,
                onValueChange = { password = it },
                label = "Senha",
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions.Default
            )
            Spacer(modifier = Modifier.height(16.dp))

            Column(modifier = Modifier.fillMaxWidth()) {
                Text(text = "Entrar como:")
                RoleOption(
                    selected = role == UserRole.DRIVER,
                    label = "Motorista",
                    onClick = { role = UserRole.DRIVER }
                )
                RoleOption(
                    selected = role == UserRole.GUARDIAN,
                    label = "Responsável",
                    onClick = { role = UserRole.GUARDIAN }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = {
                    coroutineScope.launch {
                        when (val result = login(cpf.trim(), password, role)) {
                            is LoginOutcome.Driver -> onDriverLogged(result.driver.cpf)
                            is LoginOutcome.Guardian -> onGuardianLogged(result.guardian.cpf)
                            is LoginOutcome.MustChangePassword -> onChangePasswordRequired(result.cpf)
                            is LoginOutcome.Error -> snackbarHost.showSnackbar(result.message)
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = cpf.isNotBlank() && password.isNotBlank()
            ) {
                Text("Entrar")
            }

            if (role == UserRole.DRIVER) {
                Spacer(modifier = Modifier.height(8.dp))
                TextButton(onClick = onRegisterDriver) {
                    Text("Novo motorista? Cadastre-se")
                }
            }
        }
    }
}

@Composable
private fun RoleOption(selected: Boolean, label: String, onClick: () -> Unit) {
    RowWithRadio(selected = selected, label = label, onClick = onClick)
}

@Composable
private fun RowWithRadio(selected: Boolean, label: String, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.clickable(onClick = onClick).padding(vertical = 4.dp)
    ) {
        RadioButton(selected = selected, onClick = onClick)
        Text(text = label)
    }
}

@Preview
@Composable
private fun PreviewLogin() {
    IdealInspecaoTheme {
        LoginScreen(
            onDriverLogged = {},
            onGuardianLogged = {},
            onChangePasswordRequired = {},
            onRegisterDriver = {},
            login = { _, _, _ -> LoginOutcome.Error("") }
        )
    }
}
