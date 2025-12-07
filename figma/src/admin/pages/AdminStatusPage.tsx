import { AdminLayout } from '../components/AdminLayout';
import { Badge } from "../../components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
  lastCheck: string;
}

const services: Service[] = [
  {
    name: "Database",
    status: "operational",
    uptime: "99.99%",
    lastCheck: "2 min ago",
  },
  {
    name: "Analytics MVs",
    status: "operational",
    uptime: "99.95%",
    lastCheck: "1 min ago",
  },
  {
    name: "Billing",
    status: "operational",
    uptime: "100%",
    lastCheck: "5 min ago",
  },
  {
    name: "Mail Service",
    status: "degraded",
    uptime: "98.20%",
    lastCheck: "3 min ago",
  },
  {
    name: "Indexer",
    status: "operational",
    uptime: "99.97%",
    lastCheck: "1 min ago",
  },
];

const incidents = [
  {
    title: "Scheduled maintenance",
    description: "Database optimization and index rebuild",
    status: "scheduled",
    date: "Nov 20, 2025 02:00 UTC",
  },
  {
    title: "Mail service degraded performance",
    description: "Email notifications experiencing delays of 5-10 minutes",
    status: "investigating",
    date: "Nov 17, 2025 14:30 UTC",
  },
  {
    title: "Indexer sync delay",
    description: "Resolved: Flare Network indexer caught up with latest blocks",
    status: "resolved",
    date: "Nov 16, 2025 09:15 UTC",
  },
];

function StatusBadge({ status }: { status: ServiceStatus }) {
  const variants = {
    operational: {
      icon: CheckCircle2,
      label: "Operational",
      className: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30",
    },
    degraded: {
      icon: AlertCircle,
      label: "Degraded",
      className: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30",
    },
    outage: {
      icon: XCircle,
      label: "Outage",
      className: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30",
    },
    maintenance: {
      icon: Clock,
      label: "Maintenance",
      className: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30",
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${variant.className}`}>
      <Icon className="size-3" />
      {variant.label}
    </Badge>
  );
}

export function AdminStatusPage() {
  const overallStatus: ServiceStatus = services.some(s => s.status === "outage") 
    ? "outage" 
    : services.some(s => s.status === "degraded")
    ? "degraded"
    : "operational";

  return (
    <AdminLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-white/95 mb-2" style={{ fontSize: '32px' }}>
            System Status
          </h1>
          <p className="text-white/70">
            Real-time status and uptime monitoring for Liquilab services
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-white/95 mb-2" style={{ fontSize: '24px' }}>
                Current Status
              </h2>
              <p className="text-white/70">
                {overallStatus === "operational" 
                  ? "All systems operational"
                  : overallStatus === "degraded"
                  ? "Some systems experiencing issues"
                  : "System outage detected"
                }
              </p>
            </div>
            <StatusBadge status={overallStatus} />
          </div>
        </div>

        {/* Services */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-heading text-white/95" style={{ fontSize: '24px' }}>
              Services
            </h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {services.map((service) => (
              <div key={service.name} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-['Inter',sans-serif] text-white/95 font-medium" style={{ fontSize: '18px' }}>
                        {service.name}
                      </h3>
                      <StatusBadge status={service.status} />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/[0.58]">
                      <span className="numeric">Uptime: {service.uptime}</span>
                      <span>Last checked: {service.lastCheck}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-heading text-white/95" style={{ fontSize: '24px' }}>
              Recent Incidents
            </h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {incidents.map((incident, i) => (
              <div key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                    incident.status === "resolved" 
                      ? "bg-[#10B981]" 
                      : incident.status === "scheduled"
                      ? "bg-[#3B82F6]"
                      : "bg-[#F59E0B]"
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-['Inter',sans-serif] text-white/95 font-medium" style={{ fontSize: '18px' }}>
                        {incident.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`${
                          incident.status === "resolved"
                            ? "text-[#10B981] border-[#10B981]/30"
                            : incident.status === "scheduled"
                            ? "text-[#3B82F6] border-[#3B82F6]/30"
                            : "text-[#F59E0B] border-[#F59E0B]/30"
                        }`}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-white/70 mb-2">{incident.description}</p>
                    <p className="text-sm text-white/[0.58]">{incident.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/[0.58]">
          <p>
            Status updates are refreshed every minute. 
            For detailed incident reports, contact the development team.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
