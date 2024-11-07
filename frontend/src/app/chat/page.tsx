'use client';

import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

interface Message {
  to: User;
  sender: User;
  content: string;
}

interface User {
  id: number;
  name: string;
}

export default function Page() {
  const { user } = useAuth();
  const { selectedUser } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getMessages = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/auth/getMessages');
      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      const data = await response.json();

      const formattedMessages = data.map((row: any) => ({
        to: { id: row.idUserPara, name: row.nameUserPara },
        sender: { id: row.idUserDe, name: row.nameUserDe },
        content: row.mensagem
      }));

      setMessages(formattedMessages);

    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    getMessages();

    if (!selectedUser || !user) return;

    socket.emit("join-room", selectedUser.id);
    socket.emit("join-room", user.id);

    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, [selectedUser, user]);

  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    let newMessage: Message = {
      to: selectedUser as User,
      sender: user as User,
      content: messageContent,
    };

    try {
      const response = await fetch('http://localhost:8888/api/auth/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar a mensagem');
      }

      socket.emit("message", { to: selectedUser, message: newMessage });
      setMessageContent("");
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const filteredMessages = messages.filter((message) =>
    (message?.to?.id === user?.id && message?.sender?.id === selectedUser?.id) || (message?.to?.id === selectedUser?.id && message?.sender?.id === user?.id)
  );

  return (
    selectedUser && (
      <main className="flex flex-col justify-between bg-gray-900 min-h-96 h-full w-full flex-1 p-4 border border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center justify-end p-4 border-b border-gray-700">
          <span className="text-sm text-gray-400 mr-2">Logado como:</span>
          <span className="text-sm text-gray-200 mr-4">{user?.name}</span>
          <img src={'https://img.freepik.com/vetores-premium/perfil-de-avatar-de-homem-no-icone-redondo_24640-14044.jpg'} alt="Profile" className="w-8 h-8 rounded-full" />
        </div>
        <header className="flex items-center p-4 bg-gray-700 border-b border-gray-700 rounded-lg shadow-lg">
          <img src={'https://img.freepik.com/vetores-premium/perfil-de-avatar-de-homem-no-icone-redondo_24640-14044.jpg'} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
          <h2 className="text-lg font-bold text-gray-200">{selectedUser.name}</h2>
        </header>
        <div className="flex flex-col w-full h-full p-2 text-gray-200 overflow-y-scroll space-y-2">
          {filteredMessages.map((message, index) => {
            const showName = index === 0 || message.to?.id !== filteredMessages[index - 1].to?.id;

            return (
              <div
                key={index}
                className={`flex flex-row w-full ${message.sender?.id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`mt-1 p-3 rounded-lg shadow-md ${
                    message.sender?.id === user?.id ? "bg-blue-600" : "bg-green-600"
                  } transition-all duration-300 ease-in-out transform hover:scale-105`}
                >
                  {showName && (
                    <span className="block text-sm font-semibold text-gray-300 mb-1">
                      ~ {message.sender.name}
                    </span>
                  )}
                  <p className="text-white">{message.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <input
          className="mt-2 p-3 text-gray-200 bg-gray-800 border border-gray-600 rounded-lg outline-none transition-all duration-300 ease-in-out focus:bg-gray-700 focus:border-blue-500"
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Digite sua mensagem..."
        />
      </main>
    )
  );
}
