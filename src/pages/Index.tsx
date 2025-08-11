import { useState } from "react";
import { StatusOverview } from "@/components/StatusOverview";
import { EquipmentCard } from "@/components/EquipmentCard";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Download } from "lucide-react";


// Empty equipment data - cleared demo data
const initialEquipment: any[] = [];

const Index = () => {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddEquipment = (newEquipment: any) => {
    setEquipment([...equipment, newEquipment]);
  };

  const handleEditEquipment = (equipmentItem: any) => {
    setSelectedEquipment(equipmentItem);
    // In a real app, this would open an edit dialog
    console.log("Edit equipment:", equipmentItem);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Heavy Machinery Inventory
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Professional equipment management and maintenance tracking system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Equipment Dashboard</h2>
            <p className="text-muted-foreground">Monitor and manage your heavy machinery fleet</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
      </div>
    </div>
  );
};

export default Index;
