import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Wrench, AlertTriangle, XCircle } from "lucide-react";

interface StatusOverviewProps {
  equipment: Array<{
    status: 'operational' | 'maintenance' | 'critical' | 'offline';
  }>;
}

export const StatusOverview = ({ equipment }: StatusOverviewProps) => {
  const statusCounts = equipment.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusItems = [
    {
      label: 'Operational',
      count: statusCounts.operational || 0,
      icon: CheckCircle,
      color: 'text-status-operational',
      bgColor: 'bg-status-operational/10'
    },
    {
      label: 'Maintenance Due',
      count: statusCounts.maintenance || 0,
      icon: Wrench,
      color: 'text-status-maintenance',
      bgColor: 'bg-status-maintenance/10'
    },
    {
      label: 'Critical',
      count: statusCounts.critical || 0,
      icon: AlertTriangle,
      color: 'text-status-critical',
      bgColor: 'bg-status-critical/10'
    },
    {
      label: 'Offline',
      count: statusCounts.offline || 0,
      icon: XCircle,
      color: 'text-status-offline',
      bgColor: 'bg-status-offline/10'
    }
  ];

  const totalEquipment = equipment.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusItems.map((item) => {
        const Icon = item.icon;
        const percentage = totalEquipment > 0 ? ((item.count / totalEquipment) * 100).toFixed(1) : '0';
        
        return (
          <Card key={item.label} className="bg-gradient-to-br from-card to-muted/20 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.count}</div>
              <p className="text-xs text-muted-foreground">
                {percentage}% of total equipment
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};