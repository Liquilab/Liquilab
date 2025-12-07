import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, BarChart3, Settings, Database, Bell } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/status', label: 'System Status', icon: Activity },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: Database },
    { path: '/admin/alerts', label: 'Alerts', icon: Bell },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0B1530]">
      {/* Admin Header */}
      <header className="bg-[#0F1A36]/95 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#1BE8D2] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h1 className="font-heading text-white/95 text-xl">Liquilab Admin</h1>
                  <p className="text-white/[0.58] text-xs">Internal Dashboard</p>
                </div>
              </Link>
              <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">
                Admin Only
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="text-white/70 hover:text-[#3B82F6] transition-colors text-sm"
              >
                ← Back to Public Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-[#0F1A36]/80 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 transition-all border-b-2 ${
                    active
                      ? 'border-[#3B82F6] text-white/95 bg-[#3B82F6]/10'
                      : 'border-transparent text-white/70 hover:text-white/95 hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="font-['Inter',sans-serif] text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-[#0F1A36]/95 border-t border-white/10 mt-16">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white/[0.58]">
              Liquilab Admin Dashboard • Internal Use Only
            </p>
            <p className="text-white/[0.58]">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
