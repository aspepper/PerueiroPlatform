package com.idealinspecao.perueiroapp.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.idealinspecao.perueiroapp.ui.screens.DriverDashboardScreen
import com.idealinspecao.perueiroapp.ui.screens.ParentFormScreen
import com.idealinspecao.perueiroapp.ui.screens.ParentsListScreen
import com.idealinspecao.perueiroapp.ui.screens.ParentDashboardScreen

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onDriverLogin = { navController.navigate("driver_dashboard") },
                onParentLogin = { navController.navigate("parent_dashboard") }
            )
        }
        composable("driver_dashboard") {
            DriverDashboardScreen(onNavigate = { route -> navController.navigate(route) })
        }
        composable("parent_dashboard") {
            ParentDashboardScreen()
        }
        composable("parents_list") {
            ParentsListScreen(onAddParent = { navController.navigate("parent_form") })
        }
        composable("parent_form") {
            ParentFormScreen()
        }
    }
}
