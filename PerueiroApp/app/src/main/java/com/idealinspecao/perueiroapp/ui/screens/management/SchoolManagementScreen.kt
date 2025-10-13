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
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.idealinspecao.perueiroapp.data.local.SchoolEntity
import com.idealinspecao.perueiroapp.ui.components.ConfirmationDialog
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import kotlinx.coroutines.launch

@Composable
fun SchoolListScreen(
    schools: List<SchoolEntity>,
    onBack: () -> Unit,
    onAddSchool: () -> Unit,
    onEditSchool: (SchoolEntity) -> Unit,
    onDeleteSchool: (SchoolEntity) -> Unit
) {
    ScreenScaffold(
        title = "Escolas",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddSchool) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar escola")
            }
        }
    ) { padding, snackbar ->
        var schoolToDelete by remember { mutableStateOf<SchoolEntity?>(null) }
        val coroutineScope = rememberCoroutineScope()

        if (schools.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhuma escola cadastrada.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(schools, key = { it.id }) { school ->
                    InfoCard(
                        title = school.fantasyName,
                        description = "Razão social: ${school.corporateName}\nContato: ${school.contact}",
                        onClick = { onEditSchool(school) },
                        actions = {
                            IconButton(onClick = { onEditSchool(school) }) {
                                Icon(Icons.Outlined.Edit, contentDescription = "Editar")
                            }
                            IconButton(onClick = { schoolToDelete = school }) {
                                Icon(Icons.Outlined.Delete, contentDescription = "Remover")
                            }
                        }
                    )
                }
            }
        }

        schoolToDelete?.let { school ->
            ConfirmationDialog(
                title = "Remover escola?",
                message = "Confirma a exclusão de ${school.fantasyName}?",
                onConfirm = {
                    onDeleteSchool(school)
                    coroutineScope.launch { snackbar.showSnackbar("Escola removida") }
                    schoolToDelete = null
                },
                onDismiss = { schoolToDelete = null }
            )
        }
    }
}

@Composable
fun SchoolFormScreen(
    school: SchoolEntity?,
    onBack: () -> Unit,
    onSave: (SchoolEntity) -> Unit
) {
    ScreenScaffold(
        title = if (school == null) "Nova escola" else "Editar escola",
        onBack = onBack
    ) { padding, snackbar ->
        var fantasyName by remember { mutableStateOf(school?.fantasyName ?: "") }
        var corporateName by remember { mutableStateOf(school?.corporateName ?: "") }
        var address by remember { mutableStateOf(school?.address ?: "") }
        var phone by remember { mutableStateOf(school?.phone ?: "") }
        var contact by remember { mutableStateOf(school?.contact ?: "") }
        var principal by remember { mutableStateOf(school?.principal ?: "") }
        var doorman by remember { mutableStateOf(school?.doorman ?: "") }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(fantasyName, { fantasyName = it }, "Nome fantasia")
            FormTextField(corporateName, { corporateName = it }, "Razão social")
            FormTextField(address, { address = it }, "Endereço")
            FormTextField(phone, { phone = it }, "Telefone")
            FormTextField(contact, { contact = it }, "Contato")
            FormTextField(principal, { principal = it }, "Dirigente")
            FormTextField(doorman, { doorman = it }, "Nome do porteiro")
            Button(
                onClick = {
                    if (fantasyName.isBlank() || corporateName.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("Informe nome fantasia e razão social") }
                    } else {
                        onSave(
                            SchoolEntity(
                                id = school?.id ?: 0,
                                fantasyName = fantasyName,
                                corporateName = corporateName,
                                address = address,
                                phone = phone,
                                contact = contact,
                                principal = principal,
                                doorman = doorman
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
