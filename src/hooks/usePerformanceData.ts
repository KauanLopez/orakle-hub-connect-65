
import { useState, useEffect } from 'react';

interface PerformanceData {
  avgRating: number;
  totalAttendances: number;
  evaluationRate: number;
  completionRate: number;
}

interface UsePerformanceDataReturn {
  performanceData: {
    individual: PerformanceData;
    team: PerformanceData;
    general: PerformanceData;
  };
  getCurrentData: (userType: string, viewMode: string) => PerformanceData;
}

export const usePerformanceData = (user: any, viewMode: string): UsePerformanceDataReturn => {
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

  const getCurrentData = (userType: string, currentViewMode: string) => {
    if (userType === 'colaborador') return performanceData.individual;
    if (currentViewMode === 'individual') return performanceData.individual;
    if (currentViewMode === 'team') return performanceData.team;
    return performanceData.general;
  };

  return { performanceData, getCurrentData };
};
