import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  Mail,
  Shield,
  Database,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// System stats will be calculated from real data
const systemStats = {
  totalUsers: 0,
  totalEquipment: 0,
  activeAlerts: 0,
  systemUptime: "99.9%",
  lastBackup: new Date().toISOString(),
  storageUsed: "0 GB",
};

const recentAlerts: any[] = [];

const users: any[] = [];

export const SuperAdminDashboard = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.company.com",
    smtpPort: "587",
    username: "alerts@company.com",
    alertsEnabled: true,
  });
  const { toast } = useToast();

  const handleSaveEmailSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Email alert settings have been updated successfully.",
    });
  };

  const handleSystemBackup = () => {
    toast({
      title: "Backup Started",
      description: "System backup is now in progress. You will be notified when complete.",
    });
  };

  const handleSendTestAlert = () => {
    toast({
      title: "Test Alert Sent",
      description: "A test email alert has been sent to the configured recipients.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">System management and configuration</p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active users in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalEquipment}</div>
              <p className="text-xs text-muted-foreground">Machines in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Alert Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>Monitor and manage system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.equipment}</h4>
                          <Badge 
                            variant={
                              alert.severity === 'critical' ? 'destructive' : 
                              alert.severity === 'high' ? 'default' : 'secondary'
                            }
                          >
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button onClick={handleSendTestAlert}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Disable
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Alert Settings
                </CardTitle>
                <CardDescription>Configure email notifications for alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={emailSettings.username}
                    onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="alerts-enabled"
                    checked={emailSettings.alertsEnabled}
                    onChange={(e) => setEmailSettings({...emailSettings, alertsEnabled: e.target.checked})}
                  />
                  <Label htmlFor="alerts-enabled">Enable email alerts</Label>
                </div>
                <Button onClick={handleSaveEmailSettings}>
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Management
                </CardTitle>
                <CardDescription>System maintenance and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4" />
                      <h4 className="font-medium">Database</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Last backup: {systemStats.lastBackup}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSystemBackup}>
                      Create Backup
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <h4 className="font-medium">Security</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Storage used: {systemStats.storageUsed}
                    </p>
                    <Button variant="outline" size="sm">
                      Security Audit
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button variant="destructive" size="sm">
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};