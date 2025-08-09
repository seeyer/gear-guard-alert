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
  Trash2
} from 'lucide-react';
import { Equipment } from '@/types/equipment';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'maintenance_due' | 'overdue' | 'critical' | 'custom';
}

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

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Maintenance Due',
    subject: 'Equipment Maintenance Due - {equipmentName}',
    type: 'maintenance_due',
    body: `Dear Team,

This is an automated reminder that the following equipment is due for maintenance:

Equipment: {equipmentName}
Model: {equipmentModel}
Serial Number: {serialNumber}
Location: {location}
Maintenance Due Date: {nextMaintenance}
Current Hours: {hoursOperated}

Please schedule maintenance as soon as possible to ensure optimal performance and safety.

Best regards,
Machinery Management System`
  },
  {
    id: '2',
    name: 'Overdue Maintenance',
    subject: 'URGENT: Overdue Maintenance - {equipmentName}',
    type: 'overdue',
    body: `URGENT NOTICE

The following equipment has OVERDUE maintenance:

Equipment: {equipmentName}
Model: {equipmentModel}
Serial Number: {serialNumber}
Location: {location}
Maintenance Due Date: {nextMaintenance} (OVERDUE)
Current Hours: {hoursOperated}

IMMEDIATE ACTION REQUIRED. Please stop using this equipment until maintenance is completed.

Best regards,
Machinery Management System`
  },
  {
    id: '3',
    name: 'Critical Equipment Alert',
    subject: 'CRITICAL: Equipment Status Alert - {equipmentName}',
    type: 'critical',
    body: `CRITICAL ALERT

Equipment has been marked as CRITICAL status:

Equipment: {equipmentName}
Model: {equipmentModel}
Serial Number: {serialNumber}
Location: {location}
Status: CRITICAL
Last Maintenance: {lastMaintenance}
Current Hours: {hoursOperated}

STOP OPERATION IMMEDIATELY. Contact maintenance team for urgent inspection.

Best regards,
Machinery Management System`
  }
];

const defaultRecipients: EmailRecipient[] = [
  { id: '1', name: 'Maintenance Manager', email: 'maintenance@company.com', role: 'maintenance', active: true },
  { id: '2', name: 'Site Supervisor', email: 'supervisor@company.com', role: 'admin', active: true },
  { id: '3', name: 'Operations Team', email: 'operations@company.com', role: 'operator', active: true }
];

interface Props {
  equipment: Equipment[];
}

export const EmailAlertSystem = ({ equipment }: Props) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [recipients, setRecipients] = useState<EmailRecipient[]>(defaultRecipients);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enableAutoAlerts: true,
    daysBeforeDue: 7,
    criticalEquipmentOnly: false,
    sendToAllUsers: false
  });
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', role: 'operator' as const });
  const [emailLog, setEmailLog] = useState<Array<{
    id: string;
    timestamp: string;
    recipient: string;
    subject: string;
    status: 'sent' | 'failed' | 'pending';
    equipmentId?: string;
  }>>([]);
  
  const { toast } = useToast();

  // Check for equipment due for maintenance
  const getEquipmentDueForMaintenance = () => {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + alertSettings.daysBeforeDue);

    return equipment.filter(item => {
      const dueDate = new Date(item.nextMaintenance);
      const isDue = dueDate <= warningDate;
      const isCritical = item.status === 'critical';
      
      if (alertSettings.criticalEquipmentOnly) {
        return isDue && isCritical;
      }
      
      return isDue;
    });
  };

  // Send test email
  const sendTestEmail = async (templateId: string, recipientEmail: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Simulate sending email
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      recipient: recipientEmail,
      subject: 'TEST: ' + template.subject.replace('{equipmentName}', 'Sample Equipment'),
      status: 'sent' as const
    };

    setEmailLog(prev => [logEntry, ...prev]);
    
    toast({
      title: "Test Email Sent",
      description: `Test email sent to ${recipientEmail}`,
    });
  };

  // Send alert for specific equipment
  const sendMaintenanceAlert = async (equipmentItem: Equipment, templateType: string = 'maintenance_due') => {
    const template = templates.find(t => t.type === templateType);
    if (!template) return;

    const activeRecipients = recipients.filter(r => r.active);
    
    for (const recipient of activeRecipients) {
      const subject = template.subject
        .replace('{equipmentName}', equipmentItem.name)
        .replace('{equipmentModel}', equipmentItem.model);

      const body = template.body
        .replace(/{equipmentName}/g, equipmentItem.name)
        .replace(/{equipmentModel}/g, equipmentItem.model)
        .replace(/{serialNumber}/g, equipmentItem.serialNumber)
        .replace(/{location}/g, equipmentItem.location)
        .replace(/{nextMaintenance}/g, equipmentItem.nextMaintenance)
        .replace(/{lastMaintenance}/g, equipmentItem.lastMaintenance)
        .replace(/{hoursOperated}/g, equipmentItem.hoursOperated.toString());

      // Simulate email sending
      const logEntry = {
        id: Date.now().toString() + recipient.id,
        timestamp: new Date().toISOString(),
        recipient: recipient.email,
        subject,
        status: 'sent' as const,
        equipmentId: equipmentItem.id
      };

      setEmailLog(prev => [logEntry, ...prev]);
    }

    toast({
      title: "Maintenance Alert Sent",
      description: `Alert sent to ${activeRecipients.length} recipients for ${equipmentItem.name}`,
    });
  };

  // Auto-send alerts for due equipment
  const sendAllDueAlerts = () => {
    const dueEquipment = getEquipmentDueForMaintenance();
    
    dueEquipment.forEach(item => {
      const dueDate = new Date(item.nextMaintenance);
      const today = new Date();
      const isOverdue = dueDate < today;
      const isCritical = item.status === 'critical';
      
      let templateType = 'maintenance_due';
      if (isCritical) templateType = 'critical';
      else if (isOverdue) templateType = 'overdue';
      
      sendMaintenanceAlert(item, templateType);
    });
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
              <Button size="sm" onClick={sendAllDueAlerts}>
                <Send className="w-4 h-4 mr-2" />
                Send All Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    {dueEquipment.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Due: {item.nextMaintenance}</p>
                          {item.status === 'critical' && (
                            <Badge variant="destructive" className="mt-1">Critical</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendMaintenanceAlert(item)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Alert
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recent Email Activity
                </CardTitle>
                <CardDescription>Latest email notifications sent</CardDescription>
              </CardHeader>
              <CardContent>
                {emailLog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-2" />
                    <p>No emails sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {emailLog.slice(0, 10).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-2 border-l-2 border-primary bg-muted/50 rounded">
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
                {recipients.map(recipient => (
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
                        onClick={() => sendTestEmail('1', recipient.email)}
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates for different alert types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {templates.map(template => (
                  <div key={template.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Subject</Label>
                        <Input value={template.subject} readOnly />
                      </div>
                      <div>
                        <Label>Body</Label>
                        <Textarea 
                          value={template.body} 
                          readOnly 
                          rows={6}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
              <CardDescription>Configure automatic email alert behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-alerts">Enable Automatic Alerts</Label>
                  <p className="text-sm text-muted-foreground">Automatically send alerts when maintenance is due</p>
                </div>
                <Switch
                  id="auto-alerts"
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
                  <p className="text-sm text-muted-foreground">Only send alerts for equipment marked as critical</p>
                </div>
                <Switch
                  id="critical-only"
                  checked={alertSettings.criticalEquipmentOnly}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, criticalEquipmentOnly: checked }))
                  }
                />
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> For production use, connect this project to Supabase to enable actual email sending through backend Edge Functions with services like SendGrid, Resend, or AWS SES.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};