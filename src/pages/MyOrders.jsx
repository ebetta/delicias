
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MyOrders = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Meus Pedidos</h1>
      <p>Aqui você poderá ver o histórico de seus pedidos.</p>
      <p>Logado como: {currentUser.email}</p>
    </div>
  );
};

export default MyOrders;
