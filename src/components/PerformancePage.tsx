
import React, { useState } from 'react';
import PerformanceFilters from './performance/PerformanceFilters';
import PerformanceMetrics from './performance/PerformanceMetrics';
import PerformanceChart from './performance/PerformanceChart';
import { usePerformanceData } from '@/hooks/usePerformanceData';

interface PerformancePageProps {
  user: any;
}

const PerformancePage = ({ user }: PerformancePageProps) => {
  const [viewMode, setViewMode] = useState('individual');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { getCurrentData } = usePerformanceData(user, viewMode);
  const currentData = getCurrentData(user.userType, viewMode);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Desempenho</h1>
        
        <PerformanceFilters
          user={user}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>

      <PerformanceMetrics currentData={currentData} />

      <PerformanceChart startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default PerformancePage;
