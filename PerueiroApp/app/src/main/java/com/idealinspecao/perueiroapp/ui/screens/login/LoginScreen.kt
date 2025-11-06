package com.idealinspecao.perueiroapp.ui.screens.login

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.idealinspecao.perueiroapp.viewmodel.LoginOutcome
import com.idealinspecao.perueiroapp.model.UserRole
import kotlinx.coroutines.launch

private val LoginBackground = Brush.verticalGradient(
    colors = listOf(Color(0xFF101731), Color(0xFF182A58))
)
private val CardBackground = Color(0xFF101731).copy(alpha = 0.05f)
private val AccentYellow = Color(0xFFFFD54F)

@Composable
fun LoginScreen(
    onDriverLogged: (String) -> Unit,
    onParentLogged: (String) -> Unit,
    onChangePasswordRequired: (String) -> Unit,
    onRegisterDriver: () -> Unit,
    onForgotPassword: () -> Unit,
    login: suspend (String, String, UserRole) -> LoginOutcome
) {
    val snackbarHostState = remember { SnackbarHostState() }
    var cpf by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf(UserRole.DRIVER) }
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        containerColor = Color.Transparent,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(LoginBackground)
                .padding(padding)
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 96.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                GlowBadge()
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Perueiros App",
                    color = Color.White,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Bem-vindo! Faça login para continuar",
                    color = Color.White.copy(alpha = 0.75f),
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Card(
                modifier = Modifier
                    .align(Alignment.Center)
                    .padding(horizontal = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(28.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Dados de acesso",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF1F2F5A),
                        fontWeight = FontWeight.SemiBold
                    )

                    OutlinedTextField(
                        value = cpf,
                        onValueChange = { cpf = it },
                        label = { Text("CPF") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Senha") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Text(
                        text = "Entrar como",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color(0xFF5B6A9A)
                    )
                    RoleSelector(role = role, onRoleSelected = { role = it })

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                when (val result = login(cpf.trim(), password, role)) {
                                    is LoginOutcome.Driver -> onDriverLogged(result.driver.cpf)
                                    is LoginOutcome.Guardian -> onParentLogged(result.guardian.cpf)
                                    is LoginOutcome.MustChangePassword -> onChangePasswordRequired(result.cpf)
                                    is LoginOutcome.Error -> snackbarHostState.showSnackbar(result.message)
                                }
                            }
                        },
                        enabled = cpf.isNotBlank() && password.isNotBlank(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentYellow, contentColor = Color(0xFF1F2F5A))
                    ) {
                        Text("Entrar", fontWeight = FontWeight.SemiBold)
                    }

                    TextButton(onClick = onForgotPassword, modifier = Modifier.align(Alignment.End)) {
                        Text("Esqueci minha senha", color = Color(0xFF1F2F5A))
                    }

                    if (role == UserRole.DRIVER) {
                        TextButton(onClick = onRegisterDriver, modifier = Modifier.align(Alignment.End)) {
                            Text("Novo motorista? Cadastre-se", color = Color(0xFF1F2F5A))
                        }
                    }
                }
            }

            Text(
                text = "Suporte: suporte@idealinspecao.com",
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 32.dp),
                color = Color.White.copy(alpha = 0.6f),
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun RoleSelector(role: UserRole, onRoleSelected: (UserRole) -> Unit) {
    BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
        val chipWidth = (maxWidth - 12.dp) / 2
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            RoleChip(
                selected = role == UserRole.DRIVER,
                label = "Motorista",
                icon = Icons.Outlined.DirectionsBus,
                onClick = { onRoleSelected(UserRole.DRIVER) },
                modifier = Modifier.width(chipWidth)
            )
            RoleChip(
                selected = role == UserRole.GUARDIAN,
                label = "Responsável",
                icon = Icons.Outlined.Person,
                onClick = { onRoleSelected(UserRole.GUARDIAN) },
                modifier = Modifier.width(chipWidth)
            )
        }
    }
}

@Composable
private fun RoleChip(
    selected: Boolean,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = {
            Text(
                text = label,
                fontWeight = FontWeight.Medium,
                color = if (selected) Color.White else Color(0xFF1F2F5A)
            )
        },
        leadingIcon = {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (selected) Color.White else Color(0xFF1F2F5A)
            )
        },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = Color(0xFF1F2F5A),
            containerColor = Color.White,
            selectedLabelColor = Color.White,
            labelColor = Color(0xFF1F2F5A)
        ),
        modifier = modifier
    )
}

@Composable
private fun GlowBadge() {
    Box(
        modifier = Modifier
            .size(96.dp)
            .clip(CircleShape)
            .background(CardBackground),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.1f))
        )
        Box(
            modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.2f))
        )
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(AccentYellow)
        )
    }
}
