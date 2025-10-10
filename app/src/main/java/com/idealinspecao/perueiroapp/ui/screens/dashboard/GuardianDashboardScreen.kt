package com.idealinspecao.perueiroapp.ui.screens.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.data.local.GuardianEntity
import com.idealinspecao.perueiroapp.data.local.PaymentEntity
import com.idealinspecao.perueiroapp.data.local.StudentEntity
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold

@Composable
fun GuardianDashboardScreen(
    guardianCpf: String,
    fetchGuardian: suspend (String) -> GuardianEntity?,
    students: List<StudentEntity>,
    payments: List<PaymentEntity>,
    onBack: () -> Unit
) {
    ScreenScaffold(title = "Pagamentos", onBack = onBack) { padding, _ ->
        var guardian by remember { mutableStateOf<GuardianEntity?>(null) }

        LaunchedEffect(guardianCpf) {
            guardian = fetchGuardian(guardianCpf)
        }

        val relatedStudents = remember(guardianCpf, students) {
            students.filter { it.fatherCpf == guardianCpf || it.motherCpf == guardianCpf }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = guardian?.let { "Olá, ${it.name}" } ?: "Olá!",
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = "Confira os pagamentos dos seus filhos",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            if (relatedStudents.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Text(
                            text = "Nenhum aluno vinculado ao seu CPF.",
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            } else {
                items(relatedStudents, key = { it.id }) { student ->
                    StudentPaymentsCard(
                        student = student,
                        payments = payments.filter { it.studentId == student.id }
                    )
                }
            }
        }
    }
}

@Composable
private fun StudentPaymentsCard(student: StudentEntity, payments: List<PaymentEntity>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = student.name, style = MaterialTheme.typography.titleMedium)
            Text(text = "Data de nascimento: ${student.birthDate}", style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(8.dp))
            if (payments.isEmpty()) {
                Text("Nenhum pagamento registrado.")
            } else {
                payments.forEachIndexed { index, payment ->
                    PaymentRow(payment)
                    if (index != payments.lastIndex) {
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun PaymentRow(payment: PaymentEntity) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Vencimento: ${payment.paymentDate}",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
        Text(text = "Valor: R$ ${"%.2f".format(payment.amount)}")
        if (payment.discount > 0) {
            Text(text = "Desconto: R$ ${"%.2f".format(payment.discount)}")
        }
        Text(text = "Status: ${payment.status}")
    }
}
