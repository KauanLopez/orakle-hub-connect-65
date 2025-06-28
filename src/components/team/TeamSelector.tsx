
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamSelectorProps {
  teams: any[];
  selectedTeam: string;
  onTeamChange: (teamId: string) => void;
}

const TeamSelector = ({ teams, selectedTeam, onTeamChange }: TeamSelectorProps) => {
  return (
    <Select value={selectedTeam} onValueChange={onTeamChange}>
      <SelectTrigger className="w-48 rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
        <SelectValue placeholder="Selecionar equipe" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
        <SelectItem value="">Todas as equipes</SelectItem>
        {teams.map((team: any) => (
          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TeamSelector;
