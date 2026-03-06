"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Eye, MousePointer, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";

const revenueData = [
  { date: "Jan", revenue: 4200, emails: 12000 },
  { date: "Feb", revenue: 5100, emails: 14500 },
  { date: "Mar", revenue: 4800, emails: 13200 },
  { date: "Apr", revenue: 6200, emails: 16800 },
  { date: "May", revenue: 7100, emails: 19200 },
  { date: "Jun", revenue: 8500, emails: 22400 },
  { date: "Jul", revenue: 9200, emails: 24800 },
  { date: "Aug", revenue: 8800, emails: 23600 },
  { date: "Sep", revenue: 10400, emails: 27800 },
  { date: "Oct", revenue: 11200, emails: 29500 },
  { date: "Nov", revenue: 13800, emails: 34200 },
  { date: "Dec", revenue: 15200, emails: 38000 },
];

const flowPerformance = [
  { name: "Welcome", openRate: 67, clickRate: 12, revenue: 8200 },
  { name: "Abandon Cart", openRate: 45, clickRate: 8, revenue: 12400 },
  { name: "Post-Purchase", openRate: 58, clickRate: 15, revenue: 6100 },
  { name: "Win-Back", openRate: 32, clickRate: 5, revenue: 3200 },
  { name: "Browse Abandon", openRate: 38, clickRate: 7, revenue: 4800 },
];

const metrics = [
  { label: "Total Revenue", value: "$107,400", change: "+24%", up: true, icon: DollarSign },
  { label: "Avg Open Rate", value: "48.2%", change: "+3.1%", up: true, icon: Eye },
  { label: "Avg Click Rate", value: "9.4%", change: "+1.2%", up: true, icon: MousePointer },
  { label: "Active Subscribers", value: "24,500", change: "-2%", up: false, icon: Users },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance overview across all flows and campaigns</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">Last 12 months</Badge>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon size={16} className="text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${m.up ? "text-green-400" : "text-red-400"}`}>
                  {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {m.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Flow performance */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Flow Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={flowPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="openRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Open Rate %" />
              <Bar dataKey="clickRate" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} name="Click Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
