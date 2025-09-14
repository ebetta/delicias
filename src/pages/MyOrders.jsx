import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import localApiClient from '@/api/localApiClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from '@/components/utils/formatters';
import { Package, ShoppingBag, Frown } from 'lucide-react';

const MyOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const userOrders = await localApiClient.get(`/orders/${currentUser.uid}`);
          setOrders(userOrders);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const OrderItem = ({ item }) => (
    <div className="flex items-center gap-4 py-2">
      <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 rounded-md object-cover"/>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
      </div>
      <p className="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
    </div>
  );

  const OrderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Meus Pedidos</h1>
        <OrderSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-[calc(100vh-14rem)]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
            <Frown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 text-sm mb-6">Você ainda não fez nenhum pedido. Que tal explorar nossos produtos?</p>
            <Link to="/products">
              <Button className="glass-button text-pink-700 hover:text-pink-800">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {orders.map((order) => (
            <AccordionItem key={order.id} value={order.id} className="glass-card rounded-2xl border-b-0 overflow-hidden">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left gap-2">
                  <div className="font-medium text-gray-800">
                    Pedido #{order.id.split('_')[1]}
                    <p className="text-sm text-gray-500 font-normal">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge className={`capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </Badge>
                    <span className="font-semibold text-lg text-pink-600">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  {order.items.map(item => <OrderItem key={item.id} item={item} />)}
                </div>
                <div className="border-t mt-4 pt-4">
                  <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                  <p className="text-sm text-gray-600">{order.street}, {order.number}</p>
                  <p className="text-sm text-gray-600">{order.neighborhood}, {order.city} - {order.zip_code}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default MyOrders;