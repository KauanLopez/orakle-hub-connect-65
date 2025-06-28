
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceChartProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const PerformanceChart = ({ startDate, endDate }: PerformanceChartProps) => {
  return (
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
  );
};

export default PerformanceChart;
