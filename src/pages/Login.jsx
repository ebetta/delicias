import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/components/ui/use-toast"
import LoginForm from '../components/login/LoginForm';
import RegisterForm from '../components/login/RegisterForm';

export default function Login() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { googleSignIn, resetPassword } = useAuth();
  const { toast } = useToast();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu e-mail.",
        variant: "destructive",
      });
      return;
    }
    try {
      await resetPassword(resetEmail);
      setShowResetDialog(false);
      toast({
        title: "E-mail enviado!",
        description: "Se uma conta com este e-mail existir, você receberá um link para redefinir sua senha.",
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail de redefinição. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({
        title: "Erro no Login",
        description: "Não foi possível entrar com o Google. Tente novamente.",
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
              <LoginForm />
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowResetDialog(true)}
                  className="text-sm text-pink-600 hover:underline focus:outline-none"
                >
                  Esqueci minha senha
                </button>
              </div>
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
              <RegisterForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir sua senha</AlertDialogTitle>
            <AlertDialogDescription>
              Digite seu e-mail abaixo. Se ele estiver cadastrado, enviaremos um link para você criar uma nova senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handlePasswordReset}>
            <div className="space-y-2 my-4">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Enviar</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}