package com.idealinspecao.perueiroapp.ui.screens.management

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.data.local.DriverEntity
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import kotlinx.coroutines.launch
import java.util.UUID

@Composable
fun DriverListScreen(
    drivers: List<DriverEntity>,
    onBack: () -> Unit,
    onAddDriver: () -> Unit,
    onEditDriver: (DriverEntity) -> Unit
) {
    ScreenScaffold(
        title = "Motoristas",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddDriver) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar motorista")
            }
        }
    ) { padding, _ ->
        if (drivers.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhum motorista cadastrado.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(drivers, key = { it.cpf }) { driver ->
                    InfoCard(
                        title = driver.name,
                        description = "CPF: ${driver.cpf}\nTelefone: ${driver.phone}",
                        onClick = { onEditDriver(driver) }
                    )
                }
            }
        }
    }
}

@Composable
fun DriverFormScreen(
    driver: DriverEntity?,
    onBack: () -> Unit,
    onSave: (DriverEntity) -> Unit
) {
    ScreenScaffold(
        title = if (driver == null) "Novo motorista" else "Editar motorista",
        onBack = onBack
    ) { padding, snackbar ->
        var cpf by remember { mutableStateOf(driver?.cpf ?: "") }
        var name by remember { mutableStateOf(driver?.name ?: "") }
        var birthDate by remember { mutableStateOf(driver?.birthDate ?: "") }
        var address by remember { mutableStateOf(driver?.address ?: "") }
        var phone by remember { mutableStateOf(driver?.phone ?: "") }
        var workPhone by remember { mutableStateOf(driver?.workPhone ?: "") }
        var email by remember { mutableStateOf(driver?.email ?: "") }
        var password by remember { mutableStateOf(driver?.password ?: UUID.randomUUID().toString().take(6)) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(cpf, { cpf = it }, "CPF")
            FormTextField(name, { name = it }, "Nome")
            FormTextField(birthDate, { birthDate = it }, "Data de nascimento")
            FormTextField(address, { address = it }, "Endereço")
            FormTextField(phone, { phone = it }, "Telefone")
            FormTextField(workPhone, { workPhone = it }, "Telefone trabalho")
            FormTextField(email, { email = it }, "E-mail")
            FormTextField(password, { password = it }, "Senha de acesso")
            Button(
                onClick = {
                    if (cpf.isBlank() || name.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("CPF e nome são obrigatórios") }
                    } else {
                        onSave(
                            DriverEntity(
                                cpf = cpf,
                                name = name,
                                birthDate = birthDate,
                                address = address,
                                phone = phone,
                                workPhone = workPhone.takeIf { it.isNotBlank() },
                                email = email,
                                password = password
                            )
                        )
                        onBack()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Salvar")
            }
        }
    }
}
