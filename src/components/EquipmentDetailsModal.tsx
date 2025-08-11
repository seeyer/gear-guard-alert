import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, MapPin, Wrench, AlertTriangle, FileText, Clock, QrCode, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LegacyEquipment, EquipmentDetailsModalProps } from "@/types/equipment";

const statusConfig = {
  operational: { label: 'Operational', className: 'bg-status-operational text-primary-foreground' },
  maintenance: { label: 'Maintenance Due', className: 'bg-status-maintenance text-primary-foreground' },
  critical: { label: 'Critical', className: 'bg-status-critical text-primary-foreground' },
  offline: { label: 'Offline', className: 'bg-status-offline text-primary-foreground' }
};

export const EquipmentDetailsModal = ({ 
  equipment, 
  isOpen, 
  onClose, 
  onUpdate,
  onSendAlert 
}: EquipmentDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState<LegacyEquipment | null>(null);
  const [workOrderNote, setWorkOrderNote] = useState("");
  const { toast } = useToast();

  if (!equipment) return null;

  const handleEdit = () => {
    setEditedEquipment({ ...equipment });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedEquipment) {
      onUpdate(editedEquipment);
      setIsEditing(false);
      toast({
        title: "Equipment Updated",
        description: `${editedEquipment.name} has been updated successfully.`,
      });
    }
  };

  const handleCreateWorkOrder = () => {
    if (workOrderNote.trim()) {
      onSendAlert(equipment, `Work Order: ${workOrderNote}`);
      setWorkOrderNote("");
      toast({
        title: "Work Order Created",
        description: "Maintenance alert sent to admin and technicians.",
      });
    }
  };

  const generateQRCode = () => {
    const qrData = `Equipment: ${equipment.name}\nSerial: ${equipment.serialNumber}\nLocation: ${equipment.location}`;
    toast({
      title: "QR Code Generated",
      description: "QR code for equipment identification created.",
    });
  };

  const currentEquipment = isEditing ? editedEquipment! : equipment;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {currentEquipment.name}
            </DialogTitle>
            <Badge className={statusConfig[currentEquipment.status].className}>
              {statusConfig[currentEquipment.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={editedEquipment?.name || ""}
                          onChange={(e) => setEditedEquipment(prev => prev ? {...prev, name: e.target.value} : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Model</label>
                        <Input
                          value={editedEquipment?.model || ""}
                          onChange={(e) => setEditedEquipment(prev => prev ? {...prev, model: e.target.value} : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={editedEquipment?.location || ""}
                          onChange={(e) => setEditedEquipment(prev => prev ? {...prev, location: e.target.value} : null)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{currentEquipment.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serial Number:</span>
                        <span className="font-medium">{currentEquipment.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{currentEquipment.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours Operated:</span>
                        <span className="font-medium">{currentEquipment.hoursOperated}h</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Equipment Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentEquipment.image ? (
                    <div className="space-y-3">
                      <img
                        src={currentEquipment.image}
                        alt={currentEquipment.name}
                        className="w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                      <div className="text-sm text-muted-foreground">
                        Equipment Photo - {currentEquipment.name}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEdit}>Edit Details</Button>
                  <Button variant="outline" onClick={generateQRCode}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Maintenance:</span>
                    <span className="font-medium">{currentEquipment.lastMaintenance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Maintenance:</span>
                    <span className="font-medium">{currentEquipment.nextMaintenance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={statusConfig[currentEquipment.status].className}>
                      {statusConfig[currentEquipment.status].label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Create Work Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe the maintenance work needed..."
                    value={workOrderNote}
                    onChange={(e) => setWorkOrderNote(e.target.value)}
                  />
                  <Button onClick={handleCreateWorkOrder} className="w-full">
                    Create Work Order & Send Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Owner's Manual</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Maintenance Manual</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Warranty Certificate</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Safety Guidelines</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-3 h-3 bg-status-operational rounded-full" />
                    <div className="flex-1">
                      <div className="font-medium">Routine Maintenance Completed</div>
                      <div className="text-sm text-muted-foreground">Oil change, filter replacement - Jan 15, 2024</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-3 h-3 bg-status-maintenance rounded-full" />
                    <div className="flex-1">
                      <div className="font-medium">Hydraulic System Check</div>
                      <div className="text-sm text-muted-foreground">Pressure testing, seal inspection - Dec 20, 2023</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-3 h-3 bg-status-critical rounded-full" />
                    <div className="flex-1">
                      <div className="font-medium">Engine Overhaul</div>
                      <div className="text-sm text-muted-foreground">Complete engine rebuild - Nov 10, 2023</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};