import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, TrendingUp, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProfilePageProps {
  user: any;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
  const [currentUser, setCurrentUser] = useState(user);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
      const updatedUser = storedUsers.find((u: any) => u.id === user.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }

      const storedHistory = JSON.parse(localStorage.getItem('orakle_points_history') || '[]');
      setPointsHistory(storedHistory);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user.id]);

  const handleProfilePictureChange = () => {
    const updatedUser = { ...currentUser, profilePicture: newImageUrl };
    
    const allUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === currentUser.id ? updatedUser : u
    );
    
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    localStorage.setItem('orakle_current_user', JSON.stringify(updatedUser));
    
    setCurrentUser(updatedUser);
    setIsModalOpen(false);
    setNewImageUrl('');
    toast({
      title: "Sucesso!",
      description: "Sua foto de perfil foi atualizada.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const totalGained = pointsHistory
    .filter(h => h.type === 'gain')
    .reduce((sum, h) => sum + h.amount, 0);
  
  const totalSpent = pointsHistory
    .filter(h => h.type === 'loss')
    .reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="relative w-16 h-16">
              {currentUser.profilePicture ? (
                <img src={currentUser.profilePicture} alt="Foto de Perfil" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Foto de Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input 
                      placeholder="URL da imagem"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <div>
                      <label htmlFor="file-upload" className="text-sm font-medium">Ou envie um arquivo</label>
                      <Input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <Button onClick={handleProfilePictureChange}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{currentUser.name}</h2>
              <p className="text-slate-600">{currentUser.role}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Equipe</p>
              <p className="font-semibold text-slate-800">{currentUser.team}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Pontos Atuais</p>
              <p className="font-semibold text-slate-800">{currentUser.points}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-slate-600">Nível</p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                {currentUser.userType.charAt(0).toUpperCase() + currentUser.userType.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Estatísticas de Pontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <span className="text-slate-700">Total Ganho</span>
              <span className="font-bold text-green-600">+{totalGained}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
              <span className="text-slate-700">Total Gasto</span>
              <span className="font-bold text-red-600">-{totalSpent}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <span className="text-slate-700">Saldo Atual</span>
              <span className="font-bold text-blue-600">{currentUser.points}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-1">Nome Fictício</p>
              <p className="font-semibold text-slate-800">Usuário{currentUser.name.split(' ')[0]}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-1">Data de Entrada</p>
              <p className="font-semibold text-slate-800">Janeiro 2024</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-1">Departamento</p>
              <p className="font-semibold text-slate-800">{currentUser.team}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points History */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Histórico de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pointsHistory.length > 0 ? (
              pointsHistory
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`font-bold text-lg ${
                      transaction.type === 'gain' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'gain' ? '+' : '-'}{transaction.amount}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;