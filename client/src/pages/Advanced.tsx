import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Workflow, Brain, Play, Trash2, Plus } from "lucide-react";

export default function Advanced() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("scheduling");

  // Scheduling state
  const [scheduleName, setScheduleName] = useState("");
  const [schedulePrompt, setSchedulePrompt] = useState("");
  const [scheduleExpression, setScheduleExpression] = useState("");
  const [scheduleType, setScheduleType] = useState<"cron" | "interval">("cron");

  // Workflow state
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  // Memory search
  const [memoryKeyword, setMemoryKeyword] = useState("");

  // Queries
  const scheduledTasksQuery = trpc.advanced.scheduling.list.useQuery();
  const workflowsQuery = trpc.advanced.workflows.list.useQuery();
  const memoriesQuery = trpc.advanced.memory.getByUser.useQuery({});
  const preferencesQuery = trpc.advanced.memory.getPreferences.useQuery();

  // Mutations
  const createScheduleMutation = trpc.advanced.scheduling.create.useMutation({
    onSuccess: () => {
      toast.success("Scheduled task created successfully");
      scheduledTasksQuery.refetch();
      setScheduleName("");
      setSchedulePrompt("");
      setScheduleExpression("");
    },
    onError: (error) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    },
  });

  const deleteScheduleMutation = trpc.advanced.scheduling.delete.useMutation({
    onSuccess: () => {
      toast.success("Scheduled task deleted");
      scheduledTasksQuery.refetch();
    },
  });

  const deleteMemoryMutation = trpc.advanced.memory.delete.useMutation({
    onSuccess: () => {
      toast.success("Memory deleted");
      memoriesQuery.refetch();
    },
  });

  const handleCreateSchedule = () => {
    if (!scheduleName || !schedulePrompt || !scheduleExpression) {
      toast.error("Please fill in all fields");
      return;
    }

    createScheduleMutation.mutate({
      name: scheduleName,
      prompt: schedulePrompt,
      schedule: scheduleExpression,
      type: scheduleType,
      enabled: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access advanced features</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Advanced Features</h1>
          <p className="text-muted-foreground">
            Manage scheduling, workflows, and memory for your AI agent
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scheduling">
              <Clock className="w-4 h-4 mr-2" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="memory">
              <Brain className="w-4 h-4 mr-2" />
              Memory
            </TabsTrigger>
          </TabsList>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Scheduled Task</CardTitle>
                <CardDescription>
                  Schedule AI agent tasks to run automatically at specific times or intervals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="schedule-name">Task Name</Label>
                  <Input
                    id="schedule-name"
                    placeholder="Daily report generation"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select value={scheduleType} onValueChange={(v: "cron" | "interval") => setScheduleType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cron">Cron Expression</SelectItem>
                      <SelectItem value="interval">Interval (seconds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schedule-expression">
                    {scheduleType === "cron" ? "Cron Expression" : "Interval (seconds)"}
                  </Label>
                  <Input
                    id="schedule-expression"
                    placeholder={scheduleType === "cron" ? "0 0 9 * * *" : "3600"}
                    value={scheduleExpression}
                    onChange={(e) => setScheduleExpression(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {scheduleType === "cron" 
                      ? "Example: 0 0 9 * * * (Every day at 9 AM)"
                      : "Example: 3600 (Every hour)"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="schedule-prompt">Task Prompt</Label>
                  <Textarea
                    id="schedule-prompt"
                    placeholder="Generate a daily summary report of all activities"
                    value={schedulePrompt}
                    onChange={(e) => setSchedulePrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleCreateSchedule} disabled={createScheduleMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tasks</CardTitle>
                <CardDescription>View and manage your scheduled tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledTasksQuery.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : scheduledTasksQuery.data && scheduledTasksQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledTasksQuery.data.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.prompt}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {task.type === "cron" ? "Cron" : "Interval"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{task.schedule}</span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteScheduleMutation.mutate({ taskId: task.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No scheduled tasks yet. Create one above to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflows</CardTitle>
                <CardDescription>
                  Create and manage multi-step workflows with dependencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Workflow creation UI coming soon. Use the API to create workflows programmatically.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>Your saved preferences and settings</CardDescription>
              </CardHeader>
              <CardContent>
                {preferencesQuery.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : preferencesQuery.data && Object.keys(preferencesQuery.data).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(preferencesQuery.data).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No preferences saved yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Entries</CardTitle>
                <CardDescription>Facts, context, and information the AI remembers</CardDescription>
              </CardHeader>
              <CardContent>
                {memoriesQuery.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : memoriesQuery.data && memoriesQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {memoriesQuery.data.map((memory: any) => (
                      <div
                        key={memory.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{memory.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Importance: {memory.importance}/10
                            </span>
                          </div>
                          <h3 className="font-semibold">{memory.key}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMemoryMutation.mutate({ id: memory.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No memories stored yet. The AI will remember important information from your conversations.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
