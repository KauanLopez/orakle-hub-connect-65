
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PerformanceFiltersProps {
  user: any;
  viewMode: string;
  setViewMode: (mode: string) => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
}

const PerformanceFilters = ({
  user,
  viewMode,
  setViewMode,
  selectedTeam,
  setSelectedTeam,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: PerformanceFiltersProps) => {
  return (
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
  );
};

export default PerformanceFilters;
