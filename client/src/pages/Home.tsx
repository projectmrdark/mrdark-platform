import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Mr.Dark AI Agent
        </h1>
        <p className="text-xl text-muted-foreground">
          The most comprehensive AI agent platform combining the power of GPT, Claude, Cursor, and Manus
        </p>
        <div className="flex gap-4 justify-center mt-8">
          {user ? (
            <>
              <Button size="lg" asChild>
                <a href="/chat">Start Chatting</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/sessions">View Sessions</a>
              </Button>
            </>
          ) : (
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Sign In to Get Started</a>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-sm">
          <div className="p-4 border rounded-lg">
            <div className="font-semibold mb-2">152+ Tools</div>
            <div className="text-muted-foreground">Comprehensive toolset</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-semibold mb-2">Multi-Model</div>
            <div className="text-muted-foreground">GPT, Claude, Gemini</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-semibold mb-2">Sandbox</div>
            <div className="text-muted-foreground">Secure execution</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-semibold mb-2">Thai/English</div>
            <div className="text-muted-foreground">Full bilingual support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
