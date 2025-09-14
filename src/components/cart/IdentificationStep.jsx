import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import GoogleIcon from '@/components/ui/GoogleIcon';

export default function IdentificationStep({ onIdentificationComplete }) {
  const { currentUser, googleSignIn, login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn(onIdentificationComplete);
    } catch (error) {
      setError('Falha ao fazer login com o Google.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, onIdentificationComplete);
    } catch (error) {
      setError('Email ou senha inválidos.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, onIdentificationComplete);
    } catch (error) {
      setError('Falha ao criar conta. Verifique o email e a senha.');
    }
  };

  if (currentUser) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-4">
        <h3 className="font-semibold text-lg text-gray-800">Bem-vindo(a) de volta!</h3>
        <p className="text-gray-600 mb-4">{currentUser.displayName || currentUser.email}</p>
        <Button onClick={onIdentificationComplete} className="glass-button text-pink-700 hover:text-pink-800">
          Continuar
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-button border-pink-200" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="button" onClick={handleLogin} className="w-full glass-button text-pink-700 hover:text-pink-800">Entrar</Button>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-button border-pink-200" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="button" onClick={handleSignup} className="w-full glass-button text-pink-700 hover:text-pink-800">Criar Conta</Button>
          </form>
        </TabsContent>
      </Tabs>
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">ou</p>
        <Button type="button" onClick={handleGoogleSignIn} variant="outline" className="w-full glass-button border-pink-200 flex items-center gap-2">
          <GoogleIcon className="w-5 h-5" />
          Entrar com Google
        </Button>
      </div>
    </motion.div>
  );
}
