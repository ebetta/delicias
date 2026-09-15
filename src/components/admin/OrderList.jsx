import React, { useState, useEffect } from 'react';
import localApiClient from '@/api/localApiClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from '@/components/utils/formatters';
import { Frown, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const orderStatusOptions = [
  "Pedido aceito",
  "Em preparação",
  "Em Trânsito",
  "Entregue",
  "Entrega falhou",
  "Aguardando retirada",
  "Cancelado",
  "Devolvido",
];

const financialStatusOptions = [
  "Aguardando pagamento",
  "Pago",
  "Pagamento parcial",
  "Estornado",
  "Reembolso parcial",
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const fetchOrders = async (start, end) => {
    try {
      setLoading(true);
      const formattedStart = format(start, "yyyy-MM-dd");
      const formattedEnd = format(end, "yyyy-MM-dd");
      const allOrders = await localApiClient.get(`/orders?startDate=${formattedStart}&endDate=${formattedEnd}`);
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(startDate, endDate);
  }, [startDate, endDate]);

  const handleStatusChange = async (orderId, newStatus, statusType) => {
    try {
      await localApiClient.put(`/orders/${orderId}`, { [statusType]: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, [statusType]: newStatus } : order
        )
      );
    } catch (error) {
      console.error(`Failed to update ${statusType}:`, error);
    }
  };

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
      {[...Array(5)].map((_, i) => (
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
    return <OrderSkeleton />;
  }

  return (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-[280px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Selecione a data inicial</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-[280px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Selecione a data final</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
            <Frown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 text-sm mb-6">Ainda não há pedidos para exibir.</p>
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
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(order.id, newStatus, "status")
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status do Pedido" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={order.financial_status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(order.id, newStatus, "financial_status")
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status Financeiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {order.notes && (
                  <div className="border-t mt-4 pt-4">
                    <h4 className="font-semibold mb-2">Observações</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default OrderList;
