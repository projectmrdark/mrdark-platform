import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Key, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function Settings() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [newApiKey, setNewApiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "anthropic" | "google">("openai");

  if (authLoading) {
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
          <p className="mb-4">Please sign in to access settings.</p>
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation("/chat")}>
              Back to Chat
            </Button>
            <Button variant="outline" onClick={() => setLocation("/sessions")}>
              Sessions
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={user.name || ""} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ""} disabled />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={user.role} disabled />
                </div>
                <div>
                  <Label>Member Since</Label>
                  <Input
                    value={new Date(user.createdAt).toLocaleDateString()}
                    disabled
                  />
                </div>
                <Button variant="destructive" onClick={() => logout()}>
                  Sign Out
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Add your own API keys to use different AI models. Your keys are
                encrypted and stored securely.
              </p>

              <div className="space-y-4">
                <div>
                  <Label>Provider</Label>
                  <select
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                    value={selectedProvider}
                    onChange={(e) =>
                      setSelectedProvider(e.target.value as any)
                    }
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                  </select>
                </div>

                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <Button
                      onClick={() => {
                        // TODO: Implement API key saving
                        setNewApiKey("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Saved API Keys</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No API keys saved yet.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>

              <div className="space-y-6">
                <div>
                  <Label>Default Model</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md">
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <div>
                  <Label>Execution Mode</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md">
                    <option value="sandbox">Sandbox (Secure)</option>
                    <option value="local">Local (Faster)</option>
                  </select>
                </div>

                <div>
                  <Label>Language</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md">
                    <option value="en">English</option>
                    <option value="th">ไทย (Thai)</option>
                  </select>
                </div>

                <Button>Save Preferences</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
