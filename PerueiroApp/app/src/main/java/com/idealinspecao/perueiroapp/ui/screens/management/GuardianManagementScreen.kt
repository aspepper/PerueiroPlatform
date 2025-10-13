package com.idealinspecao.perueiroapp.ui.screens.management

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
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
import com.idealinspecao.perueiroapp.data.local.GuardianEntity
import com.idealinspecao.perueiroapp.ui.components.ConfirmationDialog
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import com.idealinspecao.perueiroapp.ui.components.SelectionDialog
import com.idealinspecao.perueiroapp.viewmodel.GuardianPendencies
import kotlinx.coroutines.launch
import java.util.UUID

@Composable
fun GuardianListScreen(
    guardians: List<GuardianEntity>,
    onBack: () -> Unit,
    onAddGuardian: () -> Unit,
    onEditGuardian: (GuardianEntity) -> Unit,
    onDeleteGuardian: (GuardianEntity) -> Unit
) {
    ScreenScaffold(
        title = "Responsáveis",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddGuardian) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar")
            }
        }
    ) { padding, snackbar ->
        var guardianToDelete by remember { mutableStateOf<GuardianEntity?>(null) }
        val coroutineScope = rememberCoroutineScope()

        if (guardians.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhum responsável cadastrado até o momento.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(guardians, key = { it.cpf }) { guardian ->
                    InfoCard(
                        title = guardian.name,
                        description = "CPF: ${guardian.cpf}\nTelefone: ${guardian.mobile}",
                        onClick = { onEditGuardian(guardian) },
                        actions = {
                            IconButton(onClick = { onEditGuardian(guardian) }) {
                                Icon(Icons.Outlined.Edit, contentDescription = "Editar")
                            }
                            IconButton(onClick = { guardianToDelete = guardian }) {
                                Icon(Icons.Outlined.Delete, contentDescription = "Remover")
                            }
                        }
                    )
                }
            }
        }

        guardianToDelete?.let { guardian ->
            ConfirmationDialog(
                title = "Remover responsável?",
                message = "Confirma a exclusão de ${guardian.name}?",
                onConfirm = {
                    onDeleteGuardian(guardian)
                    coroutineScope.launch { snackbar.showSnackbar("Responsável removido") }
                    guardianToDelete = null
                },
                onDismiss = { guardianToDelete = null }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuardianFormScreen(
    guardian: GuardianEntity?,
    onBack: () -> Unit,
    onSave: (GuardianEntity) -> Unit,
    onCheckPendencies: suspend (String) -> GuardianPendencies
) {
    ScreenScaffold(
        title = if (guardian == null) "Novo responsável" else "Editar responsável",
        onBack = onBack
    ) { padding, snackbar ->
        var cpf by remember { mutableStateOf(guardian?.cpf ?: "") }
        var name by remember { mutableStateOf(guardian?.name ?: "") }
        var kinship by remember { mutableStateOf(guardian?.kinship ?: "Pai") }
        var birthDate by remember { mutableStateOf(guardian?.birthDate ?: "") }
        var spouse by remember { mutableStateOf(guardian?.spouseName ?: "") }
        var address by remember { mutableStateOf(guardian?.address ?: "") }
        var mobile by remember { mutableStateOf(guardian?.mobile ?: "") }
        var landline by remember { mutableStateOf(guardian?.landline ?: "") }
        var workAddress by remember { mutableStateOf(guardian?.workAddress ?: "") }
        var workPhone by remember { mutableStateOf(guardian?.workPhone ?: "") }
        var email by remember { mutableStateOf(guardian?.email ?: "") }
        var password by remember { mutableStateOf(guardian?.password ?: UUID.randomUUID().toString().take(8)) }
        var mustChangePassword by remember { mutableStateOf(guardian?.mustChangePassword ?: true) }
        var pendingStatus by remember { mutableStateOf(guardian?.pendingStatus ?: "OK") }
        var pendingReasons by remember { mutableStateOf(guardian?.pendingReasons ?: "") }
        var pendingVans by remember { mutableStateOf(guardian?.pendingVans ?: "") }
        var isBlacklisted by remember { mutableStateOf(guardian?.isBlacklisted ?: false) }
        var showKinshipDialog by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(value = cpf, onValueChange = { cpf = it }, label = "CPF")
            FormTextField(value = name, onValueChange = { name = it }, label = "Nome")
            SelectionField(
                label = "Grau de parentesco",
                value = kinship,
                onClick = { showKinshipDialog = true }
            )
            FormTextField(value = birthDate, onValueChange = { birthDate = it }, label = "Data de nascimento")
            FormTextField(value = spouse, onValueChange = { spouse = it }, label = "Cônjuge")
            FormTextField(value = address, onValueChange = { address = it }, label = "Endereço")
            FormTextField(value = mobile, onValueChange = { mobile = it }, label = "Celular")
            FormTextField(value = landline, onValueChange = { landline = it }, label = "Telefone fixo")
            FormTextField(value = workAddress, onValueChange = { workAddress = it }, label = "Endereço de trabalho")
            FormTextField(value = workPhone, onValueChange = { workPhone = it }, label = "Telefone comercial")
            FormTextField(value = email, onValueChange = { email = it }, label = "E-mail")
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Senha: $password", modifier = Modifier.weight(1f))
                IconButton(onClick = { password = UUID.randomUUID().toString().take(8) }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Gerar senha")
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = mustChangePassword, onCheckedChange = { mustChangePassword = it })
                Text("Solicitar alteração da senha no primeiro acesso")
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = isBlacklisted, onCheckedChange = { isBlacklisted = it })
                Text("Responsável bloqueado")
            }
            FormTextField(value = pendingStatus, onValueChange = { pendingStatus = it }, label = "Status pendências")
            FormTextField(value = pendingReasons, onValueChange = { pendingReasons = it }, label = "Motivos das pendências")
            FormTextField(value = pendingVans, onValueChange = { pendingVans = it }, label = "Pendências por van")
            Button(
                onClick = {
                    if (cpf.isBlank() || name.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("CPF e nome são obrigatórios") }
                    } else {
                        onSave(
                            GuardianEntity(
                                cpf = cpf,
                                name = name,
                                kinship = kinship,
                                birthDate = birthDate,
                                spouseName = spouse,
                                address = address,
                                mobile = mobile,
                                landline = landline.takeIf { it.isNotBlank() },
                                workAddress = workAddress,
                                workPhone = workPhone.takeIf { it.isNotBlank() },
                                email = email,
                                password = password,
                                mustChangePassword = mustChangePassword,
                                pendingStatus = pendingStatus,
                                pendingReasons = pendingReasons,
                                pendingVans = pendingVans,
                                isBlacklisted = isBlacklisted
                            )
                        )
                        onBack()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Salvar")
            }
            Button(
                onClick = {
                    if (cpf.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("Informe um CPF para verificar") }
                    } else {
                        coroutineScope.launch {
                            val result = onCheckPendencies(cpf)
                            pendingStatus = result.status
                            pendingReasons = result.reasons.joinToString(", ")
                            pendingVans = result.vans.joinToString(", ")
                            if (result.status.equals("Bloqueado", true)) {
                                isBlacklisted = true
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Verificar pendências")
            }
        }

        if (showKinshipDialog) {
            SelectionDialog(
                title = "Grau de parentesco",
                items = listOf("Pai", "Mãe", "Avô", "Avó", "Responsável legal"),
                itemLabel = { it },
                onItemSelected = { kinship = it },
                onDismiss = { showKinshipDialog = false }
            )
        }
    }
}

@Composable
private fun SelectionField(label: String, value: String, onClick: () -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = {},
        readOnly = true,
        label = { Text(label) },
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        trailingIcon = {
            Icon(Icons.Default.ArrowDropDown, contentDescription = null)
        }
    )
}
