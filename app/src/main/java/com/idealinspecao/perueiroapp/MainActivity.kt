package com.idealinspecao.perueiroapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import com.idealinspecao.perueiroapp.ui.theme.IdealInspecaoTheme
import com.idealinspecao.perueiroapp.viewmodel.IdealAppViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: IdealAppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            IdealInspecaoTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    IdealInspecaoApp(viewModel)
                }
            }
        }
    }
}
