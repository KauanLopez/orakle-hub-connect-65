import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequestsPageProps {
  user: any;
}

const RequestsPage = ({ user }: RequestsPageProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [teammates, setTeammates] = useState<any[]>([]);
  const [newRequestType, setNewRequestType] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [isRequestTypeModalOpen, setIsRequestTypeModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mock data
    const mockRequests = [
      {
        id: 1,
        type: 'general',
        title: 'Solicitação de Férias',
        description: 'Gostaria de solicitar 10 dias de férias em dezembro.',
        requester: 'Ana Silva',
        team: 'Vendas',
        status: 'pending',
        date: new Date().toISOString(),
        targetUser: null
      },
      {
        id: 2,
        type: 'schedule',
        title: 'Troca de Horário - 15/12',
        description: 'Preciso trocar o horário do dia 15/12 com alguém da equipe.',
        requester: user.name,
        team: user.team,
        status: 'approved',
        date: new Date(Date.now() - 86400000).toISOString(),
        targetUser: 'Carlos Santos'
      }
    ];

    const mockTeammates = [
      { id: 1, name: 'Carlos Santos', team: user.team },
      { id: 2, name: 'João Oliveira', team: user.team },
      { id: 3, name: 'Maria Costa', team: user.team }
    ].filter(mate => mate.name !== user.name);

    setRequests(mockRequests);
    setTeammates(mockTeammates);
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const handleStatusChange = (requestId: number, newStatus: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
    
    const action = newStatus === 'approved' ? 'aprovada' : 'rejeitada';
    toast({
      title: "Solicitação atualizada",
      description: `A solicitação foi ${action} com sucesso.`
    });
  };

  const handleNewRequest = (formData: any) => {
    const newRequest = {
      id: Date.now(),
      type: newRequestType,
      title: formData.title,
      description: formData.description,
      requester: user.name,
      team: user.team,
      status: 'pending',
      date: new Date().toISOString(),
      targetUser: formData.targetUser || null
    };

    setRequests(prev => [newRequest, ...prev]);
    setShowNewRequestModal(false);
    setNewRequestType('');
    
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada e está aguardando aprovação."
    });
  };

  const getVisibleRequests = () => {
    if (user.userType === 'colaborador') {
      return requests.filter(req => req.requester === user.name);
    } else if (user.userType === 'supervisor') {
      return requests.filter(req => req.team === user.team);
    } else {
      return requests; // Admin sees all
    }
  };

  const NewRequestModal = () => (
    <Dialog open={showNewRequestModal} onOpenChange={setShowNewRequestModal}>
      <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Solicitação</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleNewRequest({
            title: formData.get('title'),
            description: formData.get('description'),
            targetUser: formData.get('targetUser')
          });
        }} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              className="rounded-2xl"
              placeholder="Ex: Solicitação de férias"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              required
              className="rounded-2xl"
              placeholder="Descreva sua solicitação..."
            />
          </div>

          {newRequestType === 'schedule' && (
            <div>
              <Label htmlFor="targetUser">Colega para troca (opcional)</Label>
              <Select name="targetUser">
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Selecione um colega" />
                </SelectTrigger>
                <SelectContent>
                  {teammates.map(mate => (
                    <SelectItem key={mate.id} value={mate.name}>
                      {mate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
            Enviar Solicitação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Solicitações</h1>
        
        {user.userType === 'colaborador' && (
          <Dialog open={isRequestTypeModalOpen} onOpenChange={setIsRequestTypeModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm max-w-md">
              <DialogHeader>
                <DialogTitle>Selecione o tipo de solicitação</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  onClick={() => {
                    setNewRequestType('general');
                    setIsRequestTypeModalOpen(false);
                    setShowNewRequestModal(true);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Geral
                </Button>
                <Button
                  onClick={() => {
                    setNewRequestType('schedule');
                    setIsRequestTypeModalOpen(false);
                    setShowNewRequestModal(true);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Troca de Horário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {getVisibleRequests().length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma solicitação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          getVisibleRequests().map((request) => (
            <Card key={request.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {request.type === 'schedule' ? <Calendar className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      {request.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Por {request.requester} • {request.team} • {new Date(request.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-700 mb-4">{request.description}</p>
                
                {request.targetUser && (
                  <p className="text-sm text-slate-500 mb-4">
                    <strong>Colega para troca:</strong> {request.targetUser}
                  </p>
                )}

                {/* Action buttons for supervisors/admins */}
                {(user.userType === 'supervisor' || user.userType === 'admin') && 
                 request.status === 'pending' && 
                 request.requester !== user.name && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange(request.id, 'approved')}
                      size="sm"
                      className="rounded-2xl bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(request.id, 'rejected')}
                      size="sm"
                      variant="outline"
                      className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <NewRequestModal />
    </div>
  );
};

export default RequestsPage;