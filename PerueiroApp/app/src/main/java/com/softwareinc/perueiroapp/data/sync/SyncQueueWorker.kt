package com.softwareinc.perueiroapp.data.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.softwareinc.perueiroapp.data.local.IdealDatabase
import com.softwareinc.perueiroapp.data.local.IdealRepository
import com.softwareinc.perueiroapp.data.local.UserSessionDataSource
import com.softwareinc.perueiroapp.data.remote.SyncApiService
import com.softwareinc.perueiroapp.model.UserRole
import kotlinx.coroutines.flow.first
import org.json.JSONObject

class SyncQueueWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val session = UserSessionDataSource(applicationContext).session.first()
            ?: return Result.success()
        val token = session.token?.takeIf { it.isNotBlank() } ?: return Result.retry()
        val role = runCatching { UserRole.valueOf(session.role) }.getOrNull()

        val dao = IdealDatabase.getInstance(applicationContext).idealDao()
        val queue = dao.getPendingSyncQueue()
        if (queue.isEmpty()) return Result.success()

        val operations = queue.map { item ->
            SyncApiService.SyncQueueOperation(
                queueId = item.id,
                entityType = item.entityType,
                entityId = item.entityId,
                operation = item.operation,
                payload = JSONObject(item.payload),
                clientUpdatedAt = item.enqueuedAt
            )
        }

        return try {
            val response = SyncApiService().pushQueue(token, operations)

            response.appliedIds.forEach { dao.deleteSyncQueue(it) }
            response.conflictIds.forEach { dao.deleteSyncQueue(it) }

            if (response.conflictIds.isNotEmpty()) {
                val repository = IdealRepository(dao, applicationContext)
                repository.syncFromServer(
                    role,
                    session.cpf,
                    token
                )
            }

            Result.success()
        } catch (exception: Exception) {
            val now = System.currentTimeMillis()
            queue.forEach { item ->
                val attempts = item.attempts + 1
                dao.updateSyncQueueAttempt(item.id, attempts, now)
            }
            Result.retry()
        }
    }

    companion object {
        private const val UNIQUE_WORK_NAME = "sync-queue-worker"

        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            val request = OneTimeWorkRequestBuilder<SyncQueueWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_WORK_NAME,
                ExistingWorkPolicy.KEEP,
                request
            )
        }
    }
}
