
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Award } from 'lucide-react';

interface ManualScoringProps {
  teamMembers: any[];
  onAddPoints: (userId: string, pointsAmount: number, pointsType: 'add' | 'remove') => void;
}

const ManualScoring = ({ teamMembers, onAddPoints }: ManualScoringProps) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [pointsType, setPointsType] = useState('add');
  const [pointsAmount, setPointsAmount] = useState([5]);
  const [pointsReason, setPointsReason] = useState('');

  const handleAddPoints = () => {
    if (!selectedUser || !pointsReason.trim()) return;
    
    onAddPoints(selectedUser, pointsAmount[0], pointsType as 'add' | 'remove');
    
    // Reset form
    setSelectedUser('');
    setPointsReason('');
    setPointsAmount([5]);
  };

  return (
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
              {teamMembers.map((member: any) => (
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
              onClick={handleAddPoints}
              disabled={!selectedUser || !pointsReason.trim()}
              className="w-full rounded-2xl"
            >
              Aplicar Pontos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualScoring;
