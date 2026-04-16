import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  CreditCard as CreditCardIcon,
  TrendingUp,
  FileText,
  HeartPulse,
  ArrowLeftRight,
  RefreshCw,
  Wallet,
  Layers,
  MoreHorizontal,
  CalendarHeart,
  LineChart,
  X,
  Users,
  BarChart3,
  Upload,
  Trophy,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Primary nav items (shown directly in bottom bar)
const primaryItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Accounts", url: "/bank-accounts", icon: Wallet },
];

// Grouped secondary items (shown in "More" sheet)
const navGroups = [
  {
    label: "Money",
    items: [
      { title: "Savings", url: "/savings", icon: PiggyBank },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Virtual Cards", url: "/virtual-cards", icon: Layers },
      { title: "Split Expenses", url: "/split-expenses", icon: Users },
      { title: "Investments", url: "/investments", icon: BarChart3 },
    ],
  },
  {
    label: "Payments",
    items: [
      { title: "EMI & Loans", url: "/emi", icon: CreditCardIcon },
      { title: "Subscriptions", url: "/subscriptions", icon: RefreshCw },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Price Tracking", url: "/price-tracking", icon: TrendingUp },
      { title: "Finance Health", url: "/finance-health", icon: HeartPulse },
      { title: "Heatmap", url: "/spending-heatmap", icon: CalendarHeart },
      { title: "Cash Flow", url: "/cash-flow", icon: LineChart },
      { title: "Bank Import", url: "/bank-import", icon: Upload },
      { title: "Challenges", url: "/challenges", icon: Trophy },
      { title: "Support", url: "/support", icon: Headphones },
    ],
  },
];

export function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Check if current route is in secondary items
  const isSecondaryRouteActive = navGroups.some(group => 
    group.items.some(item => location.pathname === item.url)
  );

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="glass-panel mx-auto flex max-w-lg items-center justify-around rounded-[2rem] px-2 py-2">
        {primaryItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all duration-300",
                "hover:bg-white/70",
                "active:scale-95",
                isActive
                  ? "bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive && "animate-scale-in"
                  )} 
                />
                <span className="max-w-14 truncate text-[10px] font-bold">
                  {item.title}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* More Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all duration-300",
                "hover:bg-white/70",
                "active:scale-95",
                isSecondaryRouteActive
                  ? "bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-bold">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[78vh] overflow-y-auto rounded-t-[2rem] border-white/60 bg-background/95 px-4 pb-8 backdrop-blur-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-left text-2xl font-black">Explore Trackget</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pb-8">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all duration-200",
                            "hover:bg-white/80",
                            "active:scale-95",
                            isActive
                              ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md"
                              : "bg-white/70 text-foreground shadow-sm dark:bg-white/10"
                          )
                        }
                      >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs font-medium text-center">
                          {item.title}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
