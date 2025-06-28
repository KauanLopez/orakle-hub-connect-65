
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface TeamCreatorProps {
  onCreateTeam: (teamName: string) => void;
}

const TeamCreator = ({ onCreateTeam }: TeamCreatorProps) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    
    onCreateTeam(newTeamName);
    setNewTeamName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button onClick={handleCreateTeam} className="w-full rounded-2xl">
            Criar Equipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamCreator;
