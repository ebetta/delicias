import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import localApiClient from '@/api/localApiClient';
import { useToast } from '@/components/ui/use-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroImageUrl: '',
    floatingText1: '',
    floatingText2: '',
    'categoryIcon-bolos': 'Cake',
    'categoryDescription-bolos': '',
    'categoryIcon-tortas': 'CakeSlice',
    'categoryDescription-tortas': '',
    'categoryIcon-doces': 'Cookie',
    'categoryDescription-doces': '',
    'categoryIcon-salgados': 'Croissant',
    'categoryDescription-salgados': '',
    whatsappNumber: '',
    whatsappMessage: '',
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await localApiClient.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
        toast({
          title: 'Erro ao carregar configurações',
          description: 'Não foi possível carregar as configurações atuais.',
          variant: 'destructive',
        });
      }
    };
    fetchSettings();
  }, [toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    try {
      let newSettings = { ...settings };
      if (heroImageFile) {
        const formData = new FormData();
        formData.append('image', heroImageFile);
        const uploadResponse = await localApiClient.post('/upload/hero', formData);
        newSettings.heroImageUrl = uploadResponse.url;
        setSettings(newSettings);
      }

      await localApiClient.post('/settings', newSettings);
      toast({
        title: 'Configurações salvas',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Failed to save settings', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imagem da Página Inicial</CardTitle>
          <CardDescription>Faça o upload da imagem principal que será exibida na sua página inicial.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="w-48 h-32 rounded-md overflow-hidden bg-gray-100">
            {(heroImagePreview || settings.heroImageUrl) && <img src={heroImagePreview || settings.heroImageUrl} alt="Imagem Atual" className="w-full h-full object-cover" />}
          </div>
          <div>
            <Label htmlFor="hero-image-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Fazer Upload
            </Label>
            <input id="hero-image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <p className="text-sm text-muted-foreground mt-2">Recomendado: Imagem horizontal, 1200x800 pixels.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos Flutuantes da Página Inicial</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="floatingText1">Texto 1 (superior direito)</Label>
            <Input id="floatingText1" value={settings.floatingText1} onChange={handleInputChange} placeholder="Destaque" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floatingText2">Texto 2 (inferior esquerdo)</Label>
            <Input id="floatingText2" value={settings.floatingText2} onChange={handleInputChange} placeholder="Alguns produtos são sob encomenda" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ícones e Descrições das Categorias</CardTitle>
          <CardDescription>
            Digite o nome de um ícone da biblioteca Lucide e a descrição para cada categoria.
            <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> Ver ícones disponíveis</a>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {['bolos', 'tortas', 'doces', 'salgados'].map((category) => (
            <div key={category} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`categoryIcon-${category}`}>{category.charAt(0).toUpperCase() + category.slice(1)} - Ícone</Label>
                <Input
                  id={`categoryIcon-${category}`}
                  value={settings[`categoryIcon-${category}`]}
                  onChange={handleInputChange}
                  placeholder="Ex: Cake"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`categoryDescription-${category}`}>{category.charAt(0).toUpperCase() + category.slice(1)} - Descrição</Label>
                <Input
                  id={`categoryDescription-${category}`}
                  value={settings[`categoryDescription-${category}`]}
                  onChange={handleInputChange}
                  placeholder="Ex: Bolos artesanais para todas as ocasiões"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato (WhatsApp)</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
            <Input id="whatsappNumber" value={settings.whatsappNumber} onChange={handleInputChange} placeholder="5511976838931" />
            <p className="text-sm text-muted-foreground">Inclua o código do país (55 para Brasil).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappMessage">Mensagem inicial</Label>
            <Input id="whatsappMessage" value={settings.whatsappMessage} onChange={handleInputChange} placeholder="Olá, gostaria de mais informações" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
      </div>
    </div>
  );
}