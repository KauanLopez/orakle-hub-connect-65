
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

interface UsersWithoutTeamProps {
  usersWithoutTeam: any[];
  teams: any[];
  onMoveUser: (userId: string, teamId: string) => void;
}

const UsersWithoutTeam = ({ usersWithoutTeam, teams, onMoveUser }: UsersWithoutTeamProps) => {
  if (usersWithoutTeam.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Usuários Sem Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersWithoutTeam.map((user: any) => (
            <Card key={user.id} className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-800">{user.name}</h3>
                  <p className="text-sm text-slate-600">{user.role}</p>
                  
                  <Select onValueChange={(teamId) => onMoveUser(user.id, teamId)}>
                    <SelectTrigger className="rounded-xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                      <SelectValue placeholder="Mover para equipe" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                      {teams.map((team: any) => (
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
  );
};

export default UsersWithoutTeam;
