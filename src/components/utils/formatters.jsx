export const formatPrice = (price) => {
  const numberPrice = Number(price);
  if (isNaN(numberPrice)) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return numberPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};