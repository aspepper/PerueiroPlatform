package com.idealinspecao.perueiroapp.ui.screens.payments

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
import com.idealinspecao.perueiroapp.data.local.PaymentEntity
import com.idealinspecao.perueiroapp.data.local.StudentEntity
import com.idealinspecao.perueiroapp.ui.components.ConfirmationDialog
import com.idealinspecao.perueiroapp.ui.components.FormTextField
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold
import com.idealinspecao.perueiroapp.ui.components.SelectionDialog
import com.idealinspecao.perueiroapp.ui.components.SelectionTextField
import kotlinx.coroutines.launch

@Composable
fun PaymentListScreen(
    payments: List<PaymentEntity>,
    students: List<StudentEntity>,
    onBack: () -> Unit,
    onAddPayment: () -> Unit,
    onEditPayment: (PaymentEntity) -> Unit,
    onDeletePayment: (PaymentEntity) -> Unit
) {
    ScreenScaffold(
        title = "Pagamentos",
        onBack = onBack,
        floatingActionButton = {
            FloatingActionButton(onClick = onAddPayment) {
                Icon(Icons.Default.Add, contentDescription = "Adicionar pagamento")
            }
        }
    ) { padding, snackbar ->
        var paymentToDelete by remember { mutableStateOf<PaymentEntity?>(null) }
        val coroutineScope = rememberCoroutineScope()

        if (payments.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Nenhum pagamento registrado.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(payments, key = { it.id }) { payment ->
                    val student = students.firstOrNull { it.id == payment.studentId }
                    InfoCard(
                        title = student?.name ?: "Aluno desconhecido",
                        description = "Data: ${payment.paymentDate}\nValor: R$ ${"%.2f".format(payment.amount)}\nStatus: ${payment.status}",
                        onClick = { onEditPayment(payment) },
                        actions = {
                            IconButton(onClick = { onEditPayment(payment) }) {
                                Icon(Icons.Outlined.Edit, contentDescription = "Editar")
                            }
                            IconButton(onClick = { paymentToDelete = payment }) {
                                Icon(Icons.Outlined.Delete, contentDescription = "Remover")
                            }
                        }
                    )
                }
            }
        }

        paymentToDelete?.let { payment ->
            ConfirmationDialog(
                title = "Remover pagamento?",
                message = "Confirma a exclusão do lançamento em ${payment.paymentDate}?",
                onConfirm = {
                    onDeletePayment(payment)
                    coroutineScope.launch { snackbar.showSnackbar("Pagamento removido") }
                    paymentToDelete = null
                },
                onDismiss = { paymentToDelete = null }
            )
        }
    }
}

@Composable
fun PaymentFormScreen(
    payment: PaymentEntity?,
    students: List<StudentEntity>,
    onBack: () -> Unit,
    onSave: (PaymentEntity) -> Unit
) {
    ScreenScaffold(
        title = if (payment == null) "Novo pagamento" else "Editar pagamento",
        onBack = onBack
    ) { padding, snackbar ->
        var studentId by remember { mutableStateOf(payment?.studentId ?: 0L) }
        var date by remember { mutableStateOf(payment?.paymentDate ?: "") }
        var value by remember { mutableStateOf(payment?.amount?.toString() ?: "") }
        var discount by remember { mutableStateOf(payment?.discount?.toString() ?: "0.0") }
        var status by remember { mutableStateOf(payment?.status ?: "Pendente") }
        var showStudentDialog by remember { mutableStateOf(false) }
        var showStatusDialog by remember { mutableStateOf(false) }
        val coroutineScope = rememberCoroutineScope()

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SelectionTextField(
                label = "Aluno",
                value = students.firstOrNull { it.id == studentId }?.name ?: "Selecionar",
                onClick = { showStudentDialog = true }
            )
            FormTextField(date, { date = it }, "Data do pagamento")
            FormTextField(value, { value = it }, "Valor")
            FormTextField(discount, { discount = it }, "Desconto")
            SelectionTextField(
                label = "Status",
                value = status,
                onClick = { showStatusDialog = true }
            )
            Button(
                onClick = {
                    val parsedValue = value.toDoubleOrNull()
                    val parsedDiscount = discount.toDoubleOrNull() ?: 0.0
                    if (studentId == 0L || parsedValue == null) {
                        coroutineScope.launch { snackbar.showSnackbar("Informe aluno e valor válido") }
                    } else {
                        onSave(
                            PaymentEntity(
                                id = payment?.id ?: 0,
                                studentId = studentId,
                                paymentDate = date,
                                amount = parsedValue,
                                discount = parsedDiscount,
                                status = status
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

        if (showStudentDialog) {
            SelectionDialog(
                title = "Selecionar aluno",
                items = students,
                itemLabel = { it.name },
                onItemSelected = { studentId = it.id },
                onDismiss = { showStudentDialog = false }
            )
        }
        if (showStatusDialog) {
            SelectionDialog(
                title = "Status",
                items = listOf("Pendente", "Pago", "Atrasado"),
                itemLabel = { it },
                onItemSelected = { status = it },
                onDismiss = { showStatusDialog = false }
            )
        }
    }
}
