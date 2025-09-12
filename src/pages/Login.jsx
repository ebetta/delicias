
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { Cake, Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/home');
      toast({
        title: "Login bem-sucedido!",
        description: "Você entrou com sua conta Google.",
      });
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({
        title: "Erro no Login",
        description: "Não foi possível entrar com o Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      navigate('/home');
      toast({
        title: "Login bem-sucedido!",
        description: "Seja bem-vindo(a) de volta!",
      });
    } catch (error) {
      console.error("Erro no login com e-mail:", error);
      toast({
        title: "Erro no Login",
        description: "E-mail ou senha inválidos. Verifique e tente novamente.",
        variant: "destructive",
      });
    }
  };

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
      await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      navigate('/home');
      toast({
        title: "Registro bem-sucedido!",
        description: "Sua conta foi criada. Seja bem-vindo(a)!",
      });
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
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="register">Registrar</TabsTrigger>
        </TabsList>
        
        {/* Formulário de Login */}
        <TabsContent value="login">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Cake className="w-7 h-7 text-pink-500" />
                <CardTitle className="text-2xl">Bem-vindo(a) de volta!</CardTitle>
              </div>
              <CardDescription>
                Use seu e-mail ou conta Google para entrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <FcGoogle className="mr-2 h-5 w-5" />
                Entrar com Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formulário de Registro */}
        <TabsContent value="register">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Cake className="w-7 h-7 text-pink-500" />
                <CardTitle className="text-2xl">Crie sua conta</CardTitle>
              </div>
              <CardDescription>
                É rápido e fácil. Vamos começar!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                   <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      required 
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
                      placeholder="Crie uma senha forte" 
                      required 
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
