import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProductCard({ product, index, onAddToCart, onViewDetail }) {
  const getProductionTime = () => {
    if (!product.is_custom_order) return null; // Add this line

    const days = product.production_time_days || 0;
    const hours = product.production_time_hours || 0;
    
    if (days === 0 && hours === 0) return null;
    
    let timeText = '';
    if (days > 0) {
      timeText += `${days} dia${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      if (timeText) timeText += ' e ';
      timeText += `${hours}h`;
    }
    
    return timeText;
  };

  const productionTime = getProductionTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_urls?.[0] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
          onClick={() => onViewDetail(product)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {product.is_custom_order ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full border border-red-500 bg-red-500/90 backdrop-blur-sm">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">Sob Encomenda</span>
          </div>
        ) : null}
        
        <button className="absolute top-3 right-3 glass-card p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
          <Heart className="w-4 h-4 text-pink-600" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-pink-600">
            {formatPrice(product.price)}
          </div>
          {productionTime && (
            <div className="text-xs text-gray-500">
              {product.is_custom_order ? `Tempo de preparo: ${productionTime}` : productionTime}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetail(product)}
            variant="outline"
            className="flex-1 glass-button border-pink-200 text-pink-700 hover:text-pink-800"
            size="sm"
          >
            Ver Detalhes
          </Button>
          <Button
            onClick={() => onAddToCart(product)}
            className="glass-button text-pink-700 hover:text-pink-800 px-4"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}