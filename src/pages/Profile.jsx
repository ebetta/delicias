
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import localApiClient from '@/api/localApiClient';
import CheckoutForm from '@/components/cart/CheckoutForm';
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton";

const initialFormData = {
  name: "",
  phone: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zip_code: ""
  },
  paymentMethod: "pix",
};

export default function Profile() {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await localApiClient.get(`/profile/${currentUser.uid}`);
        if (profile) {
          setFormData({
            name: profile.name || currentUser.displayName || "",
            phone: profile.phone || "",
            address: {
              street: profile.street || "",
              number: profile.number || "",
              complement: profile.complement || "",
              neighborhood: profile.neighborhood || "",
              city: profile.city || "",
              zip_code: profile.zip_code || ""
            },
            paymentMethod: profile.payment_method || "pix",
          });
        } else {
          setFormData(prev => ({ ...prev, name: currentUser.displayName || "" }));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ title: "Erro", description: "Não foi possível carregar seus dados.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate, toast]);

  const handleSave = async (data) => {
    setIsSubmitting(true);
    try {
      await localApiClient.post('/profile', { 
        userId: currentUser.uid,
        name: data.name,
        phone: data.phone,
        address: data.address,
        paymentMethod: data.paymentMethod
      });
      toast({
        title: "Sucesso!",
        description: "Seus dados foram salvos.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({ title: "Erro", description: "Não foi possível salvar seus dados.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-3/4 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <CheckoutForm
        formData={formData}
        setFormData={setFormData}
        onBack={() => navigate('/home')}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
        title="Meus Dados"
        description="Atualize seu endereço e informações de pagamento."
        submitButtonText="Salvar Alterações"
      />
    </div>
  );
}
