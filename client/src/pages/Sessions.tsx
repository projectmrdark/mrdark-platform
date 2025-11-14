import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Sessions() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: sessions = [], isLoading } = trpc.agent.getSessions.useQuery(
    undefined,
    { enabled: !!user }
  );

  const utils = trpc.useUtils();

  const deleteSessionMutation = trpc.agent.deleteSession.useMutation({
    onSuccess: () => {
      utils.agent.getSessions.invalidate();
    },
  });

  const createSessionMutation = trpc.agent.createSession.useMutation({
    onSuccess: (data) => {
      setLocation(`/chat/${data.sessionId}`);
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="mb-4">Please sign in to view your sessions.</p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                createSessionMutation.mutate({
                  model: "gpt-4",
                  mode: "sandbox",
                })
              }
            >
              <Plus className="h-5 w-5 mr-2" />
              New Session
            </Button>
            <Button variant="outline" onClick={() => setLocation("/settings")}>
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No sessions yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first session to start chatting with Mr.Dark AI
            </p>
            <Button
              onClick={() =>
                createSessionMutation.mutate({
                  model: "gpt-4",
                  mode: "sandbox",
                })
              }
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/chat/${session.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {session.title || `Session #${session.id}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSessionMutation.mutate({ sessionId: session.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    {session.model}
                  </span>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded">
                    {session.mode}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      session.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
