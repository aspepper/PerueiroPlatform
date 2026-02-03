package com.softwareinc.perueiroapp.ui.screens.contracts

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.softwareinc.perueiroapp.data.local.ContractEntity
import com.softwareinc.perueiroapp.data.remote.RemoteApiConfig
import com.softwareinc.perueiroapp.ui.components.ScreenScaffold

@Composable
fun GuardianContractsScreen(
    guardianCpf: String,
    pending: List<ContractEntity>,
    signed: List<ContractEntity>,
    onBack: () -> Unit,
    onRefresh: () -> Unit
) {
    val context = LocalContext.current

    LaunchedEffect(guardianCpf) {
        onRefresh()
    }

    ScreenScaffold(title = "Meus contratos", onBack = onBack) { padding, _ ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(onClick = onRefresh, modifier = Modifier.fillMaxWidth()) {
                Text("Atualizar contratos")
            }

            Text("Pendentes", style = MaterialTheme.typography.titleMedium)
            ContractList(
                contracts = pending,
                actionLabel = "Abrir contrato",
                onAction = { contractId ->
                    val url = "${RemoteApiConfig.contractsWebBaseUrl}/$contractId"
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }
            )

            Text("Assinados", style = MaterialTheme.typography.titleMedium)
            ContractList(
                contracts = signed,
                actionLabel = "Abrir contrato",
                onAction = { contractId ->
                    val url = "${RemoteApiConfig.contractsWebBaseUrl}/$contractId"
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }
            )
        }
    }
}

@Composable
private fun ContractList(
    contracts: List<ContractEntity>,
    actionLabel: String,
    onAction: (Long) -> Unit
) {
    if (contracts.isEmpty()) {
        Text(
            text = "Nenhum contrato encontrado.",
            style = MaterialTheme.typography.bodyMedium
        )
        return
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(contracts) { contract ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(contract.studentName, style = MaterialTheme.typography.titleSmall)
                    Text("Período: ${contract.period}")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { onAction(contract.id) }) {
                            Text(actionLabel)
                        }
                    }
                }
            }
        }
    }
}
