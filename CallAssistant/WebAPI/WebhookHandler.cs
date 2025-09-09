using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.WebSockets;

namespace WebAPI
{
    public class WebhookHandler: IHttpHandler
    {
        public bool IsReusable => false;

        public void ProcessRequest(HttpContext context)
        {
            // Check if the request is a valid WebSocket request
            if (context.IsWebSocketRequest)
            {
                // If so, accept the request and begin processing
                context.AcceptWebSocketRequest(ProcessSocketRequest);
            }
            else
            {
                // If not, send a 400 Bad Request error
                context.Response.StatusCode = 400;
            }
        }

        private async Task ProcessSocketRequest(AspNetWebSocketContext context)
        {
            WebSocket socket = context.WebSocket;
            var buffer = new ArraySegment<byte>(new byte[1024]);

            // Keep the connection open to listen for messages
            while (socket.State == WebSocketState.Open)
            {
                // Wait for a message from the client
                WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);

                // If the client sent a close message, close the connection
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    return;
                }

                // --- Process the incoming webhook payload ---
                string receivedMessage = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
                Console.WriteLine($"Received: {receivedMessage}");

                // --- Send a response back to the client ---
                string responseMessage = $"Server Acknowledged: '{receivedMessage}' at {DateTime.UtcNow:O}";
                ArraySegment<byte> responseBuffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(responseMessage));
                await socket.SendAsync(responseBuffer, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
}