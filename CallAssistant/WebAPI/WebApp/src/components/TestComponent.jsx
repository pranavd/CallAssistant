import React, { useEffect } from 'react';

const TestComponent = () => {

    useEffect(() => {
        // A public WSS endpoint for testing
        const wssUrl = "wss://7cd1c703a1eb.ngrok-free.app/ws";

        // 1. Create a new WebSocket object to initiate the connection
        const socket = new WebSocket(wssUrl);

        // 2. Define what happens when the connection is successfully opened
        socket.onopen = (event) => {
            console.log("✅ Connection opened!", event);

            // Send a message to the server
            socket.send("Hello from the browser! 👋");
        };

        // 3. Define what happens when a message is received from the server
        socket.onmessage = (event) => {
            console.log("⬅️ Message from server:", event.data);
        };

        // 4. Define what happens if an error occurs
        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        // 5. Define what happens when the connection is closed
        socket.onclose = (event) => {
            console.log("❌ Connection closed.");
            if (event.wasClean) {
                console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.error('Connection died');
            }
        };
    }, []);

    return (
        <div>This is text component</div>
    );
}

export default TestComponent;