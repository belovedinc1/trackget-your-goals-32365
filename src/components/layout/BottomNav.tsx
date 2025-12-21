import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "EMI", url: "/emi", icon: CreditCardIcon },
  { title: "Subscriptions", url: "/subscriptions", icon: RefreshCw },
  { title: "Bank", url: "/bank-accounts", icon: Wallet },
  { title: "Cards", url: "/virtual-cards", icon: Layers },
  { title: "Price", url: "/price-tracking", icon: TrendingUp },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Health", url: "/finance-health", icon: HeartPulse }, 
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 max-w-7xl mx-auto overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[60px]",
                "hover:bg-accent/50 hover:scale-110",
                "active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg scale-110"
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
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {item.title}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
