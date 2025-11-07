package com.softwareinc.perueiroapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.ui.theme.PerueiroAppTheme

@Composable
fun LoginScreen(onDriverLogin: () -> Unit, onParentLogin: () -> Unit) {
    val cpfState = remember { mutableStateOf("") }
    val passwordState = remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "PERUEIROS", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        
        TextField(
            value = cpfState.value,
            onValueChange = { cpfState.value = it },
            label = { Text("CPF") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        TextField(
            value = passwordState.value,
            onValueChange = { passwordState.value = it },
            label = { Text("Senha") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(onClick = onDriverLogin, modifier = Modifier.fillMaxWidth()) {
            Text(text = "Login Motorista")
        }
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = onParentLogin, modifier = Modifier.fillMaxWidth()) {
            Text(text = "Login como Pai, Mãe ou Responsável")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    PerueiroAppTheme {
        LoginScreen(onDriverLogin = {}, onParentLogin = {})
    }
}