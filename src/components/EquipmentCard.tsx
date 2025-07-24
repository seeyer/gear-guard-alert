import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Wrench, AlertTriangle } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  lastMaintenance: string;
  nextMaintenance: string;
  hoursOperated: number;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
}

const statusConfig = {
  operational: {
    label: 'Operational',
    className: 'bg-status-operational text-primary-foreground',
    icon: null
  },
  maintenance: {
    label: 'Maintenance Due',
    className: 'bg-status-maintenance text-primary-foreground',
    icon: Wrench
  },
  critical: {
    label: 'Critical',
    className: 'bg-status-critical text-primary-foreground',
    icon: AlertTriangle
  },
  offline: {
    label: 'Offline',
    className: 'bg-status-offline text-primary-foreground',
    icon: null
  }
};

export const EquipmentCard = ({ equipment, onEdit }: EquipmentCardProps) => {
  const statusInfo = statusConfig[equipment.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border hover:shadow-[var(--shadow-equipment)] transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground text-lg font-bold">
              {equipment.name}
            </CardTitle>
            <p className="text-muted-foreground text-sm">{equipment.model}</p>
          </div>
          <Badge className={statusInfo.className}>
            {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{equipment.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{equipment.hoursOperated}h</span>
          </div>
        </div>
        
        <div className="border-t border-border pt-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Last: {equipment.lastMaintenance}</div>
            <div>Next: {equipment.nextMaintenance}</div>
          </div>
        </div>
        
        <Button 
          onClick={() => onEdit(equipment)}
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};