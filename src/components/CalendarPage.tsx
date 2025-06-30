import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface CalendarPageProps {
  user: any;
}

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  description?: string;
}

const CalendarPage = ({ user }: CalendarPageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mock events
    const mockEvents: CalendarEvent[] = [
      {
        id: 1,
        date: new Date(2024, 11, 15), // December 15, 2024
        title: 'Reunião Geral',
        description: 'Reunião mensal de toda a equipe'
      },
      {
        id: 2,
        date: new Date(2024, 11, 22),
        title: 'Treinamento de Vendas',
        description: 'Capacitação em técnicas de vendas'
      },
      {
        id: 3,
        date: new Date(2024, 11, 25),
        title: 'Confraternização de Natal',
        description: 'Festa de confraternização da empresa'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventsForMonth = () => {
    return events.filter(event => isSameMonth(event.date, currentDate));
  };

  const handleSaveEvent = (formData: any) => {
    if (!selectedDate) return;

    const eventData = {
      id: editingEvent?.id || Date.now(),
      date: selectedDate,
      title: formData.title,
      description: formData.description
    };

    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? eventData : event
      ));
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso."
      });
    } else {
      setEvents(prev => [...prev, eventData]);
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso."
      });
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedDate(undefined);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Evento removido",
      description: "O evento foi removido com sucesso."
    });
  };

  const EventModal = () => (
    <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
      <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Editar Evento' : 'Novo Evento'} - {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleSaveEvent({
            title: formData.get('title'),
            description: formData.get('description')
          });
        }} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={editingEvent?.title}
              className="rounded-2xl"
              placeholder="Nome do evento"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={editingEvent?.description}
              className="rounded-2xl"
              placeholder="Detalhes do evento (opcional)"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
              {editingEvent ? 'Atualizar' : 'Criar'} Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Calendário</h1>
        
        {(user.userType === 'supervisor' || user.userType === 'admin') && (
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setEditingEvent(null);
              setShowEventModal(true);
            }}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-800">
                  {format(currentDate, 'MMMM yy', { locale: ptBR })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="rounded-2xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="rounded-2xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-slate-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map(day => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        relative p-2 h-16 rounded-xl border-2 transition-all duration-200 cursor-pointer
                        ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' :
                          hasEvents 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'bg-white/50 border-slate-200 hover:bg-white/80'
                        }
                      `}
                      onClick={() => {
                        if ((user.userType === 'supervisor' || user.userType === 'admin') && isCurrentMonth) {
                          setSelectedDate(day);
                          setEditingEvent(null);
                          setShowEventModal(true);
                        }
                      }}
                    >
                      <div className="text-sm font-medium">
                        {format(day, 'd')}
                      </div>
                      {hasEvents && isCurrentMonth && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="h-1 bg-blue-500 rounded-full"></div>
                          <div className="text-xs text-blue-600 mt-1 truncate">
                            {dayEvents[0].title}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Eventos do Mês
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {getEventsForMonth().length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    Nenhum evento neste mês
                  </p>
                ) : (
                  getEventsForMonth()
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm">
                              {format(event.date, 'dd/MM/yyyy')} - {event.title}
                            </div>
                            {event.description && (
                              <p className="text-xs text-slate-600 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                          
                          {(user.userType === 'supervisor' || user.userType === 'admin') && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/50"
                                onClick={() => {
                                  setSelectedDate(event.date);
                                  setEditingEvent(event);
                                  setShowEventModal(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventModal />
    </div>
  );
};

export default CalendarPage;