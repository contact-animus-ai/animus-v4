"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const subscribers = [
  { name: "Sarah Chen", email: "sarah@example.com", segment: "VIP", orders: 12, ltv: "$1,840", lastOrder: "2 days ago" },
  { name: "Mike Johnson", email: "mike@example.com", segment: "Repeat Buyer", orders: 5, ltv: "$620", lastOrder: "1 week ago" },
  { name: "Emily Davis", email: "emily@example.com", segment: "New", orders: 1, ltv: "$45", lastOrder: "3 days ago" },
  { name: "Alex Kim", email: "alex@example.com", segment: "At-Risk", orders: 3, ltv: "$380", lastOrder: "68 days ago" },
  { name: "Jordan Lee", email: "jordan@example.com", segment: "Win-Back", orders: 2, ltv: "$210", lastOrder: "90 days ago" },
  { name: "Taylor Swift", email: "taylor@example.com", segment: "VIP", orders: 18, ltv: "$3,200", lastOrder: "1 day ago" },
  { name: "Casey Brown", email: "casey@example.com", segment: "New", orders: 0, ltv: "$0", lastOrder: "Never" },
  { name: "Riley Park", email: "riley@example.com", segment: "Repeat Buyer", orders: 4, ltv: "$490", lastOrder: "5 days ago" },
];

const segmentColors: Record<string, string> = {
  VIP: "border-purple-500/30 text-purple-400",
  "Repeat Buyer": "border-green-500/30 text-green-400",
  New: "border-blue-500/30 text-blue-400",
  "At-Risk": "border-red-500/30 text-red-400",
  "Win-Back": "border-yellow-500/30 text-yellow-400",
};

export default function Segments() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Segments</h1>
          <p className="text-sm text-muted-foreground">Browse and manage subscriber profiles</p>
        </div>
        <Button size="sm" className="gradient-teal text-primary-foreground"><Plus size={14} className="mr-1" /> Create Segment</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search subscribers..." className="pl-9 bg-secondary/30 border-border/50" />
        </div>
        <Button variant="outline" size="sm"><Filter size={14} className="mr-1" /> Filter</Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Segment</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Orders</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">LTV</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.email} className="border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {sub.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{sub.name}</div>
                          <div className="text-xs text-muted-foreground">{sub.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={segmentColors[sub.segment] || ""}>{sub.segment}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{sub.orders}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{sub.ltv}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sub.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing 8 of 24,500 subscribers</span>
        <div className="flex items-center gap-2">
          <Users size={12} /> Total: 24,500 profiles
        </div>
      </div>
    </div>
  );
}
