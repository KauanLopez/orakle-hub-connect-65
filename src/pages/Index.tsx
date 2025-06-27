
import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import HomePage from '@/components/HomePage';
import ProfilePage from '@/components/ProfilePage';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('orakle_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('orakle_current_user');
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage user={user} />;
      case 'profile':
        return <ProfilePage user={user} />;
      case 'performance':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Desempenho - Em desenvolvimento</p>
          </div>
        );
      case 'ranking':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Ranking - Em desenvolvimento</p>
          </div>
        );
      case 'requests':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Solicitações - Em desenvolvimento</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Calendário - Em desenvolvimento</p>
          </div>
        );
      case 'team':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Equipe - Em desenvolvimento</p>
          </div>
        );
      case 'rewards':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Premiações - Em desenvolvimento</p>
          </div>
        );
      case 'games':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Jogos - Em desenvolvimento</p>
          </div>
        );
      case 'support':
        return (
          <div className="flex items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-3xl">
            <p className="text-slate-500 text-lg">Página de Suporte AI - Em desenvolvimento</p>
          </div>
        );
      default:
        return <HomePage user={user} />;
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </DashboardLayout>
  );
};

export default Index;
