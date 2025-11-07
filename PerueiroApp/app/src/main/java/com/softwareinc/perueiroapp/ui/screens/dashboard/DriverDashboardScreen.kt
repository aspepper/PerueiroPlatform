package com.softwareinc.perueiroapp.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachMoney
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.Group
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.NotificationsActive
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.School
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.softwareinc.perueiroapp.data.local.DriverEntity
private val DashboardBackground = Color(0xFFF3F4F8)
private val SurfaceGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF101731), Color(0xFF1E2F5B))
)
private val AccentYellow = Color(0xFFFFD54F)

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
    onLogout: () -> Unit,
) {
    var driver by remember { mutableStateOf<DriverEntity?>(null) }

    LaunchedEffect(driverCpf) {
        driver = fetchDriver(driverCpf)
    }

    val actions = remember {
        listOf(
            DashboardAction(
                title = "Responsáveis",
                description = "Cadastre e acompanhe",
                icon = Icons.Outlined.Groups,
                onClick = onNavigateToGuardians
            ),
            DashboardAction(
                title = "Escolas",
                description = "Organize instituições",
                icon = Icons.Outlined.School,
                onClick = onNavigateToSchools
            ),
            DashboardAction(
                title = "Vans",
                description = "Gerencie frota",
                icon = Icons.Outlined.DirectionsBus,
                onClick = onNavigateToVans
            ),
            DashboardAction(
                title = "Motoristas",
                description = "Equipe auxiliar",
                icon = Icons.Outlined.Person,
                onClick = onNavigateToDrivers
            ),
            DashboardAction(
                title = "Alunos",
                description = "Rotas e presenças",
                icon = Icons.Outlined.Group,
                onClick = onNavigateToStudents
            ),
            DashboardAction(
                title = "Pagamentos",
                description = "Faturas e recibos",
                icon = Icons.Outlined.AttachMoney,
                onClick = onNavigateToPayments
            ),
            DashboardAction(
                title = "Avisos",
                description = "Envie notificações",
                icon = Icons.Outlined.NotificationsActive,
                onClick = onNavigateToNotifications
            )
        )
    }

    Scaffold(
        containerColor = DashboardBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            HeroHeader(
                name = driver?.name,
                onLogout = onLogout
            )

            Spacer(modifier = Modifier.height(24.dp))

            SummaryCard()

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Acesso rápido",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 24.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            ActionGrid(actions = actions)

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun HeroHeader(name: String?, onLogout: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
            .background(SurfaceGradient)
            .padding(horizontal = 24.dp, vertical = 28.dp)
    ) {
        Column(modifier = Modifier.align(Alignment.CenterStart)) {
            Text(
                text = "Olá, ${name ?: "motorista"}!",
                color = Color.White,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Organize e acompanhe sua operação diária",
                color = Color.White.copy(alpha = 0.8f),
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(24.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                StatusBadge(text = "Tudo pronto")
                Spacer(modifier = Modifier.width(12.dp))
                StatusBadge(text = "Próxima saída 07:00", highlighted = true)
            }
        }

        IconButton(
            onClick = onLogout,
            modifier = Modifier.align(Alignment.TopEnd)
        ) {
            Icon(
                imageVector = Icons.Outlined.Logout,
                contentDescription = "Sair",
                tint = Color.White
            )
        }
    }
}

@Composable
private fun SummaryCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text(
                text = "Painel diário",
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF1E2F5B),
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(16.dp))
            BoxWithConstraints {
                val itemWidth = (maxWidth - 16.dp) / 2
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    SummaryItem(
                        label = "Responsáveis",
                        value = "Gerencie cadastros",
                        modifier = Modifier.width(itemWidth)
                    )
                    SummaryItem(
                        label = "Financeiro",
                        value = "Acompanhe cobranças",
                        modifier = Modifier.width(itemWidth)
                    )
                }
            }
        }
    }
}

@Composable
private fun SummaryItem(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = Color(0xFF6F7A99)
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF1E2F5B)
        )
    }
}

@Composable
private fun ActionGrid(actions: List<DashboardAction>) {
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
    ) {
        val cardWidth = (maxWidth - 16.dp) / 2
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            actions.chunked(2).forEach { rowItems ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    rowItems.forEach { action ->
                        DashboardActionCard(
                            action = action,
                            modifier = Modifier.width(cardWidth)
                        )
                    }
                    if (rowItems.size == 1) {
                        Spacer(modifier = Modifier.width(cardWidth))
                    }
                }
            }
        }
    }
}

@Composable
private fun DashboardActionCard(action: DashboardAction, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .clickable(onClick = action.onClick),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(AccentYellow.copy(alpha = 0.25f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = action.icon,
                    contentDescription = null,
                    tint = Color(0xFFB28704)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = action.title,
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF1E2F5B),
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = action.description,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6F7A99)
            )
        }
    }
}

@Composable
private fun StatusBadge(text: String, highlighted: Boolean = false) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(
                color = if (highlighted) AccentYellow else Color.White.copy(alpha = 0.2f)
            )
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = text,
            color = if (highlighted) Color(0xFF1E2F5B) else Color.White,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

data class DashboardAction(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)
