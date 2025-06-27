
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Medal, Crown, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RankingPageProps {
  user: any;
}

const RankingPage = ({ user }: RankingPageProps) => {
  const [rankingType, setRankingType] = useState<'points' | 'performance'>('points');
  const [showRealNames, setShowRealNames] = useState(true);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    // Initialize mock ranking data
    const mockRanking = [
      { id: 1, realName: 'Ana Silva', ficticiousName: 'Lightning Ana', points: 2500, avgRating: 4.8, attendances: 156, team: 'Vendas' },
      { id: 2, realName: 'Carlos Santos', ficticiousName: 'Thunder Carlos', points: 2300, avgRating: 4.6, attendances: 142, team: 'Vendas' },
      { id: 3, realName: user.name, ficticiousName: 'Storm ' + user.name.split(' ')[0], points: user.points || 1500, avgRating: 4.2, attendances: 128, team: user.team },
      { id: 4, realName: 'João Oliveira', ficticiousName: 'Eagle João', points: 1800, avgRating: 4.1, attendances: 134, team: 'Suporte' },
      { id: 5, realName: 'Maria Costa', ficticiousName: 'Phoenix Maria', points: 1600, avgRating: 4.0, attendances: 121, team: 'Suporte' }
    ];
    setRankingData(mockRanking);
  }, [user]);

  const getSortedRanking = () => {
    return [...rankingData].sort((a, b) => {
      if (rankingType === 'points') {
        return b.points - a.points;
      } else {
        return b.avgRating - a.avgRating;
      }
    });
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Trophy className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-slate-600">#{position}</span>;
    }
  };

  const handleSaveFicticiousName = (userId: number, newName: string) => {
    setRankingData(prev => prev.map(item => 
      item.id === userId ? { ...item, ficticiousName: newName } : item
    ));
    setEditingUser(null);
  };

  const sortedRanking = getSortedRanking();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Ranking</h1>
        
        <div className="flex flex-wrap gap-3">
          {/* Ranking Type Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setRankingType('points')}
              className={`rounded-2xl transition-all duration-300 ${
                rankingType === 'points'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
                  : 'bg-white/70 text-slate-700 hover:bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
              }`}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Pontuação
            </Button>
            <Button
              onClick={() => setRankingType('performance')}
              className={`rounded-2xl transition-all duration-300 ${
                rankingType === 'performance'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
                  : 'bg-white/70 text-slate-700 hover:bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
              }`}
            >
              <Target className="h-4 w-4 mr-2" />
              Desempenho
            </Button>
          </div>

          {/* Name Display Toggle - Only for Supervisor/Admin */}
          {(user.userType === 'supervisor' || user.userType === 'admin') && (
            <Button
              onClick={() => setShowRealNames(!showRealNames)}
              variant="outline"
              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:bg-slate-100/80"
            >
              {showRealNames ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />}
              {showRealNames ? 'Nome Real' : 'Nome Fictício'}
            </Button>
          )}
        </div>
      </div>

      {/* Current User's Position Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Sua Posição</h3>
              <p className="text-slate-600">
                {sortedRanking.findIndex(item => item.realName === user.name) + 1}º lugar
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {rankingType === 'points' 
                  ? `${user.points || 1500} pts` 
                  : `${sortedRanking.find(item => item.realName === user.name)?.avgRating || 4.2}`
                }
              </div>
              <p className="text-sm text-slate-500">
                {rankingType === 'points' ? 'pontos totais' : 'nota média'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <div className="space-y-4">
        {sortedRanking.map((item, index) => {
          const isCurrentUser = item.realName === user.name;
          const position = index + 1;
          
          return (
            <Card
              key={item.id}
              className={`transition-all duration-300 rounded-3xl ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 shadow-[0_4px_12px_rgba(59,130,246,0.2)]'
                  : 'bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)]'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                      {getRankIcon(position)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-slate-800">
                          {showRealNames || user.userType === 'colaborador' 
                            ? item.realName 
                            : item.ficticiousName
                          }
                        </p>
                        {isCurrentUser && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Você</Badge>
                        )}
                        {(user.userType === 'supervisor' || user.userType === 'admin') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/50"
                                onClick={() => setEditingUser(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
                              <DialogHeader>
                                <DialogTitle>Editar Nome Fictício</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div>
                                  <Label htmlFor="ficticiousName">Nome Fictício</Label>
                                  <Input
                                    id="ficticiousName"
                                    defaultValue={item.ficticiousName}
                                    className="rounded-2xl"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveFicticiousName(item.id, e.currentTarget.value);
                                      }
                                    }}
                                  />
                                </div>
                                <Button
                                  onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                                    if (input) {
                                      handleSaveFicticiousName(item.id, input.value);
                                    }
                                  }}
                                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                  Salvar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{item.team}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-800">
                      {rankingType === 'points' ? `${item.points} pts` : item.avgRating}
                    </div>
                    <p className="text-sm text-slate-500">
                      {rankingType === 'points' ? 'pontos' : `${item.attendances} atendimentos`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RankingPage;
