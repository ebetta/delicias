import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { BASE_URL } from "@/api/localApiClient";

export default function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "bolo",
    is_featured: product?.is_featured || false,
    is_available: product?.is_available ?? true,
    is_custom_order: product?.is_custom_order || false,
    production_time_days: product?.production_time_days || 0,
    production_time_hours: product?.production_time_hours || 0,
    image_urls: product?.image_urls || [] // Keep this for data consistency, but won't be handled in UI
  });
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          image_urls: [...prev.image_urls, ...data.urls]
        }));
      } else {
        console.error('Upload failed:', data.message);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      production_time_days: parseInt(formData.production_time_days) || 0,
      production_time_hours: parseInt(formData.production_time_hours) || 0
    };
    
    onSave(dataToSave);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onCancel}
          variant="outline"
          size="icon"
          className="glass-button border-pink-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <p className="text-gray-600">
            {product ? "Modifique as informações do produto" : "Adicione um novo produto à loja"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Bolo de Chocolate Premium"
              required
              className="glass-button border-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="0.00"
              required
              className="glass-button border-pink-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descreva o produto..."
            rows={4}
            className="glass-button border-pink-200"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="glass-button border-pink-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bolo">Bolo</SelectItem>
                <SelectItem value="torta">Torta</SelectItem>
                <SelectItem value="doce">Doce</SelectItem>
                <SelectItem value="salgado">Salgado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="production_days">Tempo de Produção (dias)</Label>
            <Input
              id="production_days"
              type="number"
              min="0"
              value={formData.production_time_days}
              onChange={(e) => handleInputChange("production_time_days", e.target.value)}
              className="glass-button border-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production_hours">Tempo de Produção (horas)</Label>
            <Input
              id="production_hours"
              type="number"
              min="0"
              max="23"
              value={formData.production_time_hours}
              onChange={(e) => handleInputChange("production_time_hours", e.target.value)}
              placeholder="0-23 horas"
              className="glass-button border-pink-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Imagens do Produto</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.image_urls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url.startsWith('/') ? `${BASE_URL}${url}` : url}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-pink-400 transition-colors flex-1">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
              ) : (
                <>
                  {/* You might need to import ImageIcon from lucide-react if not already */}
                  <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Adicionar Imagens</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_available">Produto disponível</Label>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => handleInputChange("is_available", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_featured">Produto em destaque</Label>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_custom_order">Apenas sob encomenda</Label>
            <Switch
              id="is_custom_order"
              checked={formData.is_custom_order}
              onCheckedChange={(checked) => handleInputChange("is_custom_order", checked)}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 glass-button border-pink-200 text-pink-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 glass-button text-pink-700 hover:text-pink-800"
          >
            {product ? "Atualizar" : "Criar"} Produto
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
