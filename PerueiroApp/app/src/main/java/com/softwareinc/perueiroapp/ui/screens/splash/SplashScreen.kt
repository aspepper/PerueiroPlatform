package com.softwareinc.perueiroapp.ui.screens.splash

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
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
import android.util.Log
import com.softwareinc.perueiroapp.viewmodel.LoggedUser
import com.softwareinc.perueiroapp.model.UserRole
import kotlinx.coroutines.delay

private val SplashBackground = Color(0xFF101731)
private val GlowGradient = Brush.radialGradient(
    colors = listOf(Color(0xFFFFD54F), Color(0xFFFFB300), Color(0x33FFD54F)),
    radius = 280f
)

@Composable
fun SplashScreen(
    loggedUser: LoggedUser?,
    onSync: suspend (LoggedUser?) -> Unit,
    onNavigateToLogin: () -> Unit,
    onNavigateToDriver: (String) -> Unit,
    onNavigateToParent: (String) -> Unit,
) {
    var startAnimation by remember { mutableStateOf(false) }
    val glowScale by animateFloatAsState(
        targetValue = if (startAnimation) 1.15f else 1f,
        animationSpec = tween(durationMillis = 1400, easing = LinearEasing),
        label = "glowScale"
    )

    LaunchedEffect(Unit) {
        startAnimation = true
    }

    LaunchedEffect(loggedUser) {
        try {
            onSync(loggedUser)
        } catch (exception: Exception) {
            Log.e("SplashScreen", "Erro ao sincronizar dados", exception)
        }

        delay(1600)
        when (loggedUser?.role) {
            UserRole.DRIVER -> onNavigateToDriver(loggedUser.cpf)
            UserRole.GUARDIAN -> onNavigateToParent(loggedUser.cpf)
            null -> onNavigateToLogin()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SplashBackground),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size((220 * glowScale).dp)
                .clip(CircleShape)
                .background(GlowGradient)
        )

        Column(
            modifier = Modifier
                .wrapContentHeight()
                .align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "PERUEIROS",
                style = MaterialTheme.typography.displaySmall,
                color = SplashBackground,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "2025® Todos direitos\nreservados",
                style = MaterialTheme.typography.headlineSmall,
                color = SplashBackground,
                fontWeight = FontWeight.SemiBold
            )
        }

        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Cuidando da rotina escolar com segurança",
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Perueiros App",
                color = Color.White,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
