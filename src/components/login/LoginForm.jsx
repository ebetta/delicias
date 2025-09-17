import React, { useState } from 'react';
import { Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast"

export default function LoginForm() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
    } catch (error) {
      console.error("Erro no login com e-mail:", error);
      toast({
        title: "Erro no Login",
        description: "E-mail ou senha inválidos. Verifique e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="login-email" 
            type="email" 
            placeholder="seu@email.com" 
            required 
            autoComplete="off"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="login-password" 
            type="password" 
            placeholder="Sua senha" 
            required 
            autoComplete="new-password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
        Entrar com E-mail
      </Button>
    </form>
  );
}
