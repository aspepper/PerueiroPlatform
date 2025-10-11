package com.idealinspecao.perueiroapp.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.idealinspecao.perueiroapp.data.model.School
import com.idealinspecao.perueiroapp.ui.theme.PerueiroAppTheme

@Composable
fun SchoolsListScreen(onAddSchool: () -> Unit) {
    val schools = listOf(
        School("1", "Escola Exemplo 1"),
        School("2", "Escola Exemplo 2")
    )

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(modifier = Modifier.padding(16.dp)) {
            items(schools) { school ->
                ListItem(
                    headlineContent = { Text(school.name) }
                )
            }
        }
        FloatingActionButton(
            onClick = onAddSchool,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
        ) {
            Icon(Icons.Filled.Add, contentDescription = "Add School")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SchoolsListScreenPreview() {
    PerueiroAppTheme {
        SchoolsListScreen(onAddSchool = {})
    }
}