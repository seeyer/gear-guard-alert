import { useState } from "react";
import { StatusOverview } from "@/components/StatusOverview";
import { EquipmentCard } from "@/components/EquipmentCard";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { EquipmentDetailsModal } from "@/components/EquipmentDetailsModal";
import { EmailAlertSystem } from "@/components/EmailAlertSystem";
import { NotificationSystem, EmailService } from "@/components/NotificationSystem";
import { MaintenanceScheduler } from "@/components/MaintenanceScheduler";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Download, AlertTriangle, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/types/equipment";

// Empty equipment data - cleared demo data
const initialEquipment: Equipment[] = [];

export const UserDashboard = () => {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddEquipment = (newEquipment: any) => {
    const equipmentWithId = {
      ...newEquipment,
      id: Date.now().toString(),
    };
    setEquipment([...equipment, equipmentWithId]);
    toast({
      title: "Equipment Added",
      description: `${newEquipment.name} has been added to the inventory.`,
    });
  };

  const handleEditEquipment = (equipmentItem: any) => {
    setSelectedEquipment(equipmentItem);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateEquipment = (updatedEquipment: any) => {
    setEquipment(prev => 
      prev.map(item => 
        item.id === updatedEquipment.id ? updatedEquipment : item
      )
    );
  };

  const handleSendAlert = async (equipment: any, message: string) => {
    try {
      await EmailService.sendMaintenanceAlert(equipment, message);
      toast({
        title: "Alert Sent",
        description: `Maintenance alert sent for ${equipment.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send alert",
        variant: "destructive"
      });
    }
  };

  const handleScheduleTask = (task: any) => {
    toast({
      title: "Task Scheduled",
      description: `Maintenance task scheduled for ${task.equipmentName}`,
    });
  };

  const handleSendEmail = (notification: any) => {
    console.log("Email notification sent:", notification);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(equipment, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equipment-inventory.json';
    link.click();
    
    toast({
      title: "Export Complete",
      description: "Equipment data has been exported successfully.",
    });
  };

  const criticalEquipment = equipment.filter(item => item.status === 'critical').length;
  const maintenanceEquipment = equipment.filter(item => item.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Equipment Dashboard</h2>
            <p className="text-muted-foreground">Monitor and manage your heavy machinery fleet</p>
            {(criticalEquipment > 0 || maintenanceEquipment > 0) && (
              <div className="flex gap-2 mt-2">
                {criticalEquipment > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {criticalEquipment} Critical
                  </Badge>
                )}
                {maintenanceEquipment > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {maintenanceEquipment} Maintenance Due
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <AddEquipmentDialog onAdd={handleAddEquipment} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">
              <Calendar className="w-4 h-4 mr-1" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatusOverview equipment={equipment} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SearchAndFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                  {filteredEquipment.slice(0, 6).map((item) => (
                    <EquipmentCard
                      key={item.id}
                      equipment={item}
                      onEdit={handleEditEquipment}
                    />
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <NotificationSystem 
                  equipment={equipment} 
                  onSendEmail={handleSendEmail}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onEdit={handleEditEquipment}
                />
              ))}
            </div>

            {filteredEquipment.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No equipment found matching your criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceScheduler 
              equipment={equipment}
              onScheduleTask={handleScheduleTask}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <EmailAlertSystem equipment={equipment} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsReports equipment={equipment} />
          </TabsContent>
        </Tabs>

        {/* Equipment Details Modal */}
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedEquipment(null);
          }}
          onUpdate={handleUpdateEquipment}
          onSendAlert={handleSendAlert}
        />
      </div>
    </div>
  );
};