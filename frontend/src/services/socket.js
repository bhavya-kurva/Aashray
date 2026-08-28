let socket = null;
const listeners = new Set();

export const initWebSocket = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket('ws://localhost:8000/api/ws');

    socket.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        listeners.forEach((callback) => callback(payload));
      } catch (err) {
        // Safe catch for heartbeat checks or non-JSON data
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed. Reconnecting in 3 seconds...');
      socket = null;
      setTimeout(initWebSocket, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket encountered error:', error);
      socket.close();
    };
  } catch (e) {
    console.error('Failed to initialize WebSocket:', e);
    setTimeout(initWebSocket, 5000);
  }
};

export const subscribeToEvents = (callback) => {
  listeners.add(callback);
  // Return cleanup function to unsubscribe
  return () => {
    listeners.delete(callback);
  };
};

export const sendSocketMessage = (text) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(text);
  }
};
