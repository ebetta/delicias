import React from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Star, Clock, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/components/utils/formatters";
import { BASE_URL } from "@/api/localApiClient";

export default function ProductList({ products, isLoading, onEdit, onDelete, onReorder }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleDragEnd = (result) => {
    console.log(result);
    if (!result.destination) return;
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="products">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {products.map((product, index) => (
              <Draggable key={product.id} draggableId={product.id} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                    style={{...provided.draggableProps.style}}
                  >
                    <div className="flex items-center gap-6">
                      <div className="cursor-move text-gray-400">
                        <GripVertical />
                      </div>
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {product.image_urls?.[0] ? (
                          <img src={`${BASE_URL}${product.image_urls[0]}`} alt={product.name} className="h-16 w-16 object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800 truncate">
                            {product.name}
                          </h3>
                          <div className="flex gap-1">
                            {product.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destaque
                              </Badge>
                            )}
                            {product.is_custom_order && (
                              <Badge variant="outline" className="border-orange-300 text-orange-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Encomenda
                              </Badge>
                            )}
                            <Badge className={`${product.is_available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_available ? 'Disponível' : 'Indisponível'}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="capitalize">{product.category}</span>
                          <span className="font-semibold text-pink-600">
                            {formatPrice(product.price)}
                          </span>
                          {product.production_time_days > 0 && (
                            <span>{product.production_time_days} dia{product.production_time_days > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => onEdit(product)}
                          variant="outline"
                          size="sm"
                          className="glass-button border-blue-200 text-blue-700 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => onDelete(product.id)}
                          variant="outline"
                          size="sm"  
                          className="glass-button border-red-200 text-red-700 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {products.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-500">
            Comece adicionando seu primeiro produto à loja
          </p>
        </div>
      )}
    </DragDropContext>
  );
}