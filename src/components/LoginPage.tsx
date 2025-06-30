import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const { toast } = useToast();

  const initializeData = () => {
    // Initialize mock data in localStorage if not exists
    if (!localStorage.getItem('orakle_users')) {
      const mockUsers = [
        { id: '1', userType: 'colaborador', username: 'colaborador', password: '123', name: 'Ana Silva', role: 'Analista', team: 'Vendas', teamId: '1', points: 1500, profilePicture: '' },
        { id: '2', userType: 'supervisor', username: 'supervisor', password: '123', name: 'Carlos Santos', role: 'Supervisor', team: 'Vendas', teamId: '1', points: 2800, profilePicture: '' },
        { id: '3', userType: 'admin', username: 'admin', password: '123', name: 'Maria Oliveira', role: 'Administrador', team: 'Gestão', teamId: '2', points: 5000, profilePicture: '' }
      ];
      localStorage.setItem('orakle_users', JSON.stringify(mockUsers));
      
      const mockTeams = [
        { id: '1', name: 'Vendas', supervisorId: '2' },
        { id: '2', name: 'Gestão', supervisorId: '3' }
      ];
      localStorage.setItem('orakle_teams', JSON.stringify(mockTeams));

      // Initialize notifications
      const notifications = [
        { id: 1, message: 'Bem-vindo à plataforma Orakle!', read: false, date: new Date().toISOString() },
        { id: 2, message: 'Você ganhou 100 pontos por completar seu perfil!', read: false, date: new Date().toISOString() }
      ];
      localStorage.setItem('orakle_notifications', JSON.stringify(notifications));
    }
  };

  const handleLogin = () => {
    if (!username || !password || !userType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    initializeData();
    const users = JSON.parse(localStorage.getItem('orakle_users') || '[]');
    const user = users.find((u: any) => u.userType === userType && u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('orakle_current_user', JSON.stringify(user));
      onLogin(user);
      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${user.name}!`
      });
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Credenciais inválidas",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Orakle</h1>
          <p className="text-slate-600">Plataforma de Gestão de Colaboradores</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl transition-all duration-300 hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-slate-700">Entrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(59,130,246,0.15)] transition-all duration-300"
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(59,130,246,0.15)] transition-all duration-300"
                />
              </div>
              
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="h-12 rounded-2xl border-0 bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(59,130,246,0.15)]">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
                  <SelectItem value="colaborador" className="rounded-lg hover:bg-blue-50">Colaborador</SelectItem>
                  <SelectItem value="supervisor" className="rounded-lg hover:bg-blue-50">Supervisor</SelectItem>
                  <SelectItem value="admin" className="rounded-lg hover:bg-blue-50">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.5)] transition-all duration-300 text-white font-semibold"
            >
              Entrar
            </Button>
            
            <div className="text-center text-sm text-slate-500 mt-4">
              <p>Credenciais de teste:</p>
              <p>Usuário: colaborador/supervisor/admin | Senha: 123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;