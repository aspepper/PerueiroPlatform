package com.idealinspecao.perueiroapp.ui.screens.management

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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.data.local.DriverEntity
import com.idealinspecao.perueiroapp.data.local.VanEntity
import com.idealinspecao.perueiroapp.ui.components.ConfirmationDialog
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
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
    onBack: () -> Unit,
    onSave: (VanEntity) -> Unit
) {
    ScreenScaffold(
        title = if (van == null) "Nova van" else "Editar van",
        onBack = onBack
    ) { padding, snackbar ->
        var model by remember { mutableStateOf(van?.model ?: "") }
        var color by remember { mutableStateOf(van?.color ?: "") }
        var year by remember { mutableStateOf(van?.year ?: "") }
        var plate by remember { mutableStateOf(van?.plate ?: "") }
        val selectedDrivers = remember { mutableStateListOf<String>().apply {
            if (van != null) addAll(van.driverCpfs.split(',').map { it.trim() }.filter { it.isNotEmpty() })
        } }
        var showDriverDialog by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(model, { model = it }, "Modelo")
            FormTextField(color, { color = it }, "Cor")
            FormTextField(year, { year = it }, "Ano")
            FormTextField(plate, { plate = it }, "Placa")
            Button(onClick = { showDriverDialog = true }, modifier = Modifier.fillMaxWidth()) {
                Text(
                    if (selectedDrivers.isEmpty()) "Selecionar motoristas"
                    else "Motoristas selecionados: ${selectedDrivers.size}"
                )
            }
            if (selectedDrivers.isNotEmpty()) {
                Text(text = "Motoristas: ${selectedDrivers.joinToString(", ")}")
            }
            Button(
                onClick = {
                    if (model.isBlank() || plate.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("Informe modelo e placa") }
                    } else {
                        onSave(
                            VanEntity(
                                id = van?.id ?: 0,
                                model = model,
                                color = color,
                                year = year,
                                plate = plate,
                                driverCpfs = selectedDrivers.joinToString(", ")
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
