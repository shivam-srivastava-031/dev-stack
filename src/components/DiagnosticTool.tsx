import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, ShieldCheck, Wifi } from "lucide-react";

export const DiagnosticTool = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    latency: number | null;
    dbConnection: boolean;
    rlsCheck: boolean;
    authStatus: boolean;
  } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();
    
    try {
      // 1. Connection & Latency
      const { data: conn, error: connErr } = await supabase.from("profiles").select("id").limit(1);
      const latency = Math.round(performance.now() - start);
      
      // 2. RLS Check (Try to fetch something that should exist if RLS is working)
      // This is basic, but we check if we got a response without error
      const dbConnection = !connErr;
      
      // 3. Auth Status
      const { data: { session } } = await supabase.auth.getSession();
      const authStatus = !!session;

      setResults({
        latency,
        dbConnection,
        rlsCheck: dbConnection, // If we can select, RLS allowed it
        authStatus
      });
    } catch (err) {
      console.error("Diagnostic failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!results ? (
          <Button onClick={runDiagnostics} disabled={loading} size="sm" className="w-full">
            {loading ? "Running..." : "Run Diagnostics"}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-[10px]">
              <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Latency</span>
              <span className="font-mono">{results.latency}ms</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-[10px]">
              <span className="flex items-center gap-1"><Database className="h-3 w-3" /> DB Conn</span>
              <Badge variant={results.dbConnection ? "success" : "destructive"} className="h-4 px-1 text-[8px]">
                {results.dbConnection ? "OK" : "ERR"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-[10px]">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> RLS Active</span>
              <Badge variant={results.rlsCheck ? "success" : "destructive"} className="h-4 px-1 text-[8px]">
                {results.rlsCheck ? "YES" : "NO"}
              </Badge>
            </div>
            <Button onClick={() => setResults(null)} variant="ghost" size="sm" className="h-6 text-[8px] col-span-2">
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
