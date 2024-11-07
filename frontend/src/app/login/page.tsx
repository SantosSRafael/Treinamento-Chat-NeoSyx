"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <main className="flex w-full h-full items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col max-w-md mx-auto overflow-hidden border border-gray-700 rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800">
          <h1 className="mb-6 text-3xl font-extrabold text-gray-200">Bem-vindo de Volta!</h1>
          <form className="flex flex-col w-full gap-6" onSubmit={handleLogin}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-blue-500"
              type="text"
              placeholder="Digite seu email"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-blue-500"
              type="password"
              placeholder="Digite sua senha"
            />
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </form>
        </div>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-800">
          <button
            className="w-full px-6 py-3 mb-4 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
            type="submit"
            onClick={handleLogin}
          >
            Login
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-400">Não tem uma conta?</p>
            <a className="text-sm font-semibold text-blue-500 hover:underline" href="/register">
              Clique aqui
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
