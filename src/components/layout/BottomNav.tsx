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
  X,
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
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "Reports", url: "/reports", icon: FileText },
];

// Grouped secondary items (shown in "More" sheet)
const navGroups = [
  {
    label: "Money",
    items: [
      { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
      { title: "Bank Accounts", url: "/bank-accounts", icon: Wallet },
      { title: "Virtual Cards", url: "/virtual-cards", icon: Layers },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {primaryItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300",
                "hover:bg-accent/50",
                "active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
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
                <span className="text-[10px] font-medium">
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
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300",
                "hover:bg-accent/50",
                "active:scale-95",
                isSecondaryRouteActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pb-8">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200",
                            "hover:bg-accent/50",
                            "active:scale-95",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted/50 text-foreground"
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
