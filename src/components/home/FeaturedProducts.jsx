
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Clock, Cake } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/components/utils/formatters";

export default function FeaturedProducts({ products, isLoading, onAddToCart }) {
  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getProductionTime = (product) => {
    if (!product.is_custom_order) return null;

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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Produtos em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossos produtos mais queridos pelos clientes, feitos com ingredientes premium
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const productionTime = getProductionTime(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_urls?.[0] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={() => window.location.href = `${createPageUrl("Products")}?product=${product.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {product.is_custom_order ? (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500 bg-red-500/90 backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-medium">Sob Encomenda</span>
                    </div>
                  ) : null}
                  
                  <button className="absolute top-4 right-4 glass-card p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                    <Heart className="w-4 h-4 text-pink-600" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-pink-600">
                      {formatPrice(product.price)}
                    </div>
                    {productionTime && (
                      <div className="text-xs text-gray-500">
                        {product.is_custom_order ? `Tempo de preparo: ${productionTime}` : productionTime}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`${createPageUrl("Products")}?product=${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full glass-button border-pink-200 text-pink-700 hover:text-pink-800">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Button
                      onClick={() => onAddToCart(product)}
                      className="glass-button text-pink-700 hover:text-pink-800 px-4"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
              <Cake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum produto em destaque
              </h3>
              <p className="text-gray-500 text-sm">
                Em breve teremos produtos incríveis para você!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
