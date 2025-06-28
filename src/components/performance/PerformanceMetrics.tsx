
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, BarChart3, TrendingUp, Users } from 'lucide-react';

interface PerformanceMetricsProps {
  currentData: {
    avgRating: number;
    totalAttendances: number;
    evaluationRate: number;
    completionRate: number;
  };
}

const PerformanceMetrics = ({ currentData }: PerformanceMetricsProps) => {
  return (
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
  );
};

export default PerformanceMetrics;
