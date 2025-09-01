import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ settings }) {
  const whatsapp_number = settings ? settings.whatsappNumber : "5511999998888";
  const whatsapp_message = settings ? settings.whatsappMessage : "Olá! Gostaria de mais informações sobre seus produtos.";

  const phoneNumber = whatsapp_number.replace(/\D/g, '');
  const message = encodeURIComponent(whatsapp_message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </motion.a>
  );
}
