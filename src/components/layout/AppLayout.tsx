import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { BottomNav } from "./BottomNav";
import { Bell, LogOut, Settings, User, WalletCards } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    "/dashboard": "Overview",
    "/expenses": "Expenses",
    "/transactions": "Transactions",
    "/savings": "Savings",
    "/emi": "EMI & Loans",
    "/reports": "Reports",
    "/settings": "Settings",
    "/profile": "Profile",
    "/ai-assistant": "AI Assistant",
    "/subscriptions": "Subscriptions",
    "/bank-accounts": "Accounts",
    "/virtual-cards": "Cards",
    "/finance-health": "Health",
    "/spending-heatmap": "Heatmap",
    "/cash-flow": "Cash Flow",
    "/split-expenses": "Split",
    "/investments": "Investments",
    "/bank-import": "Import",
    "/challenges": "Challenges",
    "/support": "Support",
  };

  const pageTitle = pageTitles[location.pathname] || "Trackget";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <header className="safe-top sticky top-0 z-40 border-b border-white/60 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label="Go to dashboard"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary text-primary-foreground shadow-lg shadow-primary/20">
              <WalletCards className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Trackget
              </span>
              <span className="block truncate text-lg font-black leading-tight text-foreground">
                {pageTitle}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/60 shadow-sm backdrop-blur dark:bg-white/10"
              onClick={() => navigate("/finance-health")}
              aria-label="Open finance health"
            >
              <Bell className="h-4 w-4" />
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full bg-white/60 p-0 shadow-sm transition-transform duration-300 hover:scale-105 dark:bg-white/10"
              >
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {user?.email ? getInitials(user.email) : "US"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || "My Account"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="relative">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
