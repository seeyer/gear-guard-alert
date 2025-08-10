import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  Mail,
  Wrench,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for admin dashboard
const adminStats = {
  assignedEquipment: 45,
  pendingMaintenance: 12,
  activeAlerts: 3,
  completedTasks: 127,
  teamMembers: 8,
  monthlyReports: 4,
};

const adminAlerts = [
  {
    id: 1,
    equipment: "Excavator CAT 320",
    type: "Maintenance Due",
    severity: "medium",
    timestamp: "2024-01-29 14:30",
  },
  {
    id: 2,
    equipment: "Crane Liebherr LTM",
    type: "Inspection Required",
    severity: "high",
    timestamp: "2024-01-29 12:15",
  },
  {
    id: 3,
    equipment: "Dumper Truck CAT 773",
    type: "Service Reminder",
    severity: "low",
    timestamp: "2024-01-29 10:45",
  },
];

const teamMembers = [
  { id: 1, name: "Mike Johnson", email: "mike@company.com", role: "Technician", status: "Active" },
  { id: 2, name: "Sarah Wilson", email: "sarah@company.com", role: "Operator", status: "Active" },
  { id: 3, name: "David Brown", email: "david@company.com", role: "Supervisor", status: "On Leave" },
];

export const AdminDashboard = () => {
  const [emailSettings, setEmailSettings] = useState({
    notifyOnMaintenance: true,
    notifyOnAlerts: true,
    dailyReports: false,
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleAssignTask = () => {
    toast({
      title: "Task Assigned",
      description: "Maintenance task has been assigned to the team member.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Equipment and team management</p>
        </div>

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Equipment</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.assignedEquipment}</div>
              <p className="text-xs text-muted-foreground">Under your management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.pendingMaintenance}</div>
              <p className="text-xs text-muted-foreground">Tasks to complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">In your department</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Equipment Alerts</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Equipment Alerts
                </CardTitle>
                <CardDescription>Monitor and manage equipment maintenance alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.equipment}</h4>
                          <Badge 
                            variant={
                              alert.severity === 'high' ? 'default' : 
                              alert.severity === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAssignTask}>
                        Assign Task
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Manage your team members and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">Status: {member.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Assign Task
                        </Button>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
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
                  <Mail className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notify-maintenance"
                      checked={emailSettings.notifyOnMaintenance}
                      onChange={(e) => setEmailSettings({...emailSettings, notifyOnMaintenance: e.target.checked})}
                    />
                    <Label htmlFor="notify-maintenance">Notify on maintenance due</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notify-alerts"
                      checked={emailSettings.notifyOnAlerts}
                      onChange={(e) => setEmailSettings({...emailSettings, notifyOnAlerts: e.target.checked})}
                    />
                    <Label htmlFor="notify-alerts">Notify on equipment alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="daily-reports"
                      checked={emailSettings.dailyReports}
                      onChange={(e) => setEmailSettings({...emailSettings, dailyReports: e.target.checked})}
                    />
                    <Label htmlFor="daily-reports">Receive daily reports</Label>
                  </div>
                </div>
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};