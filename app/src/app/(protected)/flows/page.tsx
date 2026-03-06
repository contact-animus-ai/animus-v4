"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, GitBranch, Eye, DollarSign, Users, TrendingUp } from "lucide-react";

const performanceStats = [
  { label: "Revenue Generated", value: "$8,200", icon: DollarSign, change: "+23%" },
  { label: "Open Rate", value: "67%", icon: Eye, change: "+5%" },
  { label: "Click Rate", value: "12.4%", icon: TrendingUp, change: "+2.1%" },
  { label: "Subscribers in Flow", value: "1,847", icon: Users, change: "+340" },
];

export default function Flows() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Flow builder area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Series Flow</h1>
            <p className="text-sm text-muted-foreground">Automated welcome sequence for new customers</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-green-500/30 text-green-400">Active</Badge>
            <Button size="sm" className="gradient-teal text-primary-foreground">Edit Flow</Button>
          </div>
        </div>

        {/* Visual flow chart */}
        <div className="relative min-h-[480px] glass-card rounded-xl p-8">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connectors */}
            <line x1="50" y1="8" x2="50" y2="30" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />
            <line x1="50" y1="38" x2="50" y2="55" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />
            <line x1="42" y1="62" x2="25" y2="78" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />
            <line x1="58" y1="62" x2="75" y2="78" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Trigger node */}
            <div className="glass-card rounded-lg px-6 py-3 border-primary/30 flex items-center gap-3">
              <GitBranch size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">New Customer Trigger</span>
            </div>

            {/* Arrow */}
            <div className="w-px h-8 bg-primary/30" />

            {/* Welcome email node */}
            <div className="glass-card rounded-lg px-6 py-3 border-primary/30 flex items-center gap-3">
              <Mail size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Welcome Email</span>
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Sent: 1,847</Badge>
            </div>

            {/* Arrow */}
            <div className="w-px h-8 bg-primary/30" />

            {/* Decision diamond */}
            <div className="w-24 h-24 rotate-45 glass-card border-yellow-500/30 flex items-center justify-center">
              <span className="text-xs font-medium text-foreground -rotate-45">Opened?</span>
            </div>

            {/* Branches */}
            <div className="flex gap-16 w-full justify-center mt-4">
              <div className="text-center">
                <div className="text-[10px] text-green-400 mb-2">Yes (67%)</div>
                <div className="glass-card rounded-lg px-5 py-3 border-green-500/20 flex items-center gap-2">
                  <Mail size={14} className="text-green-400" />
                  <span className="text-xs font-medium text-foreground">Follow-up Path</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-yellow-400 mb-2">No (33%)</div>
                <div className="glass-card rounded-lg px-5 py-3 border-yellow-500/20 flex items-center gap-2">
                  <Mail size={14} className="text-yellow-400" />
                  <span className="text-xs font-medium text-foreground">Re-engagement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar -- performance */}
      <div className="w-80 border-l border-border p-5 overflow-auto hidden lg:block">
        <h2 className="text-sm font-semibold text-foreground mb-4">Performance Overview</h2>
        <div className="space-y-3 mb-6">
          {performanceStats.map((stat) => (
            <Card key={stat.label} className="bg-card/50 border-border/50">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                </div>
                <span className="text-[10px] text-primary font-medium">{stat.change}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-foreground mb-3">Email Preview</h2>
        <div className="glass-card rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-2">Welcome Email</div>
          <div className="bg-background rounded-md p-3 text-[10px] space-y-2">
            <div className="text-center">
              <div className="inline-block gradient-teal text-primary-foreground font-bold px-2 py-1 rounded text-[10px]">Lumiere</div>
            </div>
            <div className="text-center font-medium text-foreground">Welcome to Lumiere</div>
            <div className="text-muted-foreground text-center">Thank you for joining our community...</div>
            <div className="bg-secondary/50 rounded p-2 text-muted-foreground">Your personalized routine awaits</div>
            <div className="text-center">
              <span className="inline-block gradient-teal text-primary-foreground px-3 py-1 rounded text-[10px]">Shop Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
