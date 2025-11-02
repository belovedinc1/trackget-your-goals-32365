import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  CreditCard as CreditCardIcon, 
  TrendingUp, 
  FileText,
  User,
  Settings,
  Bot,
  ArrowLeftRight,
  RefreshCw,
  Wallet,
  Layers
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "EMI & Loans", url: "/emi", icon: CreditCardIcon },
  { title: "Subscriptions", url: "/subscriptions", icon: RefreshCw },
  { title: "Bank Accounts", url: "/bank-accounts", icon: Wallet },
  { title: "Virtual Cards", url: "/virtual-cards", icon: Layers },
  { title: "Price Tracking", url: "/price-tracking", icon: TrendingUp },
  { title: "Reports", url: "/reports", icon: FileText },
];

const userItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
