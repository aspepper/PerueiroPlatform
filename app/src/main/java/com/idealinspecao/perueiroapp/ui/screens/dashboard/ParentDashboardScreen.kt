package com.idealinspecao.perueiroapp.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.idealinspecao.perueiroapp.data.local.GuardianEntity
import com.idealinspecao.perueiroapp.data.local.PaymentEntity
import com.idealinspecao.perueiroapp.data.local.StudentEntity

private val ParentBackground = Color(0xFFF7F7FB)
private val ParentGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF0F1A3A), Color(0xFF1F3C6D))
)
private val AccentBlue = Color(0xFF3D6DE5)
private val AccentSoft = Color(0xFFEEF1FF)

@Composable
fun ParentDashboardScreen(
    guardianCpf: String,
    fetchGuardian: suspend (String) -> GuardianEntity?,
    students: List<StudentEntity>,
    payments: List<PaymentEntity>,
    onLogout: () -> Unit
) {
    var guardian by remember { mutableStateOf<GuardianEntity?>(null) }

    LaunchedEffect(guardianCpf) {
        guardian = fetchGuardian(guardianCpf)
    }

    val relatedStudents = remember(guardianCpf, students) {
        students.filter { it.fatherCpf == guardianCpf || it.motherCpf == guardianCpf }
    }
    val relatedStudentIds = remember(relatedStudents) { relatedStudents.map { it.id }.toSet() }
    val relatedPayments = remember(relatedStudentIds, payments) {
        payments.filter { relatedStudentIds.contains(it.studentId) }
    }

    Scaffold(
        containerColor = ParentBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            item {
                ParentHero(
                    guardianName = guardian?.name,
                    onLogout = onLogout
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
                FinancialSummary(
                    studentsCount = relatedStudents.size,
                    pendingCount = relatedPayments.count { it.status.contains("pend", ignoreCase = true) }
                )
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }

            if (relatedStudents.isEmpty()) {
                item { EmptyStateCard() }
            } else {
                items(relatedStudents, key = { it.id }) { student ->
                    val studentPayments = remember(student.id, relatedPayments) {
                        relatedPayments.filter { it.studentId == student.id }
                    }
                    StudentPaymentCard(student = student, payments = studentPayments)
                }
            }
        }
    }
}

@Composable
private fun ParentHero(guardianName: String?, onLogout: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
            .background(ParentGradient)
            .padding(horizontal = 24.dp, vertical = 28.dp)
    ) {
        Column(modifier = Modifier.align(Alignment.CenterStart)) {
            Text(
                text = "Olá, ${guardianName ?: "responsável"}!",
                color = Color.White,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Acompanhe os pagamentos e status do transporte",
                color = Color.White.copy(alpha = 0.85f),
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                HighlightPill(text = "Próximo vencimento", highlighted = true)
                Spacer(modifier = Modifier.width(12.dp))
                HighlightPill(text = "Notificações ativas")
            }
        }

        IconButton(
            onClick = onLogout,
            modifier = Modifier.align(Alignment.TopEnd)
        ) {
            Icon(imageVector = Icons.Outlined.Logout, contentDescription = "Sair", tint = Color.White)
        }
    }
}

@Composable
private fun FinancialSummary(studentsCount: Int, pendingCount: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text(
                text = "Resumo",
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF1F3C6D),
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                SummaryInfo(label = "Alunos", value = studentsCount.toString())
                SummaryInfo(label = "Pendências", value = pendingCount.toString(), highlight = pendingCount > 0)
            }
        }
    }
}

@Composable
private fun RowScope.SummaryInfo(label: String, value: String, highlight: Boolean = false) {
    Column(modifier = Modifier.weight(1f)) {
        Text(text = label, style = MaterialTheme.typography.labelLarge, color = Color(0xFF6E7AA6))
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            color = if (highlight) Color(0xFFEA526F) else Color(0xFF1F3C6D),
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun StudentPaymentCard(student: StudentEntity, payments: List<PaymentEntity>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.CreditCard,
                    contentDescription = null,
                    tint = AccentBlue
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = student.name,
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF1F3C6D),
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Nascimento: ${student.birthDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6E7AA6)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            PaymentStatusRow(payments = payments)

            Spacer(modifier = Modifier.height(16.dp))

            if (payments.isEmpty()) {
                Text(
                    text = "Nenhum pagamento cadastrado até o momento.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF6E7AA6)
                )
            } else {
                payments.take(3).forEach { payment ->
                    PaymentDetail(payment = payment)
                }
            }
        }
    }
}

@Composable
private fun PaymentStatusRow(payments: List<PaymentEntity>) {
    val paidCount = payments.count { it.status.contains("pago", ignoreCase = true) }
    val pendingCount = payments.count { it.status.contains("pend", ignoreCase = true) }

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        StatusPill(label = "$paidCount pagos", color = AccentSoft, contentColor = AccentBlue)
        StatusPill(
            label = "$pendingCount pendentes",
            color = if (pendingCount > 0) Color(0xFFFFE5E9) else AccentSoft,
            contentColor = if (pendingCount > 0) Color(0xFFEA526F) else AccentBlue
        )
    }
}

@Composable
private fun PaymentDetail(payment: PaymentEntity) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(
            text = "Vencimento: ${payment.paymentDate}",
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF1F3C6D),
            fontWeight = FontWeight.Medium
        )
        Text(
            text = "Valor: R$ ${"%.2f".format(payment.amount)}",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF6E7AA6)
        )
        if (payment.discount > 0) {
            Text(
                text = "Desconto: R$ ${"%.2f".format(payment.discount)}",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6E7AA6)
            )
        }
        Text(
            text = "Status: ${payment.status}",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF6E7AA6)
        )
    }
}

@Composable
private fun StatusPill(label: String, color: Color, contentColor: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(color)
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(text = label, color = contentColor, fontWeight = FontWeight.Medium, fontSize = 13.sp)
    }
}

@Composable
private fun HighlightPill(text: String, highlighted: Boolean = false) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(40))
            .background(if (highlighted) AccentSoft.copy(alpha = 0.35f) else Color.White.copy(alpha = 0.2f))
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(text = text, color = Color.White, fontWeight = FontWeight.Medium, fontSize = 13.sp)
    }
}

@Composable
private fun EmptyStateCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Outlined.Notifications,
                contentDescription = null,
                tint = AccentBlue
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Nenhum aluno vinculado ao seu CPF.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6E7AA6),
                textAlign = TextAlign.Center
            )
        }
    }
}
