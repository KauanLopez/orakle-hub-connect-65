
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Edit, Trash2 } from 'lucide-react';

interface TeamMembersProps {
  teamMembers: any[];
  title: string;
  onUpdateUser: (user: any) => void;
  onRemoveUser: (userId: string) => void;
}

const TeamMembers = ({ teamMembers, title, onUpdateUser, onRemoveUser }: TeamMembersProps) => {
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleUpdateUser = () => {
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member: any) => (
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
                            <Button onClick={handleUpdateUser} className="w-full rounded-2xl">
                              Salvar Alterações
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveUser(member.id)}
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
  );
};

export default TeamMembers;
