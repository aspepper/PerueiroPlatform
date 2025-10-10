package com.idealinspecao.perueiroapp.ui.screens.dashboard

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.data.local.DriverEntity
import com.idealinspecao.perueiroapp.ui.components.InfoCard
import com.idealinspecao.perueiroapp.ui.components.ScreenScaffold

@Composable
fun DriverDashboardScreen(
    driverCpf: String,
    fetchDriver: suspend (String) -> DriverEntity?,
    onNavigateToGuardians: () -> Unit,
    onNavigateToSchools: () -> Unit,
    onNavigateToVans: () -> Unit,
    onNavigateToDrivers: () -> Unit,
    onNavigateToStudents: () -> Unit,
    onNavigateToPayments: () -> Unit,
    onNavigateToNotifications: () -> Unit,
) {
    ScreenScaffold(title = "Painel do Motorista") { padding, _ ->
        var driver by remember { mutableStateOf<DriverEntity?>(null) }

        LaunchedEffect(driverCpf) {
            driver = fetchDriver(driverCpf)
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            item {
                Text(
                    text = driver?.let { "Olá, ${it.name}!" } ?: "Olá, motorista!",
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = "Gerencie sua operação diária",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
            items(
                listOf(
                    DashboardItem("Responsáveis", "Cadastrar e acompanhar responsáveis", onNavigateToGuardians),
                    DashboardItem("Escolas", "Gerenciar escolas atendidas", onNavigateToSchools),
                    DashboardItem("Vans", "Controle da frota e motoristas", onNavigateToVans),
                    DashboardItem("Motoristas", "Cadastro de motoristas auxiliares", onNavigateToDrivers),
                    DashboardItem("Alunos", "Controle completo de alunos transportados", onNavigateToStudents),
                    DashboardItem("Pagamentos", "Visualize pagamentos por aluno e status", onNavigateToPayments),
                    DashboardItem("Avisos", "Envie avisos de pagamento via e-mail, WhatsApp ou mensagem", onNavigateToNotifications)
                )
            ) { item ->
                InfoCard(
                    title = item.title,
                    description = item.description,
                    onClick = item.onClick,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }
        }
    }
}

private data class DashboardItem(
    val title: String,
    val description: String,
    val onClick: () -> Unit
)
