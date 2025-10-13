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
import androidx.compose.material3.MaterialTheme
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
import com.idealinspecao.perueiroapp.data.local.GuardianEntity
import com.idealinspecao.perueiroapp.data.local.SchoolEntity
import com.idealinspecao.perueiroapp.data.local.StudentEntity
import com.idealinspecao.perueiroapp.data.local.VanEntity
import com.idealinspecao.perueiroapp.ui.components.ConfirmationDialog
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import com.idealinspecao.perueiroapp.ui.components.SelectionDialog
import com.idealinspecao.perueiroapp.ui.components.SelectionTextField
import kotlinx.coroutines.launch

@Composable
fun StudentListScreen(
    students: List<StudentEntity>,
    guardians: List<GuardianEntity>,
    onBack: () -> Unit,
    onAddStudent: () -> Unit,
    onEditStudent: (StudentEntity) -> Unit,
    onDeleteStudent: (StudentEntity) -> Unit
) {
    ScreenScaffold(
        title = "Alunos",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddStudent) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar aluno")
            }
        }
    ) { padding, snackbar ->
        var studentToDelete by remember { mutableStateOf<StudentEntity?>(null) }
        val coroutineScope = rememberCoroutineScope()

        if (students.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhum aluno cadastrado.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(students, key = { it.id }) { student ->
                    val father = guardians.firstOrNull { it.cpf == student.fatherCpf }?.name ?: "-"
                    val mother = guardians.firstOrNull { it.cpf == student.motherCpf }?.name ?: "-"
                    InfoCard(
                        title = student.name,
                        description = "Responsáveis: Pai $father / Mãe $mother",
                        onClick = { onEditStudent(student) },
                        actions = {
                            IconButton(onClick = { onEditStudent(student) }) {
                                Icon(Icons.Outlined.Edit, contentDescription = "Editar")
                            }
                            IconButton(onClick = { studentToDelete = student }) {
                                Icon(Icons.Outlined.Delete, contentDescription = "Remover")
                            }
                        }
                    )
                }
            }
        }

        studentToDelete?.let { student ->
            ConfirmationDialog(
                title = "Remover aluno?",
                message = "Confirma a exclusão de ${student.name}?",
                onConfirm = {
                    onDeleteStudent(student)
                    coroutineScope.launch { snackbar.showSnackbar("Aluno removido") }
                    studentToDelete = null
                },
                onDismiss = { studentToDelete = null }
            )
        }
    }
}

@Composable
fun StudentFormScreen(
    student: StudentEntity?,
    guardians: List<GuardianEntity>,
    schools: List<SchoolEntity>,
    vans: List<VanEntity>,
    drivers: List<DriverEntity>,
    existingStudents: List<StudentEntity>,
    onBack: () -> Unit,
    onSave: (StudentEntity) -> Unit
) {
    ScreenScaffold(
        title = if (student == null) "Novo aluno" else "Editar aluno",
        onBack = onBack
    ) { padding, snackbar ->
        var name by remember { mutableStateOf(student?.name ?: "") }
        var birthDate by remember { mutableStateOf(student?.birthDate ?: "") }
        var father by remember { mutableStateOf(student?.fatherCpf ?: "") }
        var mother by remember { mutableStateOf(student?.motherCpf ?: "") }
        var schoolId by remember { mutableStateOf(student?.schoolId ?: 0L) }
        var mobile by remember { mutableStateOf(student?.mobile ?: "") }
        var vanId by remember { mutableStateOf(student?.vanId ?: 0L) }
        var driverCpf by remember { mutableStateOf(student?.driverCpf ?: "") }
        var showGuardianDialog by remember { mutableStateOf<Pair<String, Boolean>?>(null) }
        var showSchoolDialog by remember { mutableStateOf(false) }
        var showVanDialog by remember { mutableStateOf(false) }
        var showDriverDialog by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        val fatherSiblings = remember(father, existingStudents) {
            existingStudents.filter { it.id != (student?.id ?: -1) && it.fatherCpf == father }
        }
        val motherSiblings = remember(mother, existingStudents) {
            existingStudents.filter { it.id != (student?.id ?: -1) && it.motherCpf == mother }
        }

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FormTextField(name, { name = it }, "Nome")
            FormTextField(birthDate, { birthDate = it }, "Data de nascimento")
            SelectionTextField(
                label = "Pai",
                value = guardians.firstOrNull { it.cpf == father }?.name ?: "Selecionar",
                onClick = { showGuardianDialog = "father" to true }
            )
            SelectionTextField(
                label = "Mãe",
                value = guardians.firstOrNull { it.cpf == mother }?.name ?: "Selecionar",
                onClick = { showGuardianDialog = "mother" to true }
            )
            SelectionTextField(
                label = "Escola",
                value = schools.firstOrNull { it.id == schoolId }?.fantasyName ?: "Selecionar",
                onClick = { showSchoolDialog = true }
            )
            FormTextField(mobile, { mobile = it }, "Celular do aluno")
            SelectionTextField(
                label = "Van",
                value = vans.firstOrNull { it.id == vanId }?.let { "${it.model} - ${it.plate}" } ?: "Selecionar",
                onClick = { showVanDialog = true }
            )
            SelectionTextField(
                label = "Motorista",
                value = drivers.firstOrNull { it.cpf == driverCpf }?.name ?: "Selecionar",
                onClick = { showDriverDialog = true }
            )

            if (fatherSiblings.isNotEmpty() || motherSiblings.isNotEmpty()) {
                Text("Irmãos cadastrados:", style = MaterialTheme.typography.titleSmall)
                fatherSiblings.union(motherSiblings).forEach { sibling ->
                    Text("- ${sibling.name} (${sibling.schoolId?.let { id -> schools.firstOrNull { it.id == id }?.fantasyName ?: "" } ?: "Sem escola"})")
                }
            }

            Button(
                onClick = {
                    if (name.isBlank()) {
                        coroutineScope.launch { snackbar.showSnackbar("Informe o nome do aluno") }
                    } else {
                        onSave(
                            StudentEntity(
                                id = student?.id ?: 0,
                                name = name,
                                birthDate = birthDate,
                                fatherCpf = father.takeIf { it.isNotBlank() },
                                motherCpf = mother.takeIf { it.isNotBlank() },
                                schoolId = schoolId.takeIf { it != 0L },
                                mobile = mobile.takeIf { it.isNotBlank() },
                                vanId = vanId.takeIf { it != 0L },
                                driverCpf = driverCpf.takeIf { it.isNotBlank() }
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

        showGuardianDialog?.let { (type, _) ->
            SelectionDialog(
                title = if (type == "father") "Selecionar pai" else "Selecionar mãe",
                items = guardians,
                itemLabel = { "${it.name} (${it.cpf})" },
                onItemSelected = {
                    if (type == "father") father = it.cpf else mother = it.cpf
                },
                onDismiss = { showGuardianDialog = null }
            )
        }
        if (showSchoolDialog) {
            SelectionDialog(
                title = "Selecionar escola",
                items = schools,
                itemLabel = { it.fantasyName },
                onItemSelected = { schoolId = it.id },
                onDismiss = { showSchoolDialog = false }
            )
        }
        if (showVanDialog) {
            SelectionDialog(
                title = "Selecionar van",
                items = vans,
                itemLabel = { "${it.model} - ${it.plate}" },
                onItemSelected = { vanId = it.id },
                onDismiss = { showVanDialog = false }
            )
        }
        if (showDriverDialog) {
            SelectionDialog(
                title = "Selecionar motorista",
                items = drivers,
                itemLabel = { "${it.name} (${it.cpf})" },
                onItemSelected = { driverCpf = it.cpf },
                onDismiss = { showDriverDialog = false }
            )
        }
    }
}
