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
  Layers,
  Heart,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Expenses", url: "/expenses", icon: Receipt },
      { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
      { title: "Savings", url: "/savings", icon: PiggyBank },
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
      { title: "Finance Health", url: "/finance-health", icon: Heart },
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
];

const userItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isGroupActive = (items: typeof navGroups[0]["items"]) => 
    items.some(item => location.pathname === item.url);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {group.items.length === 1 ? (
              // Single item group - no collapsible needed
              <>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
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
              </>
            ) : (
              // Multi-item group - use collapsible
              <Collapsible defaultOpen={isGroupActive(group.items)} className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md transition-colors">
                    <span className="flex-1">{group.label}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
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
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarGroup>
        ))}

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
