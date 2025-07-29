import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, AlertTriangle, Wrench, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Equipment, NotificationData, NotificationSystemProps } from "@/types/equipment";

export const NotificationSystem = ({ equipment, onSendEmail }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Simulate checking for maintenance alerts
  useEffect(() => {
    const checkMaintenanceAlerts = () => {
      const today = new Date();
      const alerts: NotificationData[] = [];

      equipment.forEach(item => {
        const nextMaintenance = new Date(item.nextMaintenance);
        const daysDiff = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysDiff <= 7 && daysDiff > 0) {
          alerts.push({
            id: `maint-${item.id}-${Date.now()}`,
            type: 'maintenance',
            title: `Maintenance Due Soon`,
            message: `${item.name} requires maintenance in ${daysDiff} days`,
            equipmentId: item.id,
            timestamp: new Date(),
            read: false,
            emailSent: false
          });
        } else if (daysDiff <= 0) {
          alerts.push({
            id: `overdue-${item.id}-${Date.now()}`,
            type: 'critical',
            title: `Maintenance Overdue`,
            message: `${item.name} maintenance is ${Math.abs(daysDiff)} days overdue`,
            equipmentId: item.id,
            timestamp: new Date(),
            read: false,
            emailSent: false
          });
        }

        if (item.status === 'critical') {
          alerts.push({
            id: `critical-${item.id}-${Date.now()}`,
            type: 'critical',
            title: `Critical Equipment Status`,
            message: `${item.name} requires immediate attention`,
            equipmentId: item.id,
            timestamp: new Date(),
            read: false,
            emailSent: false
          });
        }
      });

      if (alerts.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newAlerts = alerts.filter(alert => !existingIds.has(alert.id));
          return [...prev, ...newAlerts];
        });
      }
    };

    checkMaintenanceAlerts();
    const interval = setInterval(checkMaintenanceAlerts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [equipment]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sendEmailAlert = async (notification: NotificationData) => {
    // Simulate email sending
    const recipients = {
      admin: 'admin@company.com',
      maintenance: 'maintenance@company.com',
      user: 'user@company.com'
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, emailSent: true } : n
        )
      );

      toast({
        title: "Email Alert Sent",
        description: `Notification sent to admin and maintenance team for ${notification.title}`,
      });

      onSendEmail(notification);
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send email alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-warning" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'maintenance':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifications([])}
          >
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notifications at this time</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-muted/50' : 'bg-card'
              } transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleString()}
                      </span>
                      {notification.emailSent && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="w-3 h-3 mr-1" />
                          Email Sent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.emailSent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendEmailAlert(notification)}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Send Email
                    </Button>
                  )}
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Email service simulation
export const EmailService = {
  sendMaintenanceAlert: async (equipment: Equipment, message: string) => {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: ['admin@company.com', 'maintenance@company.com'],
      subject: `Maintenance Alert: ${equipment.name}`,
      body: `
        Equipment: ${equipment.name}
        Model: ${equipment.model}
        Serial: ${equipment.serialNumber}
        Location: ${equipment.location}
        Status: ${equipment.status}
        
        Message: ${message}
        
        Please take immediate action to address this maintenance requirement.
      `,
      timestamp: new Date()
    };
    
    console.log('Email sent:', emailData);
    return emailData;
  },

  sendCriticalAlert: async (equipment: Equipment) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: ['admin@company.com', 'emergency@company.com'],
      subject: `🚨 CRITICAL ALERT: ${equipment.name}`,
      body: `
        CRITICAL EQUIPMENT ALERT
        
        Equipment: ${equipment.name}
        Model: ${equipment.model}
        Serial: ${equipment.serialNumber}
        Location: ${equipment.location}
        Status: CRITICAL
        
        This equipment requires immediate attention to prevent potential safety hazards or operational disruption.
        
        Please respond immediately.
      `,
      timestamp: new Date()
    };
    
    console.log('Critical email sent:', emailData);
    return emailData;
  }
};