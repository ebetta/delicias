import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/api/localApiClient";
import { Button } from "@/components/ui/button";
import { Plus, Package, Settings, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

import ProductForm from "../components/admin/ProductForm";
import ProductList from "../components/admin/ProductList";
import AdminStats from "../components/admin/AdminStats";
import AdminSettings from "../components/admin/AdminSettings";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSave = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
        loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  

  const tabs = [
    { id: "products", label: "Produtos", icon: Package },
    { id: "stats", label: "Estatísticas", icon: BarChart3 },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Gerencie produtos e configurações da loja
            </p>
          </div>
          
          {activeTab === "products" && (
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="glass-button text-pink-700 hover:text-pink-800"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </Button>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-2 mb-8"
        >
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'glass-button text-pink-700'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "products" && !showProductForm && (
            <ProductList
              products={products}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}

          {activeTab === "products" && showProductForm && (
            <ProductForm
              product={editingProduct}
              onSave={handleProductSave}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          )}

          {activeTab === "stats" && (
            <AdminStats products={products} />
          )}

          {activeTab === "settings" && (
            <AdminSettings />
          )}
        </motion.div>
      </div>
    </div>
  );
}