import { useState } from "react";
import { StatusOverview } from "@/components/StatusOverview";
import { EquipmentCard } from "@/components/EquipmentCard";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { EquipmentDetailsModal } from "@/components/EquipmentDetailsModal";
import { NotificationSystem, EmailService } from "@/components/NotificationSystem";
import { MaintenanceScheduler } from "@/components/MaintenanceScheduler";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Download, AlertTriangle, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/types/equipment";

// Enhanced equipment data with demo images
const initialEquipment: Equipment[] = [
  {
    id: "1",
    name: "Excavator CAT 320",
    model: "CAT 320GC",
    serialNumber: "CAT320GC2024001",
    location: "Site A - Zone 1",
    status: "operational" as const,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    hoursOperated: 1250,
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
    category: "Excavator",
    manufacturer: "Caterpillar",
    purchaseDate: "2022-03-15",
    warrantyExpiry: "2025-03-15",
    specifications: {
      "Engine": "CAT C7.1 ACERT",
      "Operating Weight": "20,300 kg",
      "Bucket Capacity": "1.2 m³",
      "Max Digging Depth": "6.6 m"
    }
  },
  {
    id: "2",
    name: "Bulldozer Komatsu D65",
    model: "D65PX-18",
    serialNumber: "KOM65PX2024002",
    location: "Site B - Zone 2",
    status: "maintenance" as const,
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-03-01",
    hoursOperated: 2100,
    image: "https://images.unsplash.com/photo-1572041929851-ce2583a18dd6?w=800&h=600&fit=crop",
    category: "Bulldozer",
    manufacturer: "Komatsu",
    purchaseDate: "2021-08-20",
    warrantyExpiry: "2024-08-20",
    specifications: {
      "Engine": "Komatsu SAA6D114E-3",
      "Operating Weight": "17,400 kg",
      "Blade Capacity": "3.9 m³",
      "Ground Pressure": "0.067 MPa"
    }
  },
  {
    id: "3",
    name: "Crane Liebherr LTM",
    model: "LTM 1060-3.1",
    serialNumber: "LIE1060-2024003",
    location: "Site C - Main",
    status: "critical" as const,
    lastMaintenance: "2023-12-10",
    nextMaintenance: "2024-02-10",
    hoursOperated: 3200,
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop",
    category: "Crane",
    manufacturer: "Liebherr",
    purchaseDate: "2020-05-10",
    warrantyExpiry: "2023-05-10",
    specifications: {
      "Max Lifting Capacity": "60 tons",
      "Boom Length": "48 m",
      "Engine": "Liebherr D936L A7",
      "Drive": "8x6x8"
    }
  },
  {
    id: "4",
    name: "Loader Volvo L90",
    model: "L90H",
    serialNumber: "VOL90H-2024004",
    location: "Site A - Zone 3",
    status: "operational" as const,
    lastMaintenance: "2024-02-20",
    nextMaintenance: "2024-05-20",
    hoursOperated: 980,
    image: "https://images.unsplash.com/photo-1581093458791-9d42e72c4b6d?w=800&h=600&fit=crop",
    category: "Loader",
    manufacturer: "Volvo",
    purchaseDate: "2023-01-12",
    warrantyExpiry: "2026-01-12",
    specifications: {
      "Engine": "Volvo D8J",
      "Operating Weight": "16,200 kg",
      "Bucket Capacity": "4.2 m³",
      "Breakout Force": "175 kN"
    }
  },
  {
    id: "5",
    name: "Dumper Truck CAT 773",
    model: "CAT 773G",
    serialNumber: "CAT773G-2024005",
    location: "Site B - Main",
    status: "offline" as const,
    lastMaintenance: "2024-01-30",
    nextMaintenance: "2024-04-30",
    hoursOperated: 1800,
    image: "https://images.unsplash.com/photo-1605962077165-0dac90fb7e68?w=800&h=600&fit=crop",
    category: "Dump Truck",
    manufacturer: "Caterpillar",
    purchaseDate: "2022-09-05",
    warrantyExpiry: "2025-09-05",
    specifications: {
      "Engine": "CAT C27 ACERT",
      "Payload": "68.1 tons",
      "Body Capacity": "41.5 m³",
      "Gross Vehicle Weight": "129,300 kg"
    }
  },
];

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
            <NotificationSystem 
              equipment={equipment} 
              onSendEmail={handleSendEmail}
            />
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