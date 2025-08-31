
import React from "react";
import { Package, Star, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters";

export default function AdminStats({ products }) {
  const stats = {
    total: products.length,
    available: products.filter(p => p.is_available).length,
    featured: products.filter(p => p.is_featured).length,
    customOrder: products.filter(p => p.is_custom_order).length,
    averagePrice: products.length > 0 
      ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
      : 0
  };

  const statCards = [
    {
      title: "Total de Produtos",
      value: stats.total,
      icon: Package,
      color: "blue"
    },
    {
      title: "Produtos Disponíveis", 
      value: stats.available,
      icon: Package,
      color: "green"
    },
    {
      title: "Em Destaque",
      value: stats.featured,
      icon: Star,
      color: "yellow"
    },
    {
      title: "Sob Encomenda",
      value: stats.customOrder,
      icon: Clock,
      color: "orange"
    },
    {
      title: "Preço Médio",
      value: formatPrice(stats.averagePrice),
      icon: DollarSign,
      color: "pink"
    }
  ];

  const colorMap = {
    blue: "from-blue-500 to-blue-400",
    green: "from-green-500 to-green-400", 
    yellow: "from-yellow-500 to-yellow-400",
    orange: "from-orange-500 to-orange-400",
    pink: "from-pink-500 to-pink-400"
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${colorMap[stat.color]} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Produtos por Categoria
          </h3>
          <div className="space-y-3">
            {['bolo', 'torta', 'doce', 'salgado'].map(category => {
              const count = products.filter(p => p.category === category).length;
              const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Resumo da Loja
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Disponibilidade</span>
              <span className="font-semibold text-green-600">
                {products.length > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Produtos em Destaque</span>
              <span className="font-semibold text-yellow-600">
                {products.length > 0 ? ((stats.featured / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sob Encomenda</span>
              <span className="font-semibold text-orange-600">
                {products.length > 0 ? ((stats.customOrder / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <hr className="border-gray-200" />
            <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
              <div className="text-2xl font-bold text-pink-600">
                {formatPrice(stats.averagePrice)}
              </div>
              <div className="text-sm text-pink-700">
                Preço médio dos produtos
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
