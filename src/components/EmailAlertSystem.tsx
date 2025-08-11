import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  Settings, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maintenance' | 'operator';
  active: boolean;
}

interface AlertSettings {
  enableAutoAlerts: boolean;
  daysBeforeDue: number;
  criticalEquipmentOnly: boolean;
  sendToAllUsers: boolean;
}

interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  equipmentId?: string;
  notification_type?: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  location: string;
  next_maintenance_date?: string;
  status: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const EmailAlertSystem = () => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enableAutoAlerts: true,
    daysBeforeDue: 7,
    criticalEquipmentOnly: false,
    sendToAllUsers: false
  });
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', role: 'operator' as const });
  const [emailLog, setEmailLog] = useState<EmailLog[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const { toast } = useToast();

  // Fetch equipment and notification settings on component mount
  useEffect(() => {
    fetchEquipment();
    fetchNotificationSettings();
    fetchEmailLog();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('next_maintenance_date', { ascending: true });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment data",
        variant: "destructive"
      });
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*');

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        // Parse settings from key-value pairs
        const settings = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {} as Record<string, string>);
        
        setAlertSettings({
          enableAutoAlerts: settings.auto_alerts_enabled === 'true',
          daysBeforeDue: parseInt(settings.days_before_due) || 7,
          criticalEquipmentOnly: settings.critical_only === 'true',
          sendToAllUsers: settings.send_to_all_users === 'true'
        });
        
        // Parse recipients if stored as JSON
        if (settings.recipients) {
          try {
            setRecipients(JSON.parse(settings.recipients));
          } catch (e) {
            console.error('Error parsing recipients:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const fetchEmailLog = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedLog = data?.map(log => ({
        id: log.id,
        timestamp: log.sent_at,
        recipient: log.recipient_email,
        subject: `${log.notification_type.replace('_', ' ').toUpperCase()} Alert`,
        status: log.email_status as 'sent' | 'failed' | 'pending',
        equipmentId: log.asset_id,
        notification_type: log.notification_type
      })) || [];
      
      setEmailLog(formattedLog);
    } catch (error) {
      console.error('Error fetching email log:', error);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      // Save settings as key-value pairs
      const settingsToSave = [
        { setting_key: 'auto_alerts_enabled', setting_value: alertSettings.enableAutoAlerts.toString() },
        { setting_key: 'days_before_due', setting_value: alertSettings.daysBeforeDue.toString() },
        { setting_key: 'critical_only', setting_value: alertSettings.criticalEquipmentOnly.toString() },
        { setting_key: 'send_to_all_users', setting_value: alertSettings.sendToAllUsers.toString() },
        { setting_key: 'recipients', setting_value: JSON.stringify(recipients) }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('notification_settings')
          .upsert(setting, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }
      
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    }
  };

  // Get equipment due for maintenance
  const getEquipmentDueForMaintenance = () => {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + alertSettings.daysBeforeDue);

    return equipment.filter(item => {
      if (!item.next_maintenance_date) return false;
      
      const dueDate = new Date(item.next_maintenance_date);
      const isDue = dueDate <= warningDate;
      const isCritical = item.status === 'critical';
      
      if (alertSettings.criticalEquipmentOnly) {
        return isDue && isCritical;
      }
      
      return isDue;
    });
  };

  // Send maintenance alert for specific equipment
  const sendMaintenanceAlert = async (equipmentItem: Equipment, alertType: string = 'maintenance_due') => {
    if (recipients.filter(r => r.active).length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add email recipients before sending alerts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const activeRecipients = recipients.filter(r => r.active).map(r => r.email);
      
      const { data, error } = await supabase.functions.invoke('send-maintenance-alert', {
        body: {
          equipmentId: equipmentItem.id,
          alertType,
          recipients: activeRecipients,
          customMessage: customMessage || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Alert Sent Successfully",
        description: `Maintenance alert sent for ${equipmentItem.name}`,
      });

      // Refresh email log
      await fetchEmailLog();
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending alert:', error);
      toast({
        title: "Failed to Send Alert",
        description: "Please check your email configuration and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Send bulk alerts for all due equipment
  const sendAllDueAlerts = async () => {
    if (recipients.filter(r => r.active).length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add email recipients before sending alerts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const activeRecipients = recipients.filter(r => r.active).map(r => r.email);
      
      const { data, error } = await supabase.functions.invoke('send-bulk-alerts', {
        body: {
          daysBeforeDue: alertSettings.daysBeforeDue,
          criticalOnly: alertSettings.criticalEquipmentOnly,
          recipients: activeRecipients
        }
      });

      if (error) throw error;

      toast({
        title: "Bulk Alerts Sent",
        description: `Maintenance summary sent to ${activeRecipients.length} recipients`,
      });

      // Refresh email log
      await fetchEmailLog();
    } catch (error) {
      console.error('Error sending bulk alerts:', error);
      toast({
        title: "Failed to Send Bulk Alerts",
        description: "Please check your email configuration and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new recipient
  const addRecipient = () => {
    if (!newRecipient.name || !newRecipient.email) {
      toast({
        title: "Error",
        description: "Please fill in all recipient details",
        variant: "destructive"
      });
      return;
    }

    const recipient: EmailRecipient = {
      id: Date.now().toString(),
      ...newRecipient,
      active: true
    };

    setRecipients(prev => [...prev, recipient]);
    setNewRecipient({ name: '', email: '', role: 'operator' });
    
    toast({
      title: "Recipient Added",
      description: `${recipient.name} has been added to the notification list`,
    });
  };

  const dueEquipment = getEquipmentDueForMaintenance();

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      {dueEquipment.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {dueEquipment.length} equipment item(s) require maintenance attention
              </span>
              <Button size="sm" onClick={sendAllDueAlerts} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send All Alerts
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="log">Email Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Due for Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Maintenance Due
                </CardTitle>
                <CardDescription>
                  Equipment requiring maintenance within {alertSettings.daysBeforeDue} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dueEquipment.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>No equipment due for maintenance</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dueEquipment.map(item => {
                      if (!item.next_maintenance_date) return null;
                      
                      const dueDate = new Date(item.next_maintenance_date);
                      const today = new Date();
                      const isOverdue = dueDate < today;
                      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      let alertType = 'maintenance_due';
                      if (item.status === 'critical') alertType = 'critical';
                      else if (isOverdue) alertType = 'overdue';

                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Due: {item.next_maintenance_date}
                              {isOverdue && <span className="text-destructive font-bold ml-2">(OVERDUE)</span>}
                              {!isOverdue && daysDiff <= 2 && <span className="text-orange-500 font-bold ml-2">(URGENT)</span>}
                            </p>
                            {item.status === 'critical' && (
                              <Badge variant="destructive" className="mt-1">Critical</Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendMaintenanceAlert(item, alertType)}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Alert
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Custom Message
                </CardTitle>
                <CardDescription>Add a custom message to maintenance alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add a custom message to include with maintenance alerts..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    This message will be included in all maintenance alerts sent from the overview tab.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Email Recipients
              </CardTitle>
              <CardDescription>Manage who receives maintenance alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="recipient-name">Name</Label>
                  <Input
                    id="recipient-name"
                    value={newRecipient.name}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient-email">Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient-role">Role</Label>
                  <select 
                    id="recipient-role"
                    value={newRecipient.role}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="operator">Operator</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addRecipient} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Recipients List */}
              <div className="space-y-3">
                {recipients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>No recipients added yet</p>
                  </div>
                ) : (
                  recipients.map(recipient => (
                    <div key={recipient.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{recipient.name}</h4>
                          <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        </div>
                        <Badge variant="secondary">{recipient.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={recipient.active}
                          onCheckedChange={(checked) => 
                            setRecipients(prev => 
                              prev.map(r => r.id === recipient.id ? { ...r, active: checked } : r)
                            )
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Settings
              </CardTitle>
              <CardDescription>Configure automatic alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-auto">Enable Automatic Alerts</Label>
                  <p className="text-sm text-muted-foreground">Automatically send maintenance alerts</p>
                </div>
                <Switch
                  id="enable-auto"
                  checked={alertSettings.enableAutoAlerts}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, enableAutoAlerts: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="days-before">Days Before Due Date</Label>
                <Input
                  id="days-before"
                  type="number"
                  min="1"
                  max="30"
                  value={alertSettings.daysBeforeDue}
                  onChange={(e) => 
                    setAlertSettings(prev => ({ ...prev, daysBeforeDue: parseInt(e.target.value) || 7 }))
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Send alerts this many days before maintenance is due
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="critical-only">Critical Equipment Only</Label>
                  <p className="text-sm text-muted-foreground">Only send alerts for critical equipment</p>
                </div>
                <Switch
                  id="critical-only"
                  checked={alertSettings.criticalEquipmentOnly}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, criticalEquipmentOnly: checked }))
                  }
                />
              </div>

              <Button onClick={saveNotificationSettings} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Email Log
              </CardTitle>
              <CardDescription>Recent email notifications sent</CardDescription>
            </CardHeader>
            <CardContent>
              {emailLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2" />
                  <p>No emails sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLog.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{log.subject}</p>
                        <p className="text-xs text-muted-foreground">To: {log.recipient}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};