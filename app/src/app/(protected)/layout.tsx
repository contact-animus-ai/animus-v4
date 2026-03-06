"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavLink } from "@/components/NavLink";
import { GitBranch, Megaphone, Users, BarChart3, Settings, Bell, Menu, X, Mail, MessageSquare, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/flows", icon: GitBranch, label: "Flows" },
  { href: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/editor", icon: Mail, label: "Campaign Studio" },
  { href: "/segments", icon: Users, label: "Segments" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
            <span className="font-bold text-foreground">Animus AI</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center text-primary-foreground text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full border-r border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
                <span className="font-bold text-foreground">Animus AI</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
                  activeClassName="bg-primary/10 text-primary font-medium"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-foreground" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AuthProvider>
  );
}
