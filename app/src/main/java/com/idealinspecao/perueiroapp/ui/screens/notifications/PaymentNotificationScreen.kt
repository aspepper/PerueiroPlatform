package com.idealinspecao.perueiroapp.ui.screens.notifications

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
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
import com.idealinspecao.perueiroapp.data.local.StudentEntity
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import com.idealinspecao.perueiroapp.ui.components.SelectionDialog
import com.idealinspecao.perueiroapp.ui.components.SelectionTextField
import kotlinx.coroutines.launch

@Composable
fun PaymentNotificationScreen(
    guardians: List<GuardianEntity>,
    students: List<StudentEntity>,
    onBack: () -> Unit
) {
    ScreenScaffold(title = "Avisos de pagamento", onBack = onBack) { padding, snackbar ->
        var selectedGuardian by remember { mutableStateOf<GuardianEntity?>(null) }
        var selectedStudent by remember { mutableStateOf<StudentEntity?>(null) }
        var subject by remember { mutableStateOf("Pagamento em aberto") }
        var message by remember { mutableStateOf("Olá, lembramos que há um pagamento pendente.") }
        var viaEmail by remember { mutableStateOf(true) }
        var viaWhatsapp by remember { mutableStateOf(false) }
        var viaMessage by remember { mutableStateOf(false) }
        var showGuardianDialog by remember { mutableStateOf(false) }
        var showStudentDialog by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SelectionTextField(
                label = "Responsável",
                value = selectedGuardian?.let { "${it.name} (${it.cpf})" } ?: "Selecionar",
                onClick = { showGuardianDialog = true }
            )
            SelectionTextField(
                label = "Aluno",
                value = selectedStudent?.name ?: "Selecionar",
                onClick = { showStudentDialog = true }
            )
            FormTextField(subject, { subject = it }, "Assunto")
            FormTextField(message, { message = it }, "Mensagem", singleLine = false)
            ChannelRow(label = "E-mail", checked = viaEmail, onCheckedChange = { viaEmail = it })
            ChannelRow(label = "WhatsApp", checked = viaWhatsapp, onCheckedChange = { viaWhatsapp = it })
            ChannelRow(label = "Mensagem SMS", checked = viaMessage, onCheckedChange = { viaMessage = it })
            Button(
                onClick = {
                    if (selectedGuardian == null || selectedStudent == null) {
                        coroutineScope.launch { snackbar.showSnackbar("Selecione responsável e aluno") }
                    } else if (!viaEmail && !viaWhatsapp && !viaMessage) {
                        coroutineScope.launch { snackbar.showSnackbar("Escolha pelo menos um canal de envio") }
                    } else {
                        coroutineScope.launch {
                            snackbar.showSnackbar("Aviso registrado para ${selectedGuardian!!.name}")
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Enviar aviso")
            }
        }

        if (showGuardianDialog) {
            SelectionDialog(
                title = "Selecionar responsável",
                items = guardians,
                itemLabel = { "${it.name} (${it.cpf})" },
                onItemSelected = {
                    selectedGuardian = it
                    if (selectedStudent == null) {
                        selectedStudent = students.firstOrNull { student ->
                            student.fatherCpf == it.cpf || student.motherCpf == it.cpf
                        }
                    }
                },
                onDismiss = { showGuardianDialog = false }
            )
        }

        if (showStudentDialog) {
            SelectionDialog(
                title = "Selecionar aluno",
                items = students,
                itemLabel = { it.name },
                onItemSelected = { selectedStudent = it },
                onDismiss = { showStudentDialog = false }
            )
        }
    }
}

@Composable
private fun ChannelRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Checkbox(checked = checked, onCheckedChange = onCheckedChange)
        Text(text = label, modifier = Modifier.padding(start = 8.dp))
    }
}
