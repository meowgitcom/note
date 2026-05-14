package sync

import AppDatabase
import Transaction
import User
import Workspace
import Member
import Page
import Block
import config.baseurl
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.websocket.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

@Serializable
data class Operation(
    val command: String,
    val table: String,
    val id: String,
    val data: JsonObject? = null
)

class SyncManager(private val db: AppDatabase, private val workspaceId: String) {
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) { json(json) }
        install(WebSockets) {
            contentConverter = KotlinxWebsocketSerializationConverter(json)
        }
    }

    private var lastSeq: Long = 0

    suspend fun sync() {
        pull()
        push()
    }

    private suspend fun pull() {
        try {
            val transactions: List<Transaction> = client.get("$baseurl/sync/pull/$workspaceId") {
                parameter("lastSeq", lastSeq)
            }.body()

            if (transactions.isNotEmpty()) {
                rebase(transactions)
            }
        } catch (e: Exception) {
            println("Pull failed: ${e.message}")
        }
    }

    private suspend fun rebase(remoteTxs: List<Transaction>) {
        remoteTxs.forEach { tx ->
            applyTransaction(tx)
            if (tx.seq > lastSeq) lastSeq = tx.seq
        }

        val pendingLocal = db.transactionDao().getPending(workspaceId)

        pendingLocal.forEach { localTx ->
            val ops = try {
                json.decodeFromString<List<Operation>>(localTx.operations)
            } catch (e: Exception) {
                return@forEach
            }

            val validOps = ops.filter { op -> validateOperation(op) }
            if (validOps.isNotEmpty()) {
                validOps.forEach { applyOperation(it) }
                val updatedTx = localTx.copy(operations = json.encodeToString<List<Operation>>(validOps))
                db.transactionDao().update(updatedTx)
            } else {
                db.transactionDao().delete(localTx)
            }
        }
    }

    private suspend fun validateOperation(op: Operation): Boolean {
        return when (op.table) {
            "User" -> {
                if (op.command == "delete") {
                    val existing = db.userDao().getById(op.id)
                    existing != null && !existing.deleted
                } else true
            }
            "Workspace" -> {
                if (op.command == "delete") {
                    val existing = db.workspaceDao().getById(op.id)
                    existing != null && !existing.deleted
                } else true
            }
            "Page" -> {
                if (op.command == "delete") {
                    val existing = db.pageDao().getById(op.id)
                    existing != null && !existing.deleted
                } else true
            }
            "Block" -> {
                if (op.command == "delete") {
                    val existing = db.blockDao().getById(op.id)
                    existing != null && !existing.deleted
                } else true
            }
            else -> false
        }
    }

    private suspend fun applyOperation(op: Operation) {
        val data = op.data ?: return

        when (op.table) {
            "User" -> {
                val user = json.decodeFromJsonElement<User>(data)
                if (op.command == "delete") db.userDao().softDelete(op.id) else db.userDao().upsert(user)
            }
            "Workspace" -> {
                val workspace = json.decodeFromJsonElement<Workspace>(data)
                if (op.command == "delete") db.workspaceDao().softDelete(op.id) else db.workspaceDao().upsert(workspace)
            }
            "Page" -> {
                val page = json.decodeFromJsonElement<Page>(data)
                if (op.command == "delete") db.pageDao().softDelete(op.id) else db.pageDao().upsert(page)
            }
            "Block" -> {
                val block = json.decodeFromJsonElement<Block>(data)
                if (op.command == "delete") db.blockDao().softDelete(op.id) else db.blockDao().upsert(block)
            }
            "Member" -> {
                val member = json.decodeFromJsonElement<Member>(data)
                if (op.command == "delete") db.memberDao().softDelete(member.workspaceId, member.userId) else db.memberDao().upsert(member)
            }
        }
    }

    private suspend fun applyTransaction(tx: Transaction) {
        val ops = json.decodeFromString<List<Operation>>(tx.operations)
        ops.forEach { applyOperation(it) }
    }

    private suspend fun push() {
        try {
            val pendingTxs = db.transactionDao().getPending(workspaceId)
            if (pendingTxs.isEmpty()) return

            val response: HttpResponse = client.post("$baseurl/sync/push/$workspaceId") {
                contentType(ContentType.Application.Json)
                setBody(pendingTxs.map { tx ->
                    mapOf(
                        "id" to tx.id,
                        "user_id" to tx.userId,
                        "operations" to tx.operations
                    )
                })
            }

            if (response.status.isSuccess()) {
                val result = response.body<SyncResponse>()
                pendingTxs.forEach { tx ->
                    db.transactionDao().delete(tx)
                }
                lastSeq = result.lastSeq
            }
        } catch (e: Exception) {
            println("Push failed: ${e.message}")
        }
    }

    @Serializable
    private data class SyncResponse(val success: Boolean = true, val lastSeq: Long = 0)

    fun startWebSocket(scope: CoroutineScope) {
        val wsUrl = baseurl?.replace("http", "ws")?.replace("https", "wss") ?: return
        scope.launch {
            while (isActive) {
                try {
                    client.webSocket(wsUrl + "/ws/$workspaceId") {
                        while (true) {
                            val frame = incoming.receive()
                            if (frame is Frame.Text) {
                                val text = frame.readText()
                                if (text.contains("fetch_needed")) {
                                    pull()
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    delay(5000)
                }
            }
        }
    }
}