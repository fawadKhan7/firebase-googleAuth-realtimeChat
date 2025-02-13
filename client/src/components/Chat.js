import React, { useState, useEffect } from "react";
import { sendMessage, listenMessages } from "../config/firebaseConfig";

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = listenMessages(setMessages);
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() && user) {
      await sendMessage(message, user);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Live Chat</h2>

      <div className="flex-1 overflow-y-auto bg-white p-3 rounded-lg shadow-md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.user.email === user.email ? "text-right" : "text-left"}`}
          >
            <p className="text-sm font-semibold">{msg.user.name}</p>
            <p className="p-2 bg-gray-200 rounded-lg inline-block">
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded-l-md"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="px-4 bg-blue-500 text-white rounded-r-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
