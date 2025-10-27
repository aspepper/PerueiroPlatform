package com.idealinspecao.perueiroapp.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        GuardianEntity::class,
        SchoolEntity::class,
        VanEntity::class,
        PendingVanEntity::class,
        DriverEntity::class,
        StudentEntity::class,
        PaymentEntity::class,
        SyncStatusEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class IdealDatabase : RoomDatabase() {
    abstract fun idealDao(): IdealDao

    companion object {
        @Volatile
        private var INSTANCE: IdealDatabase? = null

        fun getInstance(context: Context): IdealDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    IdealDatabase::class.java,
                    "ideal_inspecao.db"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            INSTANCE?.let { database ->
                                CoroutineScope(Dispatchers.IO).launch {
                                    prepopulate(database.idealDao())
                                }
                            }
                        }
                    })
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private suspend fun prepopulate(dao: IdealDao) {
            dao.upsertDriver(
                DriverEntity(
                    cpf = "00000000000",
                    name = "Administrador",
                    birthDate = "01/01/1990",
                    address = "",
                    phone = "",
                    workPhone = null,
                    email = "admin@idealinspecao.com",
                    password = "admin123"
                )
            )
        }
    }
}
