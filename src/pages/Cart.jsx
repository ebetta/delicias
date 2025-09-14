
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Trash2, Frown } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters";

import { useAuth } from "../context/AuthContext.jsx";
import localApiClient from "@/api/localApiClient";

import CartItem from "../components/cart/CartItem";
import CheckoutForm from "../components/cart/CheckoutForm";

const initialFormData = {
  phone: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zip_code: ""
  },
  paymentMethod: "pix",
  notes: "",
  saveAddress: true
};

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const showCheckout = searchParams.get('step') === 'checkout';

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('checkoutForm');
    return savedData ? JSON.parse(savedData) : initialFormData;
  });

  useEffect(() => {
    localStorage.setItem('checkoutForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    loadCart();
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  useEffect(() => {
    if (showCheckout && currentUser) {
      const fetchProfile = async () => {
        try {
          const profile = await localApiClient.get(`/profile/${currentUser.uid}`);
          if (profile) {
            setFormData(prev => ({
              ...prev,
              phone: profile.phone || prev.phone,
              address: {
                street: profile.street || prev.address.street,
                number: profile.number || prev.address.number,
                complement: profile.complement || prev.address.complement,
                neighborhood: profile.neighborhood || prev.address.neighborhood,
                city: profile.city || prev.address.city,
                zip_code: profile.zip_code || prev.address.zip_code
              },
            }));
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      };
      fetchProfile();
    }
  }, [showCheckout, currentUser]);
  
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
    setIsSubmitting(true);
    
    if (checkoutData.saveAddress && currentUser) {
      try {
        await localApiClient.post('/profile', { 
          userId: currentUser.uid,
          name: currentUser.displayName,
          phone: checkoutData.phone,
          address: checkoutData.address,
          paymentMethod: checkoutData.paymentMethod
        });
      } catch (error) {
        console.error("Failed to save profile:", error);
        // Non-critical error, so we don't block the checkout
      }
    }

    console.log("Checkout Data:", checkoutData);
    alert("Pedido finalizado com sucesso! (Simulação)");
    
    setIsSubmitting(false);
    updateCartStorage([]);
    localStorage.removeItem('checkoutForm');
    navigate(createPageUrl("Home"));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleShowCheckout = () => {
    setSearchParams({ step: 'checkout' });
  };

  const handleBackToCart = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {showCheckout ? 'Finalizar Pedido' : 'Seu Carrinho de Compras'}
          </h1>
          <p className="text-gray-600">
            {showCheckout ? 'Complete os dados para concluir sua compra' : 'Revise seus itens e finalize seu pedido'}
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
                      onClick={handleShowCheckout}
                      className="flex-1 glass-button text-pink-700 hover:text-pink-800"
                      disabled={cart.length === 0}
                    >
                      Finalizar Compra
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CheckoutForm
                formData={formData}
                setFormData={setFormData}
                onBack={handleBackToCart}
                onSubmit={handleCheckout}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

