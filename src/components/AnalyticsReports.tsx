import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Wrench, 
  Download,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";

interface AnalyticsReportsProps {
  equipment: any[];
}

export const AnalyticsReports = ({ equipment }: AnalyticsReportsProps) => {
  // Sample data - in real app this would come from backend
  const maintenanceCostData = [
    { month: 'Jan', cost: 12000, preventive: 8000, emergency: 4000 },
    { month: 'Feb', cost: 15000, preventive: 10000, emergency: 5000 },
    { month: 'Mar', cost: 9000, preventive: 7000, emergency: 2000 },
    { month: 'Apr', cost: 18000, preventive: 12000, emergency: 6000 },
    { month: 'May', cost: 14000, preventive: 9000, emergency: 5000 },
    { month: 'Jun', cost: 16000, preventive: 11000, emergency: 5000 },
  ];

  const equipmentUtilizationData = [
    { name: 'Excavators', utilization: 85, target: 90 },
    { name: 'Bulldozers', utilization: 72, target: 80 },
    { name: 'Cranes', utilization: 78, target: 85 },
    { name: 'Loaders', utilization: 92, target: 90 },
    { name: 'Dump Trucks', utilization: 88, target: 85 },
  ];

  const statusDistribution = [
    { name: 'Operational', value: equipment.filter(e => e.status === 'operational').length, color: '#22c55e' },
    { name: 'Maintenance', value: equipment.filter(e => e.status === 'maintenance').length, color: '#f59e0b' },
    { name: 'Critical', value: equipment.filter(e => e.status === 'critical').length, color: '#ef4444' },
    { name: 'Offline', value: equipment.filter(e => e.status === 'offline').length, color: '#6b7280' },
  ];

  const downtimeData = [
    { month: 'Jan', hours: 120, cost: 15000 },
    { month: 'Feb', hours: 95, cost: 12000 },
    { month: 'Mar', hours: 150, cost: 18000 },
    { month: 'Apr', hours: 80, cost: 10000 },
    { month: 'May', hours: 110, cost: 14000 },
    { month: 'Jun', hours: 75, cost: 9500 },
  ];

  const exportReport = (type: string) => {
    // Simulate report generation
    const data = {
      equipment_summary: equipment.length,
      operational: equipment.filter(e => e.status === 'operational').length,
      maintenance_due: equipment.filter(e => e.status === 'maintenance').length,
      critical: equipment.filter(e => e.status === 'critical').length,
      total_hours: equipment.reduce((sum, e) => sum + e.hoursOperated, 0),
      generated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-report-${type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const kpiData = [
    {
      title: "Total Equipment Value",
      value: "$2.4M",
      change: "+12%",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Average Utilization",
      value: "83%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Maintenance Cost/Month",
      value: "$14.2K",
      change: "-8%",
      trend: "down",
      icon: Wrench
    },
    {
      title: "Average Downtime",
      value: "105h",
      change: "-15%",
      trend: "down",
      icon: Clock
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <kpi.icon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analytics Reports</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport('summary')}>
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('detailed')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Detailed Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{equipment.length}</p>
                    <p className="text-sm text-muted-foreground">Total Equipment</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {equipment.reduce((sum, e) => sum + e.hoursOperated, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {statusDistribution.map((status) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm">{status.name}</span>
                      </div>
                      <Badge variant="secondary">{status.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={maintenanceCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="preventive" 
                      stackId="1" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      name="Preventive"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emergency" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      name="Emergency"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Downtime Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={downtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="hours" fill="#f59e0b" name="Downtime Hours" />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#ef4444" 
                      name="Cost Impact ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Utilization vs Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentUtilizationData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.utilization}%</span>
                        {item.utilization >= item.target ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={item.utilization} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {item.utilization}%</span>
                        <span>Target: {item.target}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="preventive" fill="#22c55e" name="Preventive Maintenance" />
                  <Bar dataKey="emergency" fill="#ef4444" name="Emergency Repairs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};