import React, { useState, useEffect } from "react";
import { getProducts, getSettings } from "@/api/localApiClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Star, Clock, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast as showToast } from "@/components/ui/use-toast";

import FeaturedProducts from "../components/home/FeaturedProducts";
import HeroSection from "../components/home/HeroSection";
import CategorySection from "../components/home/CategorySection";
import WhatsAppButton from "../components/home/WhatsAppButton";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadFeaturedProducts();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const allProducts = await getProducts();
      const featured = allProducts.filter(p => p.is_featured).slice(0, 6);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Erro ao carregar produtos em destaque:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success toast
    showToast('Produto adicionado ao carrinho com sucesso!');
  };

  return (
    <div className="relative">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-pink-300/20 to-pink-500/20 floating-element"></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-r from-pink-400/20 to-pink-600/20 floating-element" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-96 left-1/3 w-12 h-12 rounded-full bg-gradient-to-r from-pink-200/20 to-pink-400/20 floating-element" style={{animationDelay: '4s'}}></div>

      <HeroSection settings={settings} />
      <CategorySection settings={settings} />
      <FeaturedProducts 
        products={featuredProducts} 
        isLoading={isLoading} 
        onAddToCart={addToCart}
      />

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-pink-300/10"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Pronto para adoçar seu dia?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore nossa coleção completa de bolos, tortas e doces artesanais. 
                Cada produto é feito com amor e ingredientes selecionados.
              </p>
              <Link to={createPageUrl("Products")}>
                <Button className="glass-button text-pink-700 hover:text-pink-800 px-8 py-3 text-lg font-semibold rounded-full">
                  Ver Todos os Produtos
                  <ShoppingCart className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <WhatsAppButton settings={settings} />
    </div>
  );
}