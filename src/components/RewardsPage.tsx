import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Plus, Edit, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardsPageProps {
  user: any;
}

const RewardsPage = ({ user: initialUser }: RewardsPageProps) => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [newReward, setNewReward] = useState({
    name: '',
    points: 0,
    image: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [initialUser.id]);

  const loadData = () => {
    const storedRewards = JSON.parse(localStorage.getItem('orakle_rewards') || '[]');
    setRewards(storedRewards);

    const storedUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
    const updatedUser = storedUsers.find((u: any) => u.id === initialUser.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const canManageRewards = currentUser.userType === 'supervisor' || currentUser.userType === 'admin';

  const addReward = () => {
    if (!newReward.name.trim() || newReward.points <= 0) return;

    const reward = {
      id: Date.now().toString(),
      ...newReward,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    const updatedRewards = [...rewards, reward];
    setRewards(updatedRewards);
    localStorage.setItem('orakle_rewards', JSON.stringify(updatedRewards));
    
    setNewReward({ name: '', points: 0, image: '', description: '' });
    setIsAddingReward(false);
    
    toast({
      title: "Prêmio adicionado",
      description: `Prêmio "${newReward.name}" adicionado com sucesso!`
    });
  };

  const updateReward = () => {
    if (!editingReward) return;

    const updatedRewards = rewards.map(r => 
      r.id === editingReward.id ? editingReward : r
    );
    
    setRewards(updatedRewards);
    localStorage.setItem('orakle_rewards', JSON.stringify(updatedRewards));
    setEditingReward(null);
    
    toast({
      title: "Prêmio atualizado",
      description: "Prêmio atualizado com sucesso!"
    });
  };

  const deleteReward = (rewardId: string) => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    setRewards(updatedRewards);
    localStorage.setItem('orakle_rewards', JSON.stringify(updatedRewards));
    
    toast({
      title: "Prêmio removido",
      description: "Prêmio removido com sucesso!"
    });
  };

  const redeemReward = (reward: any) => {
    if (currentUser.points >= reward.cost) {
      const newPoints = currentUser.points - reward.cost;
      
      const updatedUser = { ...currentUser, points: newPoints };
      setCurrentUser(updatedUser);

      const allUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => 
        u.id === currentUser.id ? updatedUser : u
      );
      
      localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
      localStorage.setItem('orakle_current_user', JSON.stringify(updatedUser));
      
      const redemptions = JSON.parse(localStorage.getItem('orakle_redemptions') || '[]');
      const redemption = {
        id: Date.now().toString(),
        userId: currentUser.id,
        rewardId: reward.id,
        rewardName: reward.name,
        pointsUsed: reward.points,
        redeemedAt: new Date().toISOString()
      };
      
      redemptions.push(redemption);
      localStorage.setItem('orakle_redemptions', JSON.stringify(redemptions));
      
      toast({
        title: "Prêmio resgatado!",
        description: `Você resgatou "${reward.name}" por ${reward.points} pontos!`
      });
    } else {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${reward.points} pontos para resgatar este prêmio. Você tem ${currentUser.points} pontos.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Premiações</h1>
          <p className="text-slate-600 mt-2">Seus pontos: {currentUser.points || 0}</p>
        </div>
        
        {canManageRewards && (
          <Dialog open={isAddingReward} onOpenChange={setIsAddingReward}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-[0_4px_12px_rgba(34,197,94,0.4)]">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Prêmio
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Prêmio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do prêmio"
                  value={newReward.name}
                  onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                  className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                />
                <Input
                  type="number"
                  placeholder="Pontos necessários"
                  value={newReward.points || ''}
                  onChange={(e) => setNewReward({...newReward, points: parseInt(e.target.value) || 0})}
                  className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                />
                <Input
                  placeholder="URL da imagem (opcional)"
                  value={newReward.image}
                  onChange={(e) => setNewReward({...newReward, image: e.target.value})}
                  className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={newReward.description}
                  onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                  className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                />
                <Button 
                  onClick={addReward} 
                  className="w-full rounded-2xl"
                  disabled={!newReward.name.trim() || newReward.points <= 0}
                >
                  Adicionar Prêmio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Galeria de Prêmios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map(reward => (
          <Card key={reward.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {reward.image ? (
                  <img 
                    src={reward.image} 
                    alt={reward.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Gift className="h-16 w-16 text-blue-400" />
                  </div>
                )}
                
                {canManageRewards && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingReward(reward)}
                          className="rounded-xl bg-white/80 hover:bg-white/90 p-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle>Editar Prêmio</DialogTitle>
                        </DialogHeader>
                        {editingReward && (
                          <div className="space-y-4">
                            <Input
                              placeholder="Nome do prêmio"
                              value={editingReward.name}
                              onChange={(e) => setEditingReward({...editingReward, name: e.target.value})}
                              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                            <Input
                              type="number"
                              placeholder="Pontos necessários"
                              value={editingReward.points}
                              onChange={(e) => setEditingReward({...editingReward, points: parseInt(e.target.value) || 0})}
                              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                            <Input
                              placeholder="URL da imagem"
                              value={editingReward.image}
                              onChange={(e) => setEditingReward({...editingReward, image: e.target.value})}
                              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                            <Button onClick={updateReward} className="w-full rounded-2xl">
                              Salvar Alterações
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteReward(reward.id)}
                      className="rounded-xl bg-red-100 hover:bg-red-200 text-red-600 p-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-slate-800 text-lg">{reward.name}</h3>
                {reward.description && (
                  <p className="text-sm text-slate-600">{reward.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{reward.points} pontos</span>
                  </div>
                  
                  {!canManageRewards && (
                    <Button
                      onClick={() => redeemReward(reward)}
                      disabled={currentUser.points < reward.points}
                      className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resgatar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rewards.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum prêmio disponível</h3>
            <p className="text-slate-500 text-center">
              {canManageRewards 
                ? "Adicione o primeiro prêmio para começar!" 
                : "Aguarde novos prêmios serem adicionados."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RewardsPage;