package com.softwareinc.perueiroapp.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.softwareinc.perueiroapp.ui.screens.login.LoginScreen
import com.softwareinc.perueiroapp.ui.screens.ParentFormScreen
import com.softwareinc.perueiroapp.ui.screens.ParentsListScreen
import com.softwareinc.perueiroapp.ui.screens.dashboard.DriverDashboardScreen
import com.softwareinc.perueiroapp.ui.screens.dashboard.ParentDashboardScreen
import com.softwareinc.perueiroapp.viewmodel.LoginOutcome

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onDriverLogged = { navController.navigate("driver_dashboard") },
                onParentLogged = { navController.navigate("parent_dashboard") },
                onChangePasswordRequired = { navController.navigate("change_password") },
                onRegisterDriver = { navController.navigate("driver_registration") },
                onForgotPassword = { },
                login = { _, _, _ -> LoginOutcome.Error("Funcionalidade não disponível") }
            )
        }
        composable("driver_dashboard") {
            DriverDashboardScreen(
                driverCpf = "",
                fetchDriver = { null },
                onNavigateToGuardians = { navController.navigate("parents_list") },
                onNavigateToSchools = { },
                onNavigateToVans = { },
                onNavigateToDrivers = { },
                onNavigateToStudents = { },
                onNavigateToPayments = { },
                onNavigateToNotifications = { },
                onLogout = { navController.popBackStack("login", inclusive = false) }
            )
        }
        composable("parent_dashboard") {
            ParentDashboardScreen(
                guardianCpf = "",
                fetchGuardian = { null },
                students = emptyList(),
                payments = emptyList(),
                onLogout = { navController.popBackStack("login", inclusive = false) }
            )
        }
        composable("parents_list") {
            ParentsListScreen(onAddParent = { navController.navigate("parent_form") })
        }
        composable("parent_form") {
            ParentFormScreen()
        }
    }
}
