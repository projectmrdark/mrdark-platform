import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Activity, AlertCircle, Calendar, Database, GitBranch, Loader2, Settings, Users, Workflow } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Admin Dashboard
 * 
 * Comprehensive admin interface for:
 * - User management
 * - Session monitoring
 * - Workflow management
 * - Scheduled task management
 * - Real-time analytics
 * - System health monitoring
 * - Security event viewer
 */
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Fetch admin data
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: user?.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: sessions, isLoading: sessionsLoading } = trpc.admin.getSessions.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: workflows, isLoading: workflowsLoading } = trpc.admin.getWorkflows.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: tasks, isLoading: tasksLoading } = trpc.admin.getScheduledTasks.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: health, isLoading: healthLoading } = trpc.admin.getSystemHealth.useQuery(undefined, {
    enabled: user?.role === 'admin',
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage users, monitor system health, and configure platform settings
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers || 0} active in last 24h
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalSessions || 0} total sessions
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalWorkflows || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.runningWorkflows || 0} currently running
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {health?.status === 'healthy' ? '✓' : health?.status === 'degraded' ? '⚠' : '✗'}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {health?.status || 'Unknown'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Activity className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Tasks
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="h-4 w-4 mr-2" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users && users.length > 0 ? (
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-4 text-left font-medium">Name</th>
                              <th className="p-4 text-left font-medium">Email</th>
                              <th className="p-4 text-left font-medium">Role</th>
                              <th className="p-4 text-left font-medium">Last Sign In</th>
                              <th className="p-4 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((u: any) => (
                              <tr key={u.id} className="border-b">
                                <td className="p-4">{u.name || 'N/A'}</td>
                                <td className="p-4">{u.email || 'N/A'}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString() : 'Never'}
                                </td>
                                <td className="p-4">
                                  <Button variant="ghost" size="sm">Edit</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No users found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Monitor active user sessions and conversations</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions && sessions.length > 0 ? (
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-4 text-left font-medium">Session ID</th>
                              <th className="p-4 text-left font-medium">User</th>
                              <th className="p-4 text-left font-medium">Messages</th>
                              <th className="p-4 text-left font-medium">Created</th>
                              <th className="p-4 text-left font-medium">Last Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((s: any) => (
                              <tr key={s.id} className="border-b">
                                <td className="p-4 font-mono text-sm">{String(s.id).substring(0, 8)}...</td>
                                <td className="p-4">{s.userName || 'Anonymous'}</td>
                                <td className="p-4">{s.messageCount || 0}</td>
                                <td className="p-4">{new Date(s.createdAt).toLocaleString()}</td>
                                <td className="p-4">{new Date(s.updatedAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No active sessions</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
                <CardDescription>Monitor and manage workflow executions</CardDescription>
              </CardHeader>
              <CardContent>
                {workflowsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflows && workflows.length > 0 ? (
                      <div className="grid gap-4">
                        {workflows.map((w: any) => (
                          <Card key={w.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{w.name}</CardTitle>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  w.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  w.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                  w.status === 'failed' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {w.status}
                                </span>
                              </div>
                              <CardDescription>{w.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Steps:</span> {w.totalSteps}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Completed:</span> {w.completedSteps}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Created:</span> {new Date(w.createdAt).toLocaleString()}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Updated:</span> {new Date(w.updatedAt).toLocaleString()}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No workflows found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tasks</CardTitle>
                <CardDescription>Manage automated tasks and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks && tasks.length > 0 ? (
                      <div className="grid gap-4">
                        {tasks.map((t: any) => (
                          <Card key={t.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{t.name}</CardTitle>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  t.status === 'active' ? 'bg-green-100 text-green-700' :
                                  t.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <CardDescription>{t.prompt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Type:</span> {t.type}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Schedule:</span> {t.schedule || t.interval}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Last Run:</span> {t.lastRun ? new Date(t.lastRun).toLocaleString() : 'Never'}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Next Run:</span> {t.nextRun ? new Date(t.nextRun).toLocaleString() : 'N/A'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No scheduled tasks</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Status */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <h3 className="font-semibold">Overall Status</h3>
                        <p className="text-sm text-muted-foreground">System health and uptime</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          health?.status === 'healthy' ? 'text-green-600' :
                          health?.status === 'degraded' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {health?.status === 'healthy' ? '✓ Healthy' :
                           health?.status === 'degraded' ? '⚠ Degraded' :
                           '✗ Down'}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {health?.uptime || 0}%
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">CPU Usage</h4>
                        <div className="text-2xl font-bold">{health?.metrics?.cpu || 0}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${health?.metrics?.cpu || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Memory Usage</h4>
                        <div className="text-2xl font-bold">{health?.metrics?.memory || 0}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${health?.metrics?.memory || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Total Requests</h4>
                        <div className="text-2xl font-bold">{health?.metrics?.requests?.toLocaleString() || 0}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {health?.metrics?.errors || 0} errors
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Active Connections</h4>
                        <div className="text-2xl font-bold">{health?.metrics?.connections || 0}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Real-time connections
                        </p>
                      </div>
                    </div>

                    {/* Alerts */}
                    {health?.alerts && health.alerts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Active Alerts</h4>
                        {health.alerts.map((alert: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-900">{alert.message}</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium">User Registration</h4>
                      <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium">Rate Limiting</h4>
                      <p className="text-sm text-muted-foreground">Configure API rate limits</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium">Backup Schedule</h4>
                      <p className="text-sm text-muted-foreground">Configure automated backups</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
