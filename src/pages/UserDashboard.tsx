import { useState } from "react";
import { StatusOverview } from "@/components/StatusOverview";
import { EquipmentCard } from "@/components/EquipmentCard";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { Bell, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Enhanced equipment data with more realistic information
const initialEquipment = [
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
  },
];

export const UserDashboard = () => {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    toast({
      title: "Equipment Details",
      description: `Viewing details for ${equipmentItem.name}`,
    });
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
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header Actions */}
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast({ title: "Alerts", description: "No new alerts at this time." })}
            >
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <AddEquipmentDialog onAdd={handleAddEquipment} />
          </div>
        </div>

        {/* Status Overview */}
        <StatusOverview equipment={equipment} />

        {/* Search and Filter */}
        <div className="mt-8">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
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
      </div>
    </div>
  );
};