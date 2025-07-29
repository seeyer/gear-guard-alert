import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddEquipmentDialogProps {
  onAdd: (equipment: any) => void;
}

export const AddEquipmentDialog = ({ onAdd }: AddEquipmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serialNumber: "",
    location: "",
    status: "operational" as const,
    hoursOperated: 0,
    category: "",
    manufacturer: "",
    image: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.model || !formData.serialNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newEquipment = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-04-15",
    };

    onAdd(newEquipment);
    setFormData({
      name: "",
      model: "",
      serialNumber: "",
      location: "",
      status: "operational",
      hoursOperated: 0,
    });
    setOpen(false);
    
    toast({
      title: "Equipment Added",
      description: `${formData.name} has been successfully added to inventory`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Equipment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the details for the new heavy machinery equipment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Excavator CAT 320"
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model" className="text-foreground">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., CAT 320GC"
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial" className="text-foreground">Serial Number *</Label>
              <Input
                id="serial"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="e.g., CAT320GC2024001"
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-foreground">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Site A - Zone 1"
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance Due</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours" className="text-foreground">Hours Operated</Label>
              <Input
                id="hours"
                type="number"
                value={formData.hoursOperated}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursOperated: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Equipment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};