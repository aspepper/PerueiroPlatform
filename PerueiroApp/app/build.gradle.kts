import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
    id("org.jetbrains.kotlin.plugin.compose")
}

val keystoreProgression = Properties().apply {
    val file = project.rootProject.file("keystore.properties")
    if (file.exists()) {
        load(file.inputStream())
    }
}

android {
    namespace = "com.softwareinc.perueiroapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.softwareinc.perueiroapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.001-alpha-student"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        buildConfigField("String", "DEFAULT_REMOTE_PASSWORD", "\"senha123\"")
        val defaultApiBaseUrl = "https://icy-water-08508ba0f.2.azurestaticapps.net/api"

        fun candidate(value: String?): String? = value?.trim()?.takeIf { it.isNotEmpty() }

        fun dotenvValue(key: String): String? {
            return runCatching {
                val envFiles = listOf(
                    project.rootDir.resolve("../.env"),
                    project.rootDir.resolve("../.env.example")
                )

                val envFile = envFiles.firstOrNull { it.exists() }
                if (envFile == null) {
                    return@runCatching null
                }

                envFile.readLines()
                    .asSequence()
                    .map { it.trim() }
                    .firstOrNull { line ->
                        !line.startsWith("#") && line.contains('=') && line.substringBefore('=') == key
                    }
                    ?.substringAfter('=')
                    ?.trim()
                    ?.removeSurrounding("\"", "\"")
                    ?.takeIf { it.isNotEmpty() }
            }.getOrNull()
        }

        val resolvedBaseUrl =
            candidate(project.findProperty("perueiroApiBaseUrl") as? String)
                ?: candidate(System.getenv("PERUEIRO_API_BASE_URL"))
                ?: candidate(dotenvValue("PERUEIRO_API_BASE_URL"))
                ?: defaultApiBaseUrl
        val escapedBaseUrl = resolvedBaseUrl.replace("\"", "\\\"")
        buildConfigField("String", "REMOTE_API_BASE_URL", "\"$escapedBaseUrl\"")

        val resolvedApiKey =
            candidate(project.findProperty("perueiroApiKey") as? String)
                ?: candidate(System.getenv("PERUEIRO_API_KEY"))
                ?: candidate(System.getenv("NEXTAUTH_SECRET"))
                ?: candidate(dotenvValue("PERUEIRO_API_KEY"))
                ?: candidate(dotenvValue("NEXTAUTH_SECRET"))
                ?: ""
        val escapedApiKey = resolvedApiKey.replace("\"", "\\\"")
        buildConfigField("String", "REMOTE_API_KEY", "\"$escapedApiKey\"")
    }

    signingConfigs {
        val storeFilePath =
            keystoreProgression.getProperty("storeFile")
                ?: keystoreProgression.getProperty("storeFilePath")

        if (!storeFilePath.isNullOrBlank()) {
            create("release") {
                storeFile = project.file(storeFilePath)
                storePassword = keystoreProgression.getProperty("storePassword")
                keyAlias = keystoreProgression.getProperty("keyAlias")
                keyPassword = keystoreProgression.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            isDebuggable = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        release {
            isMinifyEnabled = false
            isDebuggable = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfigs.findByName("release")?.let { signingConfig = it }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx.v1120)
    implementation(libs.androidx.lifecycle.runtime.ktx.v270)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose.v182)
    implementation(platform(libs.androidx.compose.bom.v20240600))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.ui.text)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.okhttp)
    implementation(libs.androidx.work.runtime.ktx)
    kapt(libs.androidx.room.compiler)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit.v115)
    androidTestImplementation(libs.androidx.espresso.core.v351)
    androidTestImplementation(platform(libs.androidx.compose.bom.v20240600))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
