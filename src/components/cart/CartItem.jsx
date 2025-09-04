
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/components/utils/formatters"; // Corrected import path
import { BASE_URL } from "@/api/localApiClient";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 py-4 border-b border-white/20 last:border-b-0"
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={item.image_urls?.[0] ? `${BASE_URL}${item.image_urls[0]}` : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
        <p className="text-sm text-pink-600">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="glass-button border-pink-200 p-2 h-8 w-8"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-semibold text-gray-800">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="glass-button border-pink-200 p-2 h-8 w-8"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-24 text-right font-bold text-gray-800">
        {formatPrice(item.price * item.quantity)}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="text-gray-500 hover:text-red-500 p-2"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
