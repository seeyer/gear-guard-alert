// Equipment Interface matching database schema
export interface Equipment {
  id: string;
  name: string;
  model?: string;
  serial_number: string;
  location: string;
  status: 'available' | 'maintenance' | 'critical' | 'checked_out';
  next_maintenance_date?: string;
  category: string;
  description?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  assigned_to_id?: string;
  assigned_date?: string;
  created_at: string;
  updated_at: string;
}

// Legacy Equipment Interface for components that use old naming
export interface LegacyEquipment {
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
  equipment: LegacyEquipment;
  onEdit: (equipment: LegacyEquipment) => void;
}

export interface AddEquipmentDialogProps {
  onAdd: (equipment: LegacyEquipment) => void;
}

export interface MaintenanceSchedulerProps {
  equipment: LegacyEquipment[];
  onScheduleTask: (task: MaintenanceTask) => void;
}

export interface NotificationSystemProps {
  equipment: LegacyEquipment[];
  onSendEmail: (notification: NotificationData) => void;
}

export interface AnalyticsReportsProps {
  equipment: LegacyEquipment[];
}

export interface EquipmentDetailsModalProps {
  equipment: LegacyEquipment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (equipment: LegacyEquipment) => void;
  onSendAlert: (equipment: LegacyEquipment, message: string) => void;
}