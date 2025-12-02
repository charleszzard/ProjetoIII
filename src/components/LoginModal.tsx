import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, User, Lock, LogIn, AlertCircle } from "lucide-react";
import usersData from "@/data/users.json";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState(""); // Aceita email ou nome para facilitar o teste
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Busca por email OU pelo primeiro nome (para facilitar o teste)
    const user = usersData.find((u) => 
      (u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase().includes(email.toLowerCase())) && 
      u.password === password
    );

    if (user) {
      onLoginSuccess(user);
      onClose();
      // Limpa campos
      setEmail("");
      setPassword("");
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <Card className="w-full max-w-md p-6 relative bg-white shadow-2xl border-none">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-oab rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-transform">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h2>
          <p className="text-sm text-gray-500 mt-1">Digite suas credenciais para continuar.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-mail ou Nome</label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Ex: Pedro Santos"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="******"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gradient-oab text-white h-11 shadow-lg hover:shadow-xl transition-all">
            <LogIn className="w-4 h-4 mr-2" /> Acessar Plataforma
          </Button>
        </form>
      </Card>
    </div>
  );
}