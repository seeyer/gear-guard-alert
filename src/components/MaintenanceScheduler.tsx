import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Plus, Wrench, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Equipment, MaintenanceTask, MaintenanceSchedulerProps } from "@/types/equipment";

export const MaintenanceScheduler = ({ equipment, onScheduleTask }: MaintenanceSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    equipmentId: "",
    type: "routine" as const,
    title: "",
    description: "",
    scheduledDate: new Date(),
    estimatedHours: 2,
    assignedTo: "",
    priority: "medium" as const,
    parts: "",
    cost: 0
  });
  const { toast } = useToast();

  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  const statusColors = {
    scheduled: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    overdue: 'bg-red-500'
  };

  const handleCreateTask = () => {
    if (!newTask.equipmentId || !newTask.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const selectedEquipment = equipment.find(eq => eq.id === newTask.equipmentId);
    const task: MaintenanceTask = {
      id: Date.now().toString(),
      equipmentName: selectedEquipment?.name || "",
      status: 'scheduled',
      ...newTask,
      parts: newTask.parts ? newTask.parts.split(',').map(p => p.trim()) : []
    };

    setTasks(prev => [...prev, task]);
    onScheduleTask(task);
    
    // Reset form
    setNewTask({
      equipmentId: "",
      type: "routine",
      title: "",
      description: "",
      scheduledDate: new Date(),
      estimatedHours: 2,
      assignedTo: "",
      priority: "medium",
      parts: "",
      cost: 0
    });
    setShowNewTaskForm(false);

    toast({
      title: "Task Scheduled",
      description: `Maintenance task for ${selectedEquipment?.name} has been scheduled.`,
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.scheduledDate.toDateString() === date.toDateString()
    );
  };

  const upcomingTasks = tasks
    .filter(task => task.status === 'scheduled' && task.scheduledDate >= new Date())
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
    .slice(0, 5);

  const overdueTasks = tasks.filter(task => 
    task.status === 'scheduled' && task.scheduledDate < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Tasks</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'scheduled').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Maintenance Calendar
              </CardTitle>
              <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => {
                  const tasksForDay = getTasksForDate(date);
                  return (
                    <div className="relative w-full h-full">
                      <span>{date.getDate()}</span>
                      {tasksForDay.length > 0 && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No maintenance tasks scheduled for this date
              </p>
            ) : (
              getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge className={statusColors[task.status]}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.equipmentName}</p>
                  <p className="text-sm">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Est. {task.estimatedHours}h</span>
                    {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
                    {task.cost && <span>Cost: ${task.cost}</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Maintenance Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment *</label>
                <Select 
                  value={newTask.equipmentId} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, equipmentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} - {eq.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select 
                  value={newTask.type} 
                  onValueChange={(value: any) => setNewTask(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Maintenance</SelectItem>
                    <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                    <SelectItem value="emergency">Emergency Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title *</label>
              <Input
                placeholder="e.g., Oil change and filter replacement"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Detailed description of the maintenance task..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {format(newTask.scheduledDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.scheduledDate}
                      onSelect={(date) => date && setNewTask(prev => ({ ...prev, scheduledDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  placeholder="Technician name"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Cost ($)</label>
                <Input
                  type="number"
                  value={newTask.cost}
                  onChange={(e) => setNewTask(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Required Parts (comma separated)</label>
              <Input
                placeholder="Oil filter, Engine oil, Air filter"
                value={newTask.parts}
                onChange={(e) => setNewTask(prev => ({ ...prev, parts: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateTask}>Schedule Task</Button>
              <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.equipmentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(task.scheduledDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};