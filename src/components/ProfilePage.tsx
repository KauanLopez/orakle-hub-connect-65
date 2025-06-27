
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, TrendingUp } from 'lucide-react';

interface ProfilePageProps {
  user: any;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load points history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('orakle_points_history') || '[]');
    
    if (storedHistory.length === 0) {
      // Create mock points history
      const mockHistory = [
        {
          id: 1,
          type: 'gain',
          amount: 100,
          description: 'Completou perfil',
          date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'gain',
          amount: 50,
          description: 'Participação no Quiz de Segurança',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          type: 'loss',
          amount: 200,
          description: 'Resgate: Mousepad Personalizado',
          date: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          type: 'gain',
          amount: 75,
          description: 'Meta mensal atingida',
          date: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      localStorage.setItem('orakle_points_history', JSON.stringify(mockHistory));
      setPointsHistory(mockHistory);
    } else {
      setPointsHistory(storedHistory);
    }
  }, []);

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
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-600">{user.role}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Equipe</p>
              <p className="font-semibold text-slate-800">{user.team}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Pontos Atuais</p>
              <p className="font-semibold text-slate-800">{user.points}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-slate-600">Nível</p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
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
              <span className="font-bold text-blue-600">{user.points}</span>
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
              <p className="font-semibold text-slate-800">Usuário{user.name.split(' ')[0]}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-1">Data de Entrada</p>
              <p className="font-semibold text-slate-800">Janeiro 2024</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl">
              <p className="text-sm text-slate-600 mb-1">Departamento</p>
              <p className="font-semibold text-slate-800">{user.team}</p>
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
