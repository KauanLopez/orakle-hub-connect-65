
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Edit, Trash2, Plus, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamPageProps {
  user: any;
}

const TeamPage = ({ user }: TeamPageProps) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersWithoutTeam, setUsersWithoutTeam] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [pointsType, setPointsType] = useState('add');
  const [pointsAmount, setPointsAmount] = useState([5]);
  const [pointsReason, setPointsReason] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedTeams = JSON.parse(localStorage.getItem('orakle_teams') || '[]');
    const storedUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
    
    setTeams(storedTeams);
    setUsers(storedUsers);
    setUsersWithoutTeam(storedUsers.filter(u => !u.teamId));
  };

  const getCurrentTeamMembers = () => {
    if (user.userType === 'admin') {
      return selectedTeam ? users.filter(u => u.teamId === selectedTeam) : users;
    }
    return users.filter(u => u.teamId === user.teamId);
  };

  const createTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeam = {
      id: Date.now().toString(),
      name: newTeamName,
      supervisorId: null,
      createdAt: new Date().toISOString()
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('orakle_teams', JSON.stringify(updatedTeams));
    setNewTeamName('');
    
    toast({
      title: "Equipe criada",
      description: `Equipe "${newTeamName}" criada com sucesso!`
    });
  };

  const addPointsToUser = () => {
    if (!selectedUser || !pointsReason.trim()) return;
    
    const updatedUsers = users.map(u => {
      if (u.id === selectedUser) {
        const currentPoints = u.points || 0;
        const newPoints = pointsType === 'add' 
          ? currentPoints + pointsAmount[0]
          : Math.max(0, currentPoints - pointsAmount[0]);
        
        return { ...u, points: newPoints };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    
    // Reset form
    setSelectedUser('');
    setPointsReason('');
    setPointsAmount([5]);
    
    toast({
      title: "Pontos atualizados",
      description: `Pontos ${pointsType === 'add' ? 'adicionados' : 'removidos'} com sucesso!`
    });
  };

  const updateUser = () => {
    if (!editingUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === editingUser.id ? editingUser : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    setEditingUser(null);
    
    toast({
      title: "Usuário atualizado",
      description: "Dados do usuário atualizados com sucesso!"
    });
  };

  const removeUserFromTeam = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, teamId: null } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    loadData();
    
    toast({
      title: "Usuário removido",
      description: "Usuário removido da equipe com sucesso!"
    });
  };

  const moveUserToTeam = (userId: string, teamId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, teamId } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    loadData();
    
    toast({
      title: "Usuário movido",
      description: "Usuário movido para a equipe com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Equipe</h1>
        
        {user.userType === 'admin' && (
          <div className="flex gap-3">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48 rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                <SelectValue placeholder="Selecionar equipe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <SelectItem value="">Todas as equipes</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Equipe
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Criar Nova Equipe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da equipe"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                  <Button onClick={createTeam} className="w-full rounded-2xl">
                    Criar Equipe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Pontuação Manual */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Pontuação Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                <SelectValue placeholder="Selecionar colaborador" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                {getCurrentTeamMembers().map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.points || 0} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pointsType} onValueChange={setPointsType}>
              <SelectTrigger className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <SelectItem value="add">Adicionar</SelectItem>
                <SelectItem value="remove">Remover</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">
                Pontos: {pointsAmount[0]}
              </div>
              <Slider
                value={pointsAmount}
                onValueChange={setPointsAmount}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Motivo da pontuação..."
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[40px]"
              />
              <Button
                onClick={addPointsToUser}
                disabled={!selectedUser || !pointsReason.trim()}
                className="w-full rounded-2xl"
              >
                Aplicar Pontos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Membros */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {user.userType === 'admin' && selectedTeam ? 
              `Membros - ${teams.find(t => t.id === selectedTeam)?.name}` : 
              'Membros da Equipe'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCurrentTeamMembers().map(member => (
              <Card key={member.id} className="bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-slate-600">{member.role}</p>
                    <p className="text-sm text-slate-500">Fictício: {member.ficticiousName}</p>
                    <p className="text-sm font-medium text-blue-600">
                      Pontos: {member.points || 0}
                    </p>
                    
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(member)}
                            className="rounded-xl"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
                          <DialogHeader>
                            <DialogTitle>Editar Colaborador</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              <Input
                                placeholder="Cargo"
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                              />
                              <Input
                                placeholder="Nome fictício"
                                value={editingUser.ficticiousName}
                                onChange={(e) => setEditingUser({...editingUser, ficticiousName: e.target.value})}
                                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                              />
                              <Button onClick={updateUser} className="w-full rounded-2xl">
                                Salvar Alterações
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUserFromTeam(member.id)}
                        className="rounded-xl text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usuários sem Equipe - Apenas Admin */}
      {user.userType === 'admin' && usersWithoutTeam.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Usuários Sem Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersWithoutTeam.map(user => (
                <Card key={user.id} className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800">{user.name}</h3>
                      <p className="text-sm text-slate-600">{user.role}</p>
                      
                      <Select onValueChange={(teamId) => moveUserToTeam(user.id, teamId)}>
                        <SelectTrigger className="rounded-xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                          <SelectValue placeholder="Mover para equipe" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                          {teams.map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamPage;
