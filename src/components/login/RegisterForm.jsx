import React, { useState } from 'react';
import { Mail, KeyRound, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast"

export default function RegisterForm() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Erro no Registro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    try {
      await signup(registerEmail, registerPassword, registerName);
    } catch (error) {
      console.error("Erro no registro com e-mail:", error);
      let description = "Não foi possível criar a conta. Verifique o e-mail ou tente novamente.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.";
          break;
        case 'auth/weak-password':
          description = "A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.";
          break;
        case 'auth/invalid-email':
          description = "O formato do e-mail é inválido.";
          break;
      }
      toast({
        title: "Erro no Registro",
        description: description,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleEmailRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nome</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="register-name" 
            type="text" 
            placeholder="Seu nome completo" 
            required 
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="register-email" 
            type="email" 
            placeholder="seu@email.com" 
            required 
            autoComplete="off"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="register-password" 
            type="password" 
            placeholder="Cadastre a sua senha" 
            required 
            autoComplete="off"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Senha</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            id="confirm-password" 
            type="password" 
            placeholder="Confirme sua senha" 
            required 
            autoComplete="new-password"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
        Criar Conta
      </Button>
    </form>
  );
}
