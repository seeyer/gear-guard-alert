// Enhanced Equipment Interface with proper typing
export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  lastMaintenance: string;
  nextMaintenance: string;
  hoursOperated: number;
  image?: string;
  category?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  specifications?: Record<string, string>;
}

// Maintenance Task Interface
export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'preventive' | 'emergency' | 'inspection';
  title: string;
  description: string;
  scheduledDate: Date;
  estimatedHours: number;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  parts?: string[];
  cost?: number;
}

// Notification Interface
export interface NotificationData {
  id: string;
  type: 'maintenance' | 'critical' | 'alert' | 'info';
  title: string;
  message: string;
  equipmentId: string;
  timestamp: Date;
  read: boolean;
  emailSent: boolean;
}

// Status Configuration Type
export interface StatusConfig {
  operational: {
    label: string;
    className: string;
    icon: any;
  };
  maintenance: {
    label: string;
    className: string;
    icon: any;
  };
  critical: {
    label: string;
    className: string;
    icon: any;
  };
  offline: {
    label: string;
    className: string;
    icon: any;
  };
}

// User Interface
export interface User {
  id: string;
  email: string;
  role: 'user' | 'superadmin';
  name?: string;
}

// Props Interfaces
export interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
}

export interface AddEquipmentDialogProps {
  onAdd: (equipment: Equipment) => void;
}

export interface MaintenanceSchedulerProps {
  equipment: Equipment[];
  onScheduleTask: (task: MaintenanceTask) => void;
}

export interface NotificationSystemProps {
  equipment: Equipment[];
  onSendEmail: (notification: NotificationData) => void;
}

export interface AnalyticsReportsProps {
  equipment: Equipment[];
}

export interface EquipmentDetailsModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (equipment: Equipment) => void;
  onSendAlert: (equipment: Equipment, message: string) => void;
}