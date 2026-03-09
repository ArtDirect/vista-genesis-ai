import { Home, Library, Plus, User } from "lucide-react";
import { useAppStore, type NavTab } from "@/lib/store";

const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "visualizations", label: "My Manifestations", icon: Library },
  { id: "ritual", label: "Create", icon: Plus },
  { id: "profile", label: "Profile", icon: User },
];

const AppSidebar = () => {
  const { activeTab, setActiveTab, setStep } = useAppStore();

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "ritual") setStep("ritual");
    if (tab === "home") setStep("script");
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/30 bg-card/40 backdrop-blur-sm">
      <div className="px-6 py-8">
        <span className="text-xl font-semibold font-serif text-gradient-sunrise">
          ManifestFlow
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full gradient-sunrise" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border/20 p-4">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Speak your dreams. Listen to your future.
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
