
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PerformancePageProps {
  user: any;
}

const PerformancePage = ({ user }: PerformancePageProps) => {
  const [viewMode, setViewMode] = useState('individual');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [performanceData, setPerformanceData] = useState<any>({});

  useEffect(() => {
    // Initialize mock performance data
    const mockData = {
      individual: {
        avgRating: 4.2,
        totalAttendances: 145,
        evaluationRate: 85,
        completionRate: 92
      },
      team: {
        avgRating: 4.0,
        totalAttendances: 890,
        evaluationRate: 78,
        completionRate: 88
      },
      general: {
        avgRating: 3.9,
        totalAttendances: 2450,
        evaluationRate: 82,
        completionRate: 90
      }
    };
    setPerformanceData(mockData);
  }, []);

  const getCurrentData = () => {
    if (user.userType === 'colaborador') return performanceData.individual;
    if (viewMode === 'individual') return performanceData.individual;
    if (viewMode === 'team') return performanceData.team;
    return performanceData.general;
  };

  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Desempenho</h1>
        
        <div className="flex flex-wrap gap-3">
          {/* View Mode Selector - Only for Supervisor/Admin */}
          {user.userType !== 'colaborador' && (
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-48 rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Equipe</SelectItem>
                {user.userType === 'admin' && (
                  <SelectItem value="general">Geral</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}

          {/* Team Filter - Only for Admin in general view */}
          {user.userType === 'admin' && viewMode === 'general' && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40 rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Date Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
                  !startDate && "text-slate-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
                  !endDate && "text-slate-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Nota Média</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{currentData?.avgRating || 0}</div>
            <p className="text-xs text-slate-500">de 5.0</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Atendimentos</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{currentData?.totalAttendances || 0}</div>
            <p className="text-xs text-slate-500">total no período</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">% Avaliações</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{currentData?.evaluationRate || 0}%</div>
            <p className="text-xs text-slate-500">dos atendimentos</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Conclusão</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{currentData?.completionRate || 0}%</div>
            <p className="text-xs text-slate-500">finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Evolução do Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-slate-500">Gráfico de desempenho será exibido aqui</p>
              <p className="text-sm text-slate-400 mt-2">
                Período: {startDate ? format(startDate, "dd/MM/yyyy") : "Início"} - {endDate ? format(endDate, "dd/MM/yyyy") : "Fim"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
