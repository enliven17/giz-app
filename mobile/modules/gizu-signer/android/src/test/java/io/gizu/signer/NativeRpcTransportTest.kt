package io.gizu.signer

import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.SocketPolicy
import org.junit.Assert.*
import org.junit.Test
import java.util.concurrent.TimeUnit

class NativeRpcTransportTest {
  @Test fun returnsSuccessfulBody() = runBlocking {
    MockWebServer().use { server ->
      server.enqueue(MockResponse().setBody("{\"result\":\"0x279f\"}"))
      val result = NativeRpcTransport(server.url("/").toString()).post("{}")
      assertEquals("{\"result\":\"0x279f\"}", result)
    }
  }
  @Test fun doesNotFollowRedirects() = runBlocking {
    MockWebServer().use { server ->
      server.enqueue(MockResponse().setResponseCode(302).addHeader("Location", server.url("/other")))
      try { NativeRpcTransport(server.url("/").toString()).post("{}"); fail("Redirect accepted") }
      catch (failure: RpcFailure) { assertEquals(RpcFailureCode.HTTP, failure.code) }
      assertEquals(1, server.requestCount)
    }
  }
  @Test fun oversizedBodyFailsWithoutReturningItsContents() = runBlocking {
    MockWebServer().use { server ->
      server.enqueue(MockResponse().setBody("x".repeat(1_048_577)))
      try { NativeRpcTransport(server.url("/").toString()).post("{}"); fail("Oversized body accepted") }
      catch (failure: RpcFailure) { assertEquals(RpcFailureCode.RESPONSE_TOO_LARGE, failure.code) }
    }
  }
  @Test fun aStalledRequestTimesOutWithASanitizedError() = runBlocking {
    MockWebServer().use { server ->
      server.enqueue(MockResponse().setSocketPolicy(SocketPolicy.NO_RESPONSE))
      val client = OkHttpClient.Builder().callTimeout(150, TimeUnit.MILLISECONDS).build()
      withTimeout(3000) {
        try { NativeRpcTransport(server.url("/").toString(), client).post("{}"); fail("No timeout") }
        catch (failure: RpcFailure) { assertEquals(RpcFailureCode.TIMEOUT, failure.code); assertEquals("TIMEOUT", failure.message) }
      }
    }
  }
  @Test fun cancellingPreparationCancelsTheHttpCall() = runBlocking {
    MockWebServer().use { server ->
      server.enqueue(MockResponse().setSocketPolicy(SocketPolicy.NO_RESPONSE))
      val client = OkHttpClient.Builder().build()
      val request = async(Dispatchers.Default) { NativeRpcTransport(server.url("/").toString(), client).post("{}") }
      assertNotNull(withContext(Dispatchers.IO) { server.takeRequest(3, TimeUnit.SECONDS) })
      withTimeout(1000) { request.cancelAndJoin() }
      assertTrue(request.isCancelled)
      assertTrue(client.dispatcher.runningCalls().all { it.isCanceled() })
    }
  }
}
