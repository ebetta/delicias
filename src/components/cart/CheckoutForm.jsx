import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, CreditCard, Pizza, Landmark, User, MapPin, Wallet } from "lucide-react";
import { motion } from 'framer-motion';
import IdentificationStep from './IdentificationStep';

export default function CheckoutForm({
  formData,
  setFormData,
  onBack,
  onSubmit,
  isSubmitting,
  title = "Finalizar Pedido",
  description = "Complete as etapas para finalizar seu pedido",
  submitButtonText = "Confirmar Pedido"
}) {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState("identification");

  useEffect(() => {
    if (currentUser) {
      setCurrentStep("address");
    }
  }, [currentUser]);

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isStepDisabled = (step) => {
    if (step === 'address') return !currentUser;
    if (step === 'payment') return !currentUser;
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} variant="outline" size="icon" className="glass-button border-pink-200">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion type="single" collapsible value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <AccordionItem value="identification">
            <AccordionTrigger className="text-lg font-semibold">
              <span className='flex items-center'><User className="mr-2"/>Identifique-se</span>
            </AccordionTrigger>
            <AccordionContent>
              <IdentificationStep onIdentificationComplete={() => setCurrentStep('address')} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="address" disabled={isStepDisabled('address')}>
            <AccordionTrigger className="text-lg font-semibold">
              <span className='flex items-center'><MapPin className="mr-2"/>Endereço de Entrega</span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
              <Label htmlFor="street">Rua / Avenida</Label>
              <Input id="street" value={formData.address.street} onChange={(e) => handleAddressChange("street", e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" value={formData.address.number} onChange={(e) => handleAddressChange("number", e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={formData.address.complement} onChange={(e) => handleAddressChange("complement", e.target.value)} className="glass-button border-pink-200" />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" value={formData.address.neighborhood} onChange={(e) => handleAddressChange("neighborhood", e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={formData.address.city} onChange={(e) => handleAddressChange("city", e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" value={formData.address.zip_code} onChange={(e) => handleAddressChange("zip_code", e.target.value)} required className="glass-button border-pink-200" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="phone">Telefone para Contato</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required className="glass-button border-pink-200" />
            </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Switch id="save-address" checked={formData.saveAddress} onCheckedChange={(checked) => handleInputChange("saveAddress", checked)} />
                <Label htmlFor="save-address">Salvar endereço para compras futuras</Label>
              </div>
              <Button type="button" onClick={() => setCurrentStep('payment')} className="mt-4 w-full glass-button text-pink-700 hover:text-pink-800">Continuar para Pagamento</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment" disabled={isStepDisabled('payment')}>
            <AccordionTrigger className="text-lg font-semibold">
              <span className='flex items-center'><Wallet className="mr-2"/>Forma de Pagamento</span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[{ value: 'pix', label: 'PIX', icon: Landmark }, { value: 'cartao', label: 'Cartão de Crédito', icon: CreditCard }, { value: 'dinheiro', label: 'Dinheiro', icon: Pizza }].map(opt => (
                  <Label key={opt.value} className="glass-button border-pink-200 p-4 rounded-lg flex items-center gap-3 cursor-pointer has-[:checked]:bg-pink-100 has-[:checked]:border-pink-300">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <opt.icon className="w-5 h-5" />
                    <span>{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
              <div className="mt-4">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Alguma instrução especial para o seu pedido?" className="glass-button border-pink-200" />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4 flex gap-4">
          <Button type="submit" disabled={isSubmitting || !currentUser} className="w-full glass-button text-pink-700 hover:text-pink-800">
            {isSubmitting ? 'Salvando...' : submitButtonText}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
