import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HomePageProps {
  user: any;
}

const HomePage = ({ user }: HomePageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<string[]>([]);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newCarouselItem, setNewCarouselItem] = useState({ title: '', content: '', image: '' });
  const [newAlignment, setNewAlignment] = useState('');
  const { toast } = useToast();

  const canManage = ['supervisor', 'admin'].includes(user.userType);

  useEffect(() => {
    // Load carousel items and alignments from localStorage
    const storedCarousel = JSON.parse(localStorage.getItem('orakle_carousel') || '[]');
    const storedAlignments = JSON.parse(localStorage.getItem('orakle_alignments') || '[]');
    
    if (storedCarousel.length === 0) {
      const defaultCarousel = [
        {
          id: 1,
          title: 'Bem-vindos ao Orakle!',
          content: 'Sua nova plataforma de gestão de colaboradores está aqui. Explore todas as funcionalidades disponíveis.',
          image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop'
        },
        {
          id: 2,
          title: 'Novos Recursos Disponíveis',
          content: 'Confira os jogos interativos e o sistema de premiações para engajar sua equipe.',
          image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop'
        }
      ];
      localStorage.setItem('orakle_carousel', JSON.stringify(defaultCarousel));
      setCarouselItems(defaultCarousel);
    } else {
      setCarouselItems(storedCarousel);
    }

    if (storedAlignments.length === 0) {
      const defaultAlignments = [
        'Lembrete: Reunião geral na sexta-feira às 14h',
        'Meta do mês: Aumentar satisfação do cliente em 15%',
        'Parabéns ao time de vendas pelos excelentes resultados!'
      ];
      localStorage.setItem('orakle_alignments', JSON.stringify(defaultAlignments));
      setAlignments(defaultAlignments);
    } else {
      setAlignments(storedAlignments);
    }
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (carouselItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carouselItems.length]);

  const handleSaveCarouselItem = () => {
    if (!newCarouselItem.title || !newCarouselItem.content) {
      toast({
        title: "Erro",
        description: "Preencha título e conteúdo",
        variant: "destructive"
      });
      return;
    }

    let updatedItems;
    if (editingItem) {
      updatedItems = carouselItems.map(item => 
        item.id === editingItem.id ? { ...editingItem, ...newCarouselItem } : item
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...newCarouselItem
      };
      updatedItems = [...carouselItems, newItem];
    }

    setCarouselItems(updatedItems);
    localStorage.setItem('orakle_carousel', JSON.stringify(updatedItems));
    setNewCarouselItem({ title: '', content: '', image: '' });
    setEditingItem(null);
    setIsCarouselModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: editingItem ? "Item atualizado!" : "Item adicionado!"
    });
  };

  const handleDeleteCarouselItem = (id: number) => {
    const updatedItems = carouselItems.filter(item => item.id !== id);
    setCarouselItems(updatedItems);
    localStorage.setItem('orakle_carousel', JSON.stringify(updatedItems));
    
    toast({
      title: "Sucesso",
      description: "Item removido!"
    });
  };

  const handleSaveAlignment = () => {
    if (!newAlignment.trim()) {
      toast({
        title: "Erro",
        description: "Digite um alinhamento",
        variant: "destructive"
      });
      return;
    }

    const updatedAlignments = [...alignments, newAlignment];
    setAlignments(updatedAlignments);
    localStorage.setItem('orakle_alignments', JSON.stringify(updatedAlignments));
    setNewAlignment('');
    setIsAlignmentModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Alinhamento adicionado!"
    });
  };

  const handleDeleteAlignment = (index: number) => {
    const updatedAlignments = alignments.filter((_, i) => i !== index);
    setAlignments(updatedAlignments);
    localStorage.setItem('orakle_alignments', JSON.stringify(updatedAlignments));
    
    toast({
      title: "Sucesso",
      description: "Alinhamento removido!"
    });
  };

  return (
    <div className="space-y-6">
      {/* Carousel Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-800">Avisos Importantes</CardTitle>
          {canManage && (
            <Dialog open={isCarouselModalOpen} onOpenChange={setIsCarouselModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                  onClick={() => {
                    setEditingItem(null);
                    setNewCarouselItem({ title: '', content: '', image: '' });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Título"
                    value={newCarouselItem.title}
                    onChange={(e) => setNewCarouselItem({ ...newCarouselItem, title: e.target.value })}
                    className="rounded-xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                  <Textarea
                    placeholder="Conteúdo"
                    value={newCarouselItem.content}
                    onChange={(e) => setNewCarouselItem({ ...newCarouselItem, content: e.target.value })}
                    className="rounded-xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                  <Input
                    placeholder="URL da Imagem (opcional)"
                    value={newCarouselItem.image}
                    onChange={(e) => setNewCarouselItem({ ...newCarouselItem, image: e.target.value })}
                    className="rounded-xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                  <Button
                    onClick={handleSaveCarouselItem}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {editingItem ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {carouselItems.length > 0 ? (
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl min-h-[300px]">
                {carouselItems[currentSlide]?.image && (
                  <img
                    src={carouselItems[currentSlide].image}
                    alt={carouselItems[currentSlide].title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="relative p-8 flex flex-col justify-center min-h-[300px]">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    {carouselItems[currentSlide]?.title}
                  </h3>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {carouselItems[currentSlide]?.content}
                  </p>
                  
                  {canManage && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl bg-white/80 backdrop-blur-sm"
                        onClick={() => {
                          setEditingItem(carouselItems[currentSlide]);
                          setNewCarouselItem(carouselItems[currentSlide]);
                          setIsCarouselModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl bg-white/80 backdrop-blur-sm hover:bg-red-50"
                        onClick={() => handleDeleteCarouselItem(carouselItems[currentSlide].id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {carouselItems.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex justify-center space-x-2 mt-4">
                    {carouselItems.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-blue-500' : 'bg-slate-300'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>Nenhum aviso cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alignments Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-800">Alinhamentos Importantes</CardTitle>
          {canManage && (
            <Dialog open={isAlignmentModalOpen} onOpenChange={setIsAlignmentModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <DialogHeader>
                  <DialogTitle>Novo Alinhamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Digite o alinhamento..."
                    value={newAlignment}
                    onChange={(e) => setNewAlignment(e.target.value)}
                    className="rounded-xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                  <Button
                    onClick={handleSaveAlignment}
                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alignments.length > 0 ? (
              alignments.map((alignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <p className="text-slate-700 flex-1">{alignment}</p>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl hover:bg-red-100"
                      onClick={() => handleDeleteAlignment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhum alinhamento cadastrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
