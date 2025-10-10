package com.idealinspecao.perueiroapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.ui.theme.PerueiroAppTheme

@Composable
fun ParentDashboardScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { /* TODO: Handle navigation to invoices */ }) {
            Text(text = "Faturas")
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { /* TODO: Handle navigation to profile */ }) {
            Text(text = "Perfil")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ParentDashboardScreenPreview() {
    PerueiroAppTheme {
        ParentDashboardScreen()
    }
}