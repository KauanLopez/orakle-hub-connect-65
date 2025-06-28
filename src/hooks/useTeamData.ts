import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useTeamData = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersWithoutTeam, setUsersWithoutTeam] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedTeams = JSON.parse(localStorage.getItem('orakle_teams') || '[]');
    let storedUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');

    if (storedUsers && typeof storedUsers === 'object' && !Array.isArray(storedUsers)) {
      storedUsers = Object.values(storedUsers);
    } else if (!Array.isArray(storedUsers)) {
      storedUsers = [];
    }
    
    setTeams(storedTeams);
    setUsers(storedUsers);
    setUsersWithoutTeam(storedUsers.filter((u: any) => !u.teamId));
  };

  const createTeam = (teamName: string) => {
    if (!teamName.trim()) return;
    
    const newTeam = {
      id: Date.now().toString(),
      name: teamName,
      supervisorId: null,
      createdAt: new Date().toISOString()
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('orakle_teams', JSON.stringify(updatedTeams));
    
    toast({
      title: "Equipe criada",
      description: `Equipe "${teamName}" criada com sucesso!`
    });
  };

  const updateUser = (updatedUser: any) => {
    const updatedUsers = users.map((u: any) => 
      u.id === updatedUser.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    loadData();
    
    toast({
      title: "Usuário atualizado",
      description: "Dados do usuário atualizados com sucesso!"
    });
  };

  const addPointsToUser = (userId: string, pointsAmount: number, pointsType: 'add' | 'remove') => {
    const updatedUsers = users.map((u: any) => {
      if (u.id === userId) {
        const currentPoints = u.points || 0;
        const newPoints = pointsType === 'add' 
          ? currentPoints + pointsAmount
          : Math.max(0, currentPoints - pointsAmount);
        
        return { ...u, points: newPoints };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Pontos atualizados",
      description: `Pontos ${pointsType === 'add' ? 'adicionados' : 'removidos'} com sucesso!`
    });
  };

  const removeUserFromTeam = (userId: string) => {
    const updatedUsers = users.map((u: any) => 
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
    const updatedUsers = users.map((u: any) => 
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

  return {
    teams,
    users,
    usersWithoutTeam,
    createTeam,
    updateUser,
    addPointsToUser,
    removeUserFromTeam,
    moveUserToTeam,
    loadData
  };
};