
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, ShoppingCart, Clock, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters";

export default function ProductDetail({ product, onBack, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setQuantity(1);
    // Remove the showToast call from here since onAddToCart already handles it
  };

  const getProductionTime = () => {
    const days = product.production_time_days || 0;
    const hours = product.production_time_hours || 0;
    
    if (days === 0 && hours === 0) return null;
    
    let timeText = '';
    if (days > 0) {
      timeText += `${days} dia${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      if (timeText) timeText += ' e ';
      timeText += `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    
    return timeText;
  };

  const images = product.image_urls || ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"];
  const productionTime = getProductionTime();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="glass-button border-pink-200 text-pink-700 hover:text-pink-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-3xl overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-pink-500'
                        : 'border-transparent hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-pink-100 text-pink-800 capitalize">
                  {product.category}
                </Badge>
                {product.is_custom_order ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500 bg-red-500 text-white">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm font-medium">Sob Encomenda</span>
                  </div>
                ) : null}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                {product.name}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-pink-600">
                  {formatPrice(product.price)}
                </div>
                {productionTime && (
                  <div className="text-sm text-gray-500">
                    {product.is_custom_order ? `Tempo de preparo: ${productionTime}` : `Prazo: ${productionTime}`}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="glass-button border-pink-200"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="glass-button border-pink-200"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-lg font-semibold text-gray-800">
                  Total: {formatPrice(product.price * quantity)}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 glass-button text-pink-700 hover:text-pink-800 py-3 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-button border-pink-200 text-pink-700 hover:text-pink-800 p-3"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {product.is_custom_order && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Produto Sob Encomenda
                </h3>
                <p className="text-gray-600 text-sm">
                  Este produto é feito especialmente para você! O prazo de produção é de {productionTime} após a confirmação do pedido.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
