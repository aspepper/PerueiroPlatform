package com.softwareinc.perueiroapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.ui.theme.PerueiroAppTheme

@Composable
fun DriverDashboardScreen(onNavigate: (String) -> Unit) {
    val menuItems = listOf(
        "Pais", "Escolas", "Alunos", "Pagamentos",
        "Vans", "Motoristas", "Avisos", "Lista Negra"
    )

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.padding(16.dp)
    ) {
        items(menuItems.size) { index ->
            val route = when (menuItems[index]) {
                "Pais" -> "parents_list"
                else -> ""
            }
            Button(
                onClick = { if (route.isNotEmpty()) onNavigate(route) },
                modifier = Modifier
                    .padding(8.dp)
                    .height(120.dp)
                    .fillMaxWidth()
            ) {
                Text(text = menuItems[index])
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DriverDashboardScreenPreview() {
    PerueiroAppTheme {
        DriverDashboardScreen(onNavigate = {})
    }
}