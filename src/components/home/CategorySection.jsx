import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import * as icons from 'lucide-react';

export default function CategorySection({ settings }) {
  const categoryData = [
    { name: "Bolos", filter: "bolo", description: settings ? settings['categoryDescription-bolos'] : "Bolos artesanais para todas as ocasiões", gradient: "from-pink-500 to-pink-400", icon: settings ? settings['categoryIcon-bolos'] : 'Cake' },
    { name: "Tortas", filter: "torta", description: settings ? settings['categoryDescription-tortas'] : "Tortas doces e salgadas irresistíveis", gradient: "from-purple-500 to-pink-500", icon: settings ? settings['categoryIcon-tortas'] : 'CakeSlice' },
    { name: "Doces", filter: "doce", description: settings ? settings['categoryDescription-doces'] : "Docinhos finos e brigadeiros gourmet", gradient: "from-pink-400 to-rose-400", icon: settings ? settings['categoryIcon-doces'] : 'Cookie' },
    { name: "Salgados", filter: "salgado", description: settings ? settings['categoryDescription-salgados'] : "Salgadinhos e petiscos deliciosos", gradient: "from-rose-500 to-pink-500", icon: settings ? settings['categoryIcon-salgados'] : 'Croissant' }
  ];

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
            Nossas Especialidades
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore nossas categorias e encontre o doce perfeito para cada momento especial
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryData.map((category, index) => {
            const iconName = category.icon;
            const IconComponent = icons[iconName] || icons.Cake;
            
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link to={`${createPageUrl("Products")}?category=${category.filter}`}>
                  <div className="glass-card rounded-3xl p-8 text-center transition-all duration-300 group-hover:shadow-xl">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
