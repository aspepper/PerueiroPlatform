package com.idealinspecao.perueiroapp.navigation

sealed class AppDestination(val route: String) {
    data object Splash : AppDestination("splash")
    data object Login : AppDestination("login")
    data object ChangePassword : AppDestination("changePassword/{cpf}") {
        fun buildRoute(cpf: String) = "changePassword/$cpf"
    }

    data object DriverDashboard : AppDestination("driverDashboard/{cpf}") {
        fun buildRoute(cpf: String) = "driverDashboard/$cpf"
    }

    data object ParentDashboard : AppDestination("parentDashboard/{cpf}") {
        fun buildRoute(cpf: String) = "parentDashboard/$cpf"
    }

    data object Guardians : AppDestination("guardians")
    data object Schools : AppDestination("schools")
    data object Vans : AppDestination("vans")
    data object Drivers : AppDestination("drivers")
    data object DriverRegistration : AppDestination("driverRegistration")
    data object DriverRegistrationSuccess : AppDestination("driverRegistrationSuccess")
    data object Students : AppDestination("students")
    data object Payments : AppDestination("payments")
    data object PaymentNotifications : AppDestination("paymentNotifications")
}
