import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Code, 
  Globe, 
  FileText, 
  Search,
  Image as ImageIcon,
  Database
} from "lucide-react";

interface ToolExecution {
  id: number;
  toolName: string;
  parameters: any;
  result: any;
  success: boolean;
  error?: string;
  executionTime?: number;
  createdAt: Date;
}

interface ToolExecutionPanelProps {
  executions: ToolExecution[];
}

const getToolIcon = (toolName: string) => {
  if (toolName.startsWith("browser_")) return Globe;
  if (toolName.startsWith("execute_")) return Code;
  if (toolName.startsWith("file_")) return FileText;
  if (toolName.startsWith("web_search") || toolName.includes("search")) return Search;
  if (toolName.includes("image")) return ImageIcon;
  if (toolName.includes("data")) return Database;
  return Code;
};

const getToolCategory = (toolName: string): string => {
  if (toolName.startsWith("browser_")) return "Browser";
  if (toolName.startsWith("execute_")) return "Code";
  if (toolName.startsWith("file_")) return "File";
  if (toolName.includes("search")) return "Search";
  if (toolName.includes("image")) return "AI";
  if (toolName.includes("data")) return "Data";
  return "System";
};

export function ToolExecutionPanel({ executions }: ToolExecutionPanelProps) {
  if (executions.length === 0) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No tool executions yet</p>
          <p className="text-sm">Tool calls will appear here as the agent works</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Tool Executions</h3>
        <p className="text-sm text-muted-foreground">
          {executions.length} tool{executions.length !== 1 ? "s" : ""} executed
        </p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {executions.map((execution) => {
            const Icon = getToolIcon(execution.toolName);
            const category = getToolCategory(execution.toolName);

            return (
              <Card
                key={execution.id}
                className={`p-4 ${
                  execution.success
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold">
                        {execution.toolName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                      {execution.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    {execution.parameters && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Parameters:
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(execution.parameters, null, 2)}
                        </pre>
                      </div>
                    )}

                    {execution.success && execution.result && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Result:
                        </p>
                        <div className="text-xs bg-muted p-2 rounded">
                          {typeof execution.result === "string"
                            ? execution.result
                            : JSON.stringify(execution.result, null, 2)}
                        </div>
                      </div>
                    )}

                    {!execution.success && execution.error && (
                      <div className="mb-2">
                        <p className="text-xs text-red-500 mb-1">Error:</p>
                        <div className="text-xs bg-red-500/10 text-red-500 p-2 rounded">
                          {execution.error}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {execution.executionTime && (
                        <span>{execution.executionTime}ms</span>
                      )}
                      <span>
                        {new Date(execution.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
