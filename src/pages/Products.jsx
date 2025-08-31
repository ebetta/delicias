
import React, { useState, useEffect } from "react";
import { getProducts } from "@/api/localApiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, ShoppingCart, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast as showToast } from "@/components/ui/use-toast"; // Added import

import ProductCard from "../components/products/ProductCard";
import ProductDetail from "../components/products/ProductDetail";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // We run this separately to ensure products are loaded before we check for a specific product ID
    // or if a specific product needs to be fetched after initial load.
    if (!isLoading) {
      checkUrlParams();
    }
  }, [isLoading, products]); // Added products to dependency array to ensure check runs if products update after initial load

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const productId = urlParams.get('product');
    
    if (category) {
      setCategoryFilter(category);
    }
    
    if (productId && !showDetail) { // Added !showDetail to prevent re-loading if already in detail view
      loadProductDetail(productId);
    }
  };

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

  const loadProductDetail = async (productId) => {
    try {
      // First, try to find in the already loaded list
      let product = products.find(p => p.id === productId);
      
      // If not found or products array is empty (e.g., direct URL access), you might want to handle this case
      // For now, we just log an error if the product is not in the loaded list.
      if (!product) {
        // setIsLoading(true); // Set loading state while fetching specific product
        // const results = await Product.filter({ id: productId }, '', 1);
        // if (results && results.length > 0) {
        //   product = results[0];
        // }
        // setIsLoading(false); // Reset loading state after fetch attempt
      }
      
      if (product) {
        setSelectedProduct(product);
        setShowDetail(true);
      } else {
        console.error(`Produto com ID ${productId} não encontrado.`);
        // Optionally redirect or show a "not found" message.
        // For now, it will remain on the products list page without showing a detail.
      }
    } catch (error) {
      console.error('Erro ao carregar detalhe do produto:', error);
      setIsLoading(false); // Ensure loading is false even on error
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success toast
    showToast('Produto adicionado ao carrinho com sucesso!');
  };

  if (isLoading && !selectedProduct) { // Show loading skeleton/spinner when the main product list is loading, or a specific product from URL is being fetched
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (showDetail && selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => {
          setShowDetail(false);
          setSelectedProduct(null); // Clear selected product when going back
          // Optionally, remove product ID from URL if it was there
          const url = new URL(window.location);
          url.searchParams.delete('product');
          window.history.pushState({}, '', url);
        }}
        onAddToCart={addToCart}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nossos Produtos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore nossa deliciosa seleção de bolos, tortas e doces artesanais
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-button border-pink-200"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-48 glass-button border-pink-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="bolo">Bolos</SelectItem>
                <SelectItem value="torta">Tortas</SelectItem>
                <SelectItem value="doce">Doces</SelectItem>
                <SelectItem value="salgado">Salgados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading && !selectedProduct ? ( // Show skeleton only when products list is loading and no detail view
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={addToCart}
                onViewDetail={(product) => {
                  setSelectedProduct(product);
                  setShowDetail(true);
                  // Update URL to reflect selected product for sharing/refreshing
                  const url = new URL(window.location);
                  url.searchParams.set('product', product.id);
                  window.history.pushState({}, '', url);
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 text-sm">
                Tente ajustar seus filtros ou termos de busca
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
