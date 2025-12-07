import { AdminLayout } from '../components/AdminLayout';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, Activity, DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  return (
    <AdminLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-white/95 mb-2" style={{ fontSize: '32px' }}>
            Admin Dashboard
          </h1>
          <p className="text-white/70">
            System overview and key metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Users className="size-5 text-[#3B82F6]" />
              </div>
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                +12%
              </Badge>
            </div>
            <div className="numeric text-white/95 mb-1" style={{ fontSize: '28px' }}>
              1,247
            </div>
            <p className="text-white/[0.58] text-sm">Total Users</p>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-5 text-[#3B82F6]" />
              </div>
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                +8%
              </Badge>
            </div>
            <div className="numeric text-white/95 mb-1" style={{ fontSize: '28px' }}>
              543
            </div>
            <p className="text-white/[0.58] text-sm">Premium Subscriptions</p>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="size-5 text-[#3B82F6]" />
              </div>
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                +15%
              </Badge>
            </div>
            <div className="numeric text-white/95 mb-1" style={{ fontSize: '28px' }}>
              $24.5K
            </div>
            <p className="text-white/[0.58] text-sm">Monthly Revenue</p>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <Activity className="size-5 text-[#10B981]" />
              </div>
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                Healthy
              </Badge>
            </div>
            <div className="numeric text-white/95 mb-1" style={{ fontSize: '28px' }}>
              99.8%
            </div>
            <p className="text-white/[0.58] text-sm">System Uptime</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <Activity className="size-5 text-[#10B981]" />
              </div>
              <div>
                <h2 className="font-heading text-white/95" style={{ fontSize: '20px' }}>
                  System Health
                </h2>
                <p className="text-white/[0.58] text-sm">All services operational</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-[#10B981]" />
                  <div>
                    <p className="text-white/95 font-medium">API Services</p>
                    <p className="text-white/[0.58] text-sm">Response time: 45ms</p>
                  </div>
                </div>
                <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-[#10B981]" />
                  <div>
                    <p className="text-white/95 font-medium">Database</p>
                    <p className="text-white/[0.58] text-sm">Query time: 12ms</p>
                  </div>
                </div>
                <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-[#10B981]" />
                  <div>
                    <p className="text-white/95 font-medium">FTSO Data Feed</p>
                    <p className="text-white/[0.58] text-sm">Last update: 2 mins ago</p>
                  </div>
                </div>
                <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-5 text-[#F59E0B]" />
                  <div>
                    <p className="text-white/95 font-medium">Email Service</p>
                    <p className="text-white/[0.58] text-sm">Queue: 23 pending</p>
                  </div>
                </div>
                <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                  Degraded
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="font-heading text-white/95" style={{ fontSize: '20px' }}>
                  Recent Activity
                </h2>
                <p className="text-white/[0.58] text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white/95 font-medium">New Pro Subscription</p>
                  <span className="text-white/[0.58] text-sm">2 mins ago</span>
                </div>
                <p className="text-white/70 text-sm">User 0x7a8f...9d2e upgraded to Pro plan</p>
              </div>

              <div className="p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white/95 font-medium">RangeBand Alert Sent</p>
                  <span className="text-white/[0.58] text-sm">15 mins ago</span>
                </div>
                <p className="text-white/70 text-sm">342 users notified of position status changes</p>
              </div>

              <div className="p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white/95 font-medium">FTSO Data Sync</p>
                  <span className="text-white/[0.58] text-sm">1 hour ago</span>
                </div>
                <p className="text-white/70 text-sm">Successfully synced 1,247 pool positions</p>
              </div>

              <div className="p-4 bg-[#0B1530] border border-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white/95 font-medium">System Backup</p>
                  <span className="text-white/[0.58] text-sm">3 hours ago</span>
                </div>
                <p className="text-white/70 text-sm">Automated backup completed successfully</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
          <h2 className="font-heading text-white/95 mb-6" style={{ fontSize: '20px' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-[#0B1530] border border-white/5 rounded-lg hover:border-[#3B82F6]/50 transition-colors text-left">
              <p className="text-white/95 font-medium mb-1">Run Manual Sync</p>
              <p className="text-white/[0.58] text-sm">Force FTSO data refresh</p>
            </button>
            <button className="p-4 bg-[#0B1530] border border-white/5 rounded-lg hover:border-[#3B82F6]/50 transition-colors text-left">
              <p className="text-white/95 font-medium mb-1">Send Test Alert</p>
              <p className="text-white/[0.58] text-sm">Verify email system</p>
            </button>
            <button className="p-4 bg-[#0B1530] border border-white/5 rounded-lg hover:border-[#3B82F6]/50 transition-colors text-left">
              <p className="text-white/95 font-medium mb-1">View Error Logs</p>
              <p className="text-white/[0.58] text-sm">Check recent issues</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
