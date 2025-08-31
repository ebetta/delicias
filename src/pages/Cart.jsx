
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Trash2, Frown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters";

import CartItem from "../components/cart/CartItem";
import CheckoutForm from "../components/cart/CheckoutForm";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);
  
  const loadCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartItems);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCartStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    updateCartStorage(updatedCart);
  };

  const updateCartStorage = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = async (checkoutData) => {
    console.log("Checkout Data:", checkoutData);
    alert("Pedido finalizado com sucesso! (Simulação)");
    updateCartStorage([]);
    navigate(createPageUrl("Home"));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Seu Carrinho de Compras
          </h1>
          <p className="text-gray-600">
            Revise seus itens e finalize seu pedido
          </p>
        </motion.div>

        {cart.length === 0 && !showCheckout ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
              <Frown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Parece que você ainda não adicionou nenhum produto.
              </p>
              <Link to={createPageUrl("Products")}>
                <Button className="glass-button text-pink-700 hover:text-pink-800">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Explorar Produtos
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {!showCheckout ? (
              <>
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  {cart.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-pink-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Link to={createPageUrl("Products")} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full glass-button border-pink-200 text-pink-700"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continuar Comprando
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="flex-1 glass-button text-pink-700 hover:text-pink-800"
                    >
                      Finalizar Compra
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CheckoutForm
                onBack={() => setShowCheckout(false)}
                onSubmit={handleCheckout}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
