import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection({ settings }) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="glass-card px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2 text-pink-600">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">Feito com amor</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold leading-tight"
              >
                <span className="text-gray-800">Doces que</span><br />
                <span className="bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                  derretem corações
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-600 max-w-lg"
              >
                Descubra a magia dos nossos bolos e tortas artesanais. 
                Cada fatia é uma experiência única de sabor e carinho.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to={createPageUrl("Products")}>
                <Button className="glass-button text-pink-700 hover:text-pink-800 px-8 py-3 text-lg font-semibold rounded-full group">
                  Explorar Produtos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-pink-200/50"></div>
              <div className="relative z-10">
                <img
                  src={settings?.heroImageUrl}
                  alt="Bolo artesanal"
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass-card p-4 rounded-2xl"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-pink-600">{settings?.floatingText1}</div>
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              className="absolute -bottom-4 -left-4 glass-card p-4 rounded-2xl w-auto max-w-xs"
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-pink-600">{settings?.floatingText2}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
