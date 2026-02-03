package com.softwareinc.perueiroapp.ui.screens.management

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
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.data.local.DriverEntity
import com.softwareinc.perueiroapp.data.local.VanEntity
import com.softwareinc.perueiroapp.data.local.VanLookupResult
import com.softwareinc.perueiroapp.data.local.VanSaveResult
import com.softwareinc.perueiroapp.model.UserRole
import com.softwareinc.perueiroapp.ui.components.ConfirmationDialog
import com.softwareinc.perueiroapp.ui.components.FormTextField
import com.softwareinc.perueiroapp.ui.components.InfoCard
import com.softwareinc.perueiroapp.ui.components.ScreenScaffold
import com.softwareinc.perueiroapp.viewmodel.LoggedUser
import kotlinx.coroutines.launch

@Composable
fun VanListScreen(
    vans: List<VanEntity>,
    onBack: () -> Unit,
    onAddVan: () -> Unit,
    onEditVan: (VanEntity) -> Unit,
    onDeleteVan: (VanEntity) -> Unit
) {
    ScreenScaffold(
        title = "Vans",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddVan) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar van")
            }
        }
    ) { padding, snackbar ->
        var vanToDelete by remember { mutableStateOf<VanEntity?>(null) }
        val coroutineScope = rememberCoroutineScope()

        if (vans.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhuma van cadastrada.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(vans, key = { it.id }) { van ->
                    InfoCard(
                        title = "${van.model} - ${van.plate}",
                        description = "Cor: ${van.color}\nAno: ${van.year}\nMotoristas: ${van.driverCpfs}",
                        onClick = { onEditVan(van) },
                        actions = {
                            IconButton(onClick = { onEditVan(van) }) {
                                Icon(Icons.Outlined.Edit, contentDescription = "Editar")
                            }
                            IconButton(onClick = { vanToDelete = van }) {
                                Icon(Icons.Outlined.Delete, contentDescription = "Remover")
                            }
                        }
                    )
                }
            }
        }

        vanToDelete?.let { van ->
            ConfirmationDialog(
                title = "Remover van?",
                message = "Confirma a exclusão da van ${van.plate}?",
                onConfirm = {
                    onDeleteVan(van)
                    coroutineScope.launch { snackbar.showSnackbar("Van removida") }
                    vanToDelete = null
                },
                onDismiss = { vanToDelete = null }
            )
        }
    }
}

@Composable
fun VanFormScreen(
    van: VanEntity?,
    drivers: List<DriverEntity>,
    loggedUser: LoggedUser?,
    onBack: () -> Unit,
    onLookupVan: suspend (String) -> VanLookupResult,
    onSave: suspend (VanEntity, String?, Boolean) -> VanSaveResult
) {
    ScreenScaffold(
        title = if (van == null) "Nova van" else "Editar van",
        onBack = onBack
    ) { padding, snackbar ->
        val coroutineScope = rememberCoroutineScope()
        val isEditing = van != null
        val loggedDriverCpf = loggedUser?.takeIf { it.role == UserRole.DRIVER }?.cpf
        val isDriverLogged = loggedDriverCpf != null

        var vanId by remember(van?.id) { mutableStateOf(van?.id ?: 0L) }
        var model by remember(van?.id) { mutableStateOf(van?.model ?: "") }
        var color by remember(van?.id) { mutableStateOf(van?.color ?: "") }
        var year by remember(van?.id) { mutableStateOf(van?.year ?: "") }
        var plate by remember(van?.id) { mutableStateOf(van?.plate ?: "") }
        var city by remember(van?.id) { mutableStateOf(van?.city ?: "") }
        var billingDay by remember(van?.id) { mutableStateOf(van?.billingDay?.toString() ?: "5") }
        var monthlyFee by remember(van?.id) { mutableStateOf(van?.monthlyFee?.toString() ?: "0") }
        val selectedDrivers = remember(van?.id, loggedDriverCpf) {
            mutableStateListOf<String>().apply {
                val existing = van?.driverCpfs
                    ?.split(',')
                    ?.map { it.trim() }
                    ?.filter { it.isNotEmpty() }
                    ?.distinct()
                    ?: emptyList()
                if (loggedDriverCpf != null) {
                    add(loggedDriverCpf)
                } else {
                    addAll(existing)
                }
            }
        }
        var showDriverDialog by remember { mutableStateOf(false) }
        var isPlateValidated by remember { mutableStateOf(isEditing) }
        var isExistingVan by remember { mutableStateOf(van?.id?.let { it > 0 } ?: false) }
        var isLookupInProgress by remember { mutableStateOf(false) }
        var lookupStatusMessage by remember { mutableStateOf<String?>(null) }
        var lastSearchedPlate by remember(van?.id) { mutableStateOf(van?.plate?.trim()?.uppercase()) }
        var isSaving by remember { mutableStateOf(false) }
        var submissionError by remember { mutableStateOf<String?>(null) }

        suspend fun performLookup(force: Boolean) {
            val normalizedPlate = plate.trim().uppercase()
            val plateDigits = normalizedPlate.filter { it.isLetterOrDigit() }
            if (plateDigits.length < 7) return
            if (!force && normalizedPlate == lastSearchedPlate) return

            isLookupInProgress = true
            lookupStatusMessage = null
            submissionError = null

            try {
                val result = onLookupVan(normalizedPlate)
                val fetched = result.van
                if (fetched != null) {
                    if (fetched.id != 0L) {
                        vanId = fetched.id
                    }
                    model = fetched.model
                    color = fetched.color
                    year = fetched.year
                    plate = fetched.plate
                    city = fetched.city ?: ""
                    billingDay = fetched.billingDay.toString()
                    monthlyFee = fetched.monthlyFee.toString()
                    selectedDrivers.clear()
                    if (isDriverLogged && loggedDriverCpf != null) {
                        selectedDrivers.add(loggedDriverCpf)
                    } else {
                        selectedDrivers.addAll(
                            fetched.driverCpfs.split(',')
                                .map { it.trim() }
                                .filter { it.isNotEmpty() }
                                .distinct()
                        )
                    }
                    lookupStatusMessage = "Van encontrada. Dados carregados."
                    isExistingVan = true
                } else {
                    if (!isEditing) {
                        vanId = 0
                        if (!force) {
                            model = ""
                            color = ""
                            year = ""
                        }
                    }
                    selectedDrivers.clear()
                    if (isDriverLogged && loggedDriverCpf != null) {
                        selectedDrivers.add(loggedDriverCpf)
                    }
                    lookupStatusMessage = "Placa liberada para novo cadastro."
                    isExistingVan = false
                }
                isPlateValidated = true
                lastSearchedPlate = normalizedPlate
            } catch (exception: Exception) {
                isPlateValidated = false
                lastSearchedPlate = null
                lookupStatusMessage = null
                snackbar.showSnackbar("Não foi possível consultar a placa. Tente novamente.")
            } finally {
                isLookupInProgress = false
            }
        }

        val normalizedPlate = plate.trim().uppercase()
        val plateDigits = normalizedPlate.filter { it.isLetterOrDigit() }

        LaunchedEffect(normalizedPlate) {
            if (!isEditing && plateDigits.length >= 7 && normalizedPlate != lastSearchedPlate && !isLookupInProgress) {
                performLookup(force = false)
            }
        }

        val fieldsEnabled = isEditing || isPlateValidated
        val driverLabels = selectedDrivers.map { cpf ->
            drivers.firstOrNull { it.cpf == cpf }?.let { "${it.name} (${it.cpf})" } ?: cpf
        }

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(
                value = plate,
                onValueChange = {
                    plate = it.uppercase()
                    isPlateValidated = false
                    lookupStatusMessage = null
                    submissionError = null
                },
                label = "Placa",
                enabled = !isSaving
            )
            OutlinedButton(
                onClick = {
                    coroutineScope.launch { performLookup(force = true) }
                },
                enabled = plateDigits.length >= 7 && !isLookupInProgress && !isSaving,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Consultar placa")
            }
            if (isLookupInProgress) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            lookupStatusMessage?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            if (isExistingVan) {
                Text(
                    text = "Van já cadastrada. Você pode atualizar os dados.",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            FormTextField(
                value = model,
                onValueChange = {
                    model = it
                    submissionError = null
                },
                label = "Modelo",
                enabled = fieldsEnabled && !isSaving
            )
            FormTextField(
                value = color,
                onValueChange = { color = it },
                label = "Cor",
                enabled = fieldsEnabled && !isSaving
            )
            FormTextField(
                value = year,
                onValueChange = { year = it },
                label = "Ano",
                enabled = fieldsEnabled && !isSaving
            )
            FormTextField(
                value = city,
                onValueChange = { city = it },
                label = "Cidade",
                enabled = fieldsEnabled && !isSaving
            )
            FormTextField(
                value = billingDay,
                onValueChange = { billingDay = it },
                label = "Dia de vencimento",
                enabled = fieldsEnabled && !isSaving
            )
            FormTextField(
                value = monthlyFee,
                onValueChange = { monthlyFee = it },
                label = "Mensalidade (R$)",
                enabled = fieldsEnabled && !isSaving
            )
            if (isDriverLogged) {
                val driverName = drivers.firstOrNull { it.cpf == loggedDriverCpf }?.name
                Text(
                    text = buildString {
                        append("Motorista responsável: ")
                        append(driverName ?: loggedDriverCpf ?: "")
                    },
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                Button(
                    onClick = { showDriverDialog = true },
                    enabled = fieldsEnabled && !isSaving,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        if (selectedDrivers.isEmpty()) "Selecionar motoristas"
                        else "Motoristas selecionados: ${selectedDrivers.size}"
                    )
                }
            }
            if (driverLabels.isNotEmpty()) {
                Text(text = "Motoristas: ${driverLabels.joinToString(", ")}")
            }
            submissionError?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            Button(
                onClick = {
                    coroutineScope.launch {
                        if (model.isBlank() || plateDigits.length < 7) {
                            snackbar.showSnackbar("Informe modelo e placa válidos")
                            return@launch
                        }
                        isSaving = true
                        submissionError = null
                        try {
                            val parsedBillingDay = billingDay.trim().toIntOrNull() ?: 5
                            val parsedMonthlyFee = monthlyFee.trim().replace(',', '.').toDoubleOrNull() ?: 0.0
                            val entity = VanEntity(
                                id = if (vanId > 0) vanId else 0,
                                model = model,
                                color = color,
                                year = year,
                                plate = normalizedPlate,
                                driverCpfs = selectedDrivers.joinToString(", "),
                                city = city.takeIf { it.isNotBlank() },
                                billingDay = parsedBillingDay,
                                monthlyFee = parsedMonthlyFee
                            )
                            val result = onSave(
                                entity,
                                loggedDriverCpf,
                                isDriverLogged
                            )
                            val message = when (result) {
                                is VanSaveResult.Pending -> "Van salva offline. Sincronizaremos quando possível."
                                is VanSaveResult.Synced -> if (isDriverLogged) {
                                    "Van sincronizada com sucesso."
                                } else {
                                    "Van salva com sucesso."
                                }
                            }
                            snackbar.showSnackbar(message)
                            onBack()
                        } catch (exception: Exception) {
                            submissionError = exception.message
                                ?: "Não foi possível salvar a van. Tente novamente."
                        } finally {
                            isSaving = false
                        }
                    }
                },
                enabled = fieldsEnabled && !isLookupInProgress && !isSaving,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isSaving) "Salvando..." else "Salvar")
            }
        }

        if (showDriverDialog) {
            DriverSelectionDialog(
                drivers = drivers,
                selected = selectedDrivers,
                onDismiss = { showDriverDialog = false }
            )
        }
    }
}

@Composable
private fun DriverSelectionDialog(
    drivers: List<DriverEntity>,
    selected: MutableList<String>,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Selecionar motoristas") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                drivers.forEach { driver ->
                    val isSelected = selected.contains(driver.cpf)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isSelected, onCheckedChange = { checked ->
                            if (checked) {
                                if (!selected.contains(driver.cpf)) selected.add(driver.cpf)
                            } else {
                                selected.remove(driver.cpf)
                            }
                        })
                        Text(text = "${driver.name} (${driver.cpf})")
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text("Concluir")
            }
        }
    )
}
