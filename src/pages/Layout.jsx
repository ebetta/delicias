

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Package, ShoppingCart, Settings as SettingsIcon, Cake, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/toaster";
import localApiClient from '@/api/localApiClient';
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = React.useState(0);
  const [settings, setSettings] = useState({});
  const { currentUser, googleSignIn, logout } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await localApiClient.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();

    updateCartCount();
    
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/home');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isAdmin = currentUser && currentUser.email === 'ebetta@gmail.com';

  const navigationItems = [
    { title: "Início", url: createPageUrl("Home"), icon: Home },
    { title: "Produtos", url: createPageUrl("Products"), icon: Package },
    { title: "Carrinho", url: createPageUrl("Cart"), icon: ShoppingCart, badge: cartCount },
    ...(isAdmin ? [{ title: "Admin", url: createPageUrl("Admin"), icon: SettingsIcon }] : []),
  ];

  const HeaderLogo = () => (
    <Link to={createPageUrl("Home")} className="flex items-center gap-2">
      {settings.headerLogoUrl ? (
        <img src={settings.headerLogoUrl} alt="Delícias da Claudinha" className="h-24 object-contain" />
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 flex items-center justify-center">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
              Delícias da Claudinha
            </h1>
          </div>
        </>
      )}
    </Link>
  );

  const UserNav = () => {
    if (currentUser) {
      const firstName = currentUser.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0];
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 glass-button text-pink-700">
              <User className="w-4 h-4" />
              <span className="font-medium">{firstName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name || currentUser.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/my-orders')}>
              <Package className="mr-2 h-4 w-4" />
              <span>Meus Pedidos</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meus Dados</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 glass-button text-pink-700"
      >
        <User className="w-4 h-4" />
        <span className="font-medium">Entrar</span>
      </Button>
    );
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <style>
        {`
          :root {
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --glass-shadow: rgba(0, 0, 0, 0.1);
            --pink-primary: #ec4899;
            --pink-light: #f9a8d4;
            --pink-gradient: linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%);
            --background-gradient: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%);
          }
          
          .glassmorphism {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          }
          
          .glass-button {
            background: rgba(236, 72, 153, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(236, 72, 153, 0.3);
            transition: all 0.3s ease;
          }
          
          .glass-button:hover {
            background: rgba(236, 72, 153, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(236, 72, 153, 0.2);
          }
          
          .background-animate {
            background: var(--background-gradient);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .floating-element {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>

      <div className="background-animate fixed inset-0 -z-10"></div>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28">
            <HeaderLogo />

            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    location.pathname === item.url
                      ? 'glass-button text-pink-700'
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.title}</span>
                  {item.badge > 0 && (
                    <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <UserNav />
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4">
              <Link
                to={createPageUrl("Cart")}
                className="relative glass-button p-2 rounded-full"
              >
                <ShoppingCart className="w-5 h-5 text-pink-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <UserNav />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden glassmorphism border-t border-white/20">
          <div className="px-4 py-2">
            <div className="flex justify-around">
              {navigationItems.filter(item => item.title !== 'Carrinho').map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === item.url
                      ? 'text-pink-600'
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.title}</span>
                </Link>
              ))}
              {currentUser && (
                 <Link
                  to="/my-orders"
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === '/my-orders'
                      ? 'text-pink-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="text-xs font-medium">Pedidos</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Toast Container */}
      <Toaster />

      {/* Footer */}
      <footer className="glassmorphism mt-20 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Cake className="w-6 h-6 text-pink-500" />
              <h3 className="text-lg font-bold text-gray-800">Delícias da Claudinha</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Os melhores bolos e tortas da região, feitos com carinho e ingredientes selecionados.
            </p>
            
            <div className="text-sm text-gray-500">
              © 2024 Delícias da Claudinha. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

