
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X, Home, TrendingUp, Trophy, FileText, Calendar, Users, Gift, Gamepad2, User, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}

const DashboardLayout = ({ user, onLogout, currentPage, onPageChange, children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('orakle_notifications') || '[]');
    setNotifications(storedNotifications);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'performance', label: 'Desempenho', icon: TrendingUp, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'ranking', label: 'Ranking', icon: Trophy, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'requests', label: 'Solicitações', icon: FileText, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'calendar', label: 'Calendário', icon: Calendar, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'team', label: 'Equipe', icon: Users, available: ['supervisor', 'admin'] },
    { id: 'rewards', label: 'Premiações', icon: Gift, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'games', label: 'Jogos', icon: Gamepad2, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'profile', label: 'Perfil', icon: User, available: ['colaborador', 'supervisor', 'admin'] },
    { id: 'support', label: 'Suporte AI', icon: MessageCircle, available: ['colaborador', 'supervisor', 'admin'] }
  ];

  const availableMenuItems = menuItems.filter(item => item.available.includes(user.userType));
  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (notificationId: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('orakle_notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="h-16 bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-b border-white/20 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl hover:bg-slate-100/80 transition-all duration-300"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-bold text-xl text-slate-800">Orakle</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-xl hover:bg-slate-100/80 transition-all duration-300 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 p-4 z-50">
                <h3 className="font-semibold text-slate-800 mb-3">Notificações</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm">Nenhuma notificação</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          notification.read 
                            ? 'bg-slate-50/50 text-slate-600' 
                            : 'bg-blue-50/80 text-slate-800 hover:bg-blue-100/80'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(notification.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 hover:bg-slate-100/80 transition-all duration-300"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white/40 backdrop-blur-sm border-r border-white/20 min-h-[calc(100vh-4rem)] sticky top-16`}>
          <nav className="p-4 space-y-2">
            {availableMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start rounded-xl transition-all duration-300 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
                    : 'hover:bg-slate-100/80 text-slate-700'
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
