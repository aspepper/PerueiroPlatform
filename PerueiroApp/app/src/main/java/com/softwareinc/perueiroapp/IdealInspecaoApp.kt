package com.softwareinc.perueiroapp

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.softwareinc.perueiroapp.navigation.AppDestination
import com.softwareinc.perueiroapp.ui.screens.dashboard.DriverDashboardScreen
import com.softwareinc.perueiroapp.ui.screens.dashboard.ParentDashboardScreen
import com.softwareinc.perueiroapp.ui.screens.contracts.DriverContractsScreen
import com.softwareinc.perueiroapp.ui.screens.contracts.GuardianContractsScreen
import com.softwareinc.perueiroapp.ui.screens.login.ChangePasswordScreen
import com.softwareinc.perueiroapp.ui.screens.login.ForgotPasswordScreen
import com.softwareinc.perueiroapp.ui.screens.login.LoginScreen
import com.softwareinc.perueiroapp.ui.screens.DriverRegistrationSuccessScreen
import com.softwareinc.perueiroapp.ui.screens.management.DriverFormScreen
import com.softwareinc.perueiroapp.ui.screens.management.DriverListScreen
import com.softwareinc.perueiroapp.ui.screens.management.GuardianFormScreen
import com.softwareinc.perueiroapp.ui.screens.management.GuardianListScreen
import com.softwareinc.perueiroapp.ui.screens.management.SchoolFormScreen
import com.softwareinc.perueiroapp.ui.screens.management.SchoolListScreen
import com.softwareinc.perueiroapp.ui.screens.management.StudentFormScreen
import com.softwareinc.perueiroapp.ui.screens.management.StudentListScreen
import com.softwareinc.perueiroapp.ui.screens.management.VanFormScreen
import com.softwareinc.perueiroapp.ui.screens.management.VanListScreen
import com.softwareinc.perueiroapp.ui.screens.notifications.PaymentNotificationScreen
import com.softwareinc.perueiroapp.ui.screens.payments.PaymentFormScreen
import com.softwareinc.perueiroapp.ui.screens.payments.PaymentListScreen
import com.softwareinc.perueiroapp.ui.screens.splash.SplashScreen
import com.softwareinc.perueiroapp.viewmodel.IdealAppViewModel
import kotlinx.coroutines.launch

@Composable
fun IdealInspecaoApp(viewModel: IdealAppViewModel) {
    val navController = rememberNavController()
    val loggedUser by viewModel.loggedUser.collectAsState()
    val guardians by viewModel.guardians.collectAsState()
    val schools by viewModel.schools.collectAsState()
    val vans by viewModel.vans.collectAsState()
    val drivers by viewModel.drivers.collectAsState()
    val students by viewModel.students.collectAsState()
    val payments by viewModel.payments.collectAsState()

    NavHost(navController = navController, startDestination = AppDestination.Splash.route) {
        composable(AppDestination.Splash.route) {
            SplashScreen(
                loggedUser = loggedUser,
                onSync = { user -> viewModel.syncFromServer(user) },
                onNavigateToLogin = {
                    navController.navigate(AppDestination.Login.route) {
                        popUpTo(AppDestination.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToDriver = { cpf ->
                    navController.navigate(AppDestination.DriverDashboard.buildRoute(cpf)) {
                        popUpTo(AppDestination.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToParent = { cpf ->
                    navController.navigate(AppDestination.ParentDashboard.buildRoute(cpf)) {
                        popUpTo(AppDestination.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(AppDestination.Login.route) {
            LoginScreen(
                onDriverLogged = { cpf ->
                    navController.navigate(AppDestination.DriverDashboard.buildRoute(cpf)) {
                        popUpTo(AppDestination.Login.route) { inclusive = true }
                    }
                },
                onParentLogged = { cpf ->
                    navController.navigate(AppDestination.ParentDashboard.buildRoute(cpf)) {
                        popUpTo(AppDestination.Login.route) { inclusive = true }
                    }
                },
                onChangePasswordRequired = { cpf ->
                    navController.navigate(AppDestination.ChangePassword.buildRoute(cpf))
                },
                onRegisterDriver = {
                    navController.navigate(AppDestination.DriverRegistration.route)
                },
                onForgotPassword = {
                    navController.navigate(AppDestination.ForgotPassword.route)
                },
                login = { cpf, password, role -> viewModel.login(cpf, password, role) }
            )
        }

        composable(AppDestination.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBack = { navController.popBackStack() },
                requestPasswordReset = { cpf, email -> viewModel.requestPasswordReset(cpf, email) }
            )
        }

        composable(
            route = AppDestination.ChangePassword.route,
            arguments = listOf(navArgument("cpf") { type = NavType.StringType })
        ) { entry ->
            val cpf = entry.arguments?.getString("cpf") ?: return@composable
            ChangePasswordScreen(
                cpf = cpf,
                onPasswordChanged = { navController.popBackStack(AppDestination.Login.route, inclusive = false) },
                onBack = { navController.popBackStack() },
                changePassword = { id, password -> viewModel.changeGuardianPassword(id, password) }
            )
        }

        composable(
            route = AppDestination.DriverDashboard.route,
            arguments = listOf(navArgument("cpf") { type = NavType.StringType })
        ) { entry ->
            val cpf = entry.arguments?.getString("cpf") ?: return@composable
            DriverDashboardScreen(
                driverCpf = cpf,
                fetchDriver = { viewModel.getDriver(it) },
                onNavigateToGuardians = { navController.navigate(AppDestination.Guardians.route) },
                onNavigateToSchools = { navController.navigate(AppDestination.Schools.route) },
                onNavigateToVans = { navController.navigate(AppDestination.Vans.route) },
                onNavigateToDrivers = { navController.navigate(AppDestination.Drivers.route) },
                onNavigateToStudents = { navController.navigate(AppDestination.Students.route) },
                onNavigateToPayments = { navController.navigate(AppDestination.Payments.route) },
                onNavigateToNotifications = { navController.navigate(AppDestination.PaymentNotifications.route) },
                onNavigateToContracts = { navController.navigate(AppDestination.DriverContracts.buildRoute(cpf)) },
                onLogout = {
                    viewModel.logout()
                    navController.navigate(AppDestination.Splash.route) {
                        popUpTo(AppDestination.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = AppDestination.ParentDashboard.route,
            arguments = listOf(navArgument("cpf") { type = NavType.StringType })
        ) { entry ->
            val cpf = entry.arguments?.getString("cpf") ?: return@composable
            ParentDashboardScreen(
                guardianCpf = cpf,
                fetchGuardian = { viewModel.getGuardian(it) },
                students = students,
                payments = payments,
                onNavigateToContracts = { navController.navigate(AppDestination.GuardianContracts.buildRoute(cpf)) },
                onLogout = {
                    viewModel.logout()
                    navController.navigate(AppDestination.Splash.route) {
                        popUpTo(AppDestination.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(AppDestination.DriverRegistration.route) {
            val coroutineScope = rememberCoroutineScope()
            var isSaving by remember { mutableStateOf(false) }
            var submissionError by remember { mutableStateOf<String?>(null) }

            DriverFormScreen(
                driver = null,
                onBack = {
                    if (!isSaving) {
                        navController.popBackStack()
                    }
                },
                onSave = { driver ->
                    if (isSaving) return@DriverFormScreen

                    coroutineScope.launch {
                        isSaving = true
                        submissionError = null
                        try {
                            viewModel.registerDriver(driver)
                            navController.navigate(AppDestination.DriverRegistrationSuccess.route) {
                                popUpTo(AppDestination.DriverRegistration.route) { inclusive = true }
                            }
                        } catch (exception: Exception) {
                            submissionError = exception.message
                                ?: "Não foi possível concluir o cadastro. Tente novamente."
                        } finally {
                            isSaving = false
                        }
                    }
                },
                isSubmitting = isSaving,
                submissionError = submissionError
            )
        }

        composable(AppDestination.DriverRegistrationSuccess.route) {
            DriverRegistrationSuccessScreen(
                onGoToLogin = {
                    navController.navigate(AppDestination.Login.route) {
                        popUpTo(AppDestination.Splash.route) { inclusive = false }
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(AppDestination.Guardians.route) {
            var editingGuardian by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.GuardianEntity?>(null) }
            var creatingGuardian by remember { mutableStateOf(false) }
            if (!creatingGuardian && editingGuardian == null) {
                GuardianListScreen(
                    guardians = guardians,
                    onBack = { navController.popBackStack() },
                    onAddGuardian = {
                        creatingGuardian = true
                        editingGuardian = null
                    },
                    onEditGuardian = {
                        editingGuardian = it
                        creatingGuardian = false
                    },
                    onDeleteGuardian = {
                        viewModel.deleteGuardian(it.cpf)
                    }
                )
            } else {
                GuardianFormScreen(
                    guardian = if (creatingGuardian) null else editingGuardian,
                    onBack = {
                        editingGuardian = null
                        creatingGuardian = false
                    },
                    onSave = { guardian, preservePassword ->
                        viewModel.saveGuardian(guardian, preservePassword)
                    },
                    onCheckPendencies = { viewModel.refreshGuardianPendencies(it) },
                    onLookupGuardian = { viewModel.lookupGuardian(it) }
                )
            }
        }

        composable(AppDestination.Schools.route) {
            var editingSchool by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.SchoolEntity?>(null) }
            var creatingSchool by remember { mutableStateOf(false) }
            if (!creatingSchool && editingSchool == null) {
                SchoolListScreen(
                    schools = schools,
                    onBack = { navController.popBackStack() },
                    onAddSchool = {
                        creatingSchool = true
                        editingSchool = null
                    },
                    onEditSchool = {
                        editingSchool = it
                        creatingSchool = false
                    },
                    onDeleteSchool = {
                        viewModel.deleteSchool(it.id)
                    }
                )
            } else {
                SchoolFormScreen(
                    school = if (creatingSchool) null else editingSchool,
                    onBack = {
                        editingSchool = null
                        creatingSchool = false
                    },
                    onSave = { viewModel.saveSchool(it) }
                )
            }
        }

        composable(AppDestination.Vans.route) {
            var editingVan by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.VanEntity?>(null) }
            var creatingVan by remember { mutableStateOf(false) }
            if (!creatingVan && editingVan == null) {
                VanListScreen(
                    vans = vans,
                    onBack = { navController.popBackStack() },
                    onAddVan = {
                        creatingVan = true
                        editingVan = null
                    },
                    onEditVan = {
                        editingVan = it
                        creatingVan = false
                    },
                    onDeleteVan = {
                        viewModel.deleteVan(it.id)
                    }
                )
            } else {
                VanFormScreen(
                    van = if (creatingVan) null else editingVan,
                    drivers = drivers,
                    loggedUser = loggedUser,
                    onBack = {
                        editingVan = null
                        creatingVan = false
                    },
                    onLookupVan = { viewModel.lookupVan(it) },
                    onSave = { vanEntity, driverCpf, shouldSync ->
                        viewModel.saveVan(vanEntity, driverCpf, shouldSync)
                    }
                )
            }
        }

        composable(AppDestination.Drivers.route) {
            var editingDriver by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.DriverEntity?>(null) }
            var creatingDriver by remember { mutableStateOf(false) }
            if (!creatingDriver && editingDriver == null) {
                DriverListScreen(
                    drivers = drivers,
                    onBack = { navController.popBackStack() },
                    onAddDriver = {
                        creatingDriver = true
                        editingDriver = null
                    },
                    onEditDriver = {
                        editingDriver = it
                        creatingDriver = false
                    },
                    onDeleteDriver = {
                        viewModel.deleteDriver(it.cpf)
                    }
                )
            } else {
                DriverFormScreen(
                    driver = if (creatingDriver) null else editingDriver,
                    onBack = {
                        editingDriver = null
                        creatingDriver = false
                    },
                    onSave = {
                        viewModel.saveDriver(it)
                        editingDriver = null
                        creatingDriver = false
                    }
                )
            }
        }

        composable(AppDestination.Students.route) {
            var editingStudent by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.StudentEntity?>(null) }
            var creatingStudent by remember { mutableStateOf(false) }
            if (!creatingStudent && editingStudent == null) {
                StudentListScreen(
                    students = students,
                    guardians = guardians,
                    onBack = { navController.popBackStack() },
                    onAddStudent = {
                        creatingStudent = true
                        editingStudent = null
                    },
                    onEditStudent = {
                        editingStudent = it
                        creatingStudent = false
                    },
                    onDeleteStudent = {
                        viewModel.deleteStudent(it.id)
                    }
                )
            } else {
                StudentFormScreen(
                    student = if (creatingStudent) null else editingStudent,
                    guardians = guardians,
                    schools = schools,
                    vans = vans,
                    drivers = drivers,
                    existingStudents = students,
                    onBack = {
                        editingStudent = null
                        creatingStudent = false
                    },
                    onSave = { viewModel.saveStudent(it) }
                )
            }
        }

        composable(AppDestination.Payments.route) {
            var editingPayment by remember { mutableStateOf<com.softwareinc.perueiroapp.data.local.PaymentEntity?>(null) }
            var creatingPayment by remember { mutableStateOf(false) }
            if (!creatingPayment && editingPayment == null) {
                PaymentListScreen(
                    payments = payments,
                    students = students,
                    onBack = { navController.popBackStack() },
                    onAddPayment = {
                        creatingPayment = true
                        editingPayment = null
                    },
                    onEditPayment = {
                        editingPayment = it
                        creatingPayment = false
                    },
                    onDeletePayment = {
                        viewModel.deletePayment(it.id)
                    }
                )
            } else {
                PaymentFormScreen(
                    payment = if (creatingPayment) null else editingPayment,
                    students = students,
                    onBack = {
                        editingPayment = null
                        creatingPayment = false
                    },
                    onSave = { viewModel.savePayment(it) }
                )
            }
        }

        composable(AppDestination.PaymentNotifications.route) {
            PaymentNotificationScreen(
                guardians = guardians,
                students = students,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = AppDestination.DriverContracts.route,
            arguments = listOf(navArgument("cpf") { type = NavType.StringType })
        ) { entry ->
            val cpf = entry.arguments?.getString("cpf") ?: return@composable
            val contracts by viewModel.observeContractsByDriver(cpf).collectAsState()
            DriverContractsScreen(
                driverCpf = cpf,
                pending = contracts.filter { !it.signed },
                signed = contracts.filter { it.signed },
                onBack = { navController.popBackStack() },
                onRefresh = {
                    viewModel.refreshPendingContracts(driverCpf = cpf)
                    viewModel.refreshSignedContracts(driverCpf = cpf)
                },
                onSendContract = { contractId ->
                    viewModel.sendContracts(listOf(contractId)) {}
                },
                onMarkPending = { contractId ->
                    viewModel.markContractPending(contractId, cpf) {}
                }
            )
        }

        composable(
            route = AppDestination.GuardianContracts.route,
            arguments = listOf(navArgument("cpf") { type = NavType.StringType })
        ) { entry ->
            val cpf = entry.arguments?.getString("cpf") ?: return@composable
            val contracts by viewModel.observeContractsByGuardian(cpf).collectAsState()
            GuardianContractsScreen(
                guardianCpf = cpf,
                pending = contracts.filter { !it.signed },
                signed = contracts.filter { it.signed },
                onBack = { navController.popBackStack() },
                onRefresh = {
                    viewModel.refreshPendingContracts(guardianCpf = cpf)
                    viewModel.refreshSignedContracts(guardianCpf = cpf)
                }
            )
        }
    }
}
