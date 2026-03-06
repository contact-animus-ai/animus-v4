"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Mail, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const stats = [
  { title: "Revenue from Email", value: "$24,580", change: "+18%", icon: DollarSign },
  { title: "Emails Sent", value: "12,450", change: "+22%", icon: Mail },
  { title: "Open Rate", value: "42.3%", change: "+5.2%", icon: TrendingUp },
  { title: "Active Contacts", value: "8,234", change: "+340", icon: Users },
];

const revenueData = [
  { month: "Jan", revenue: 4200 }, { month: "Feb", revenue: 5800 }, { month: "Mar", revenue: 7100 },
  { month: "Apr", revenue: 6400 }, { month: "May", revenue: 8900 }, { month: "Jun", revenue: 11200 },
  { month: "Jul", revenue: 14500 }, { month: "Aug", revenue: 16800 }, { month: "Sep", revenue: 19200 },
  { month: "Oct", revenue: 21000 }, { month: "Nov", revenue: 22400 }, { month: "Dec", revenue: 24580 },
];

const flowData = [
  { name: "Welcome", sent: 3200, revenue: 8400 },
  { name: "Cart", sent: 2100, revenue: 6200 },
  { name: "Post-Purchase", sent: 1800, revenue: 4100 },
  { name: "Win-Back", sent: 1400, revenue: 3200 },
  { name: "Browse", sent: 2800, revenue: 2680 },
];

const recentActivity = [
  { action: "Welcome Series activated", time: "2 hours ago", detail: "3 emails sent to 145 new subscribers" },
  { action: "Abandoned Cart recovered", time: "4 hours ago", detail: "$342 revenue from 3 conversions" },
  { action: "A/B test completed", time: "6 hours ago", detail: "Subject line B won with 48% open rate" },
  { action: "New flow created", time: "1 day ago", detail: "Post-purchase review request flow" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your email marketing performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.title} className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="text-primary" size={18} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-primary mt-1">{s.change} from last month</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue from Email</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168, 76%, 52%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(168, 76%, 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 35%, 10%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 90%)" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(168, 76%, 52%)" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Flow Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 35%, 10%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 90%)" }} />
                <Bar dataKey="revenue" fill="hsl(168, 76%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{a.action}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.detail}</div>
                  <div className="text-xs text-muted-foreground/60 mt-1">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
