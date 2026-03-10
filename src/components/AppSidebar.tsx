import { Home, Images, Flame, User, Plus } from "lucide-react";
import { useAppStore, type NavTab, type AppStep } from "@/lib/store";

const items: { id: NavTab; label: string; icon: typeof Home; step: AppStep }[] = [
  { id: "home", label: "Home", icon: Home, step: "dashboard" },
  { id: "visualizations", label: "My Scenes", icon: Images, step: "gallery" },
  { id: "ritual", label: "Daily Ritual", icon: Flame, step: "dashboard" },
  { id: "profile", label: "Profile", icon: User, step: "dashboard" },
];

const AppSidebar = () => {
  const { activeTab, setActiveTab, setStep } = useAppStore();

  const handleNav = (item: typeof items[0]) => {
    setActiveTab(item.id);
    setStep(item.step);
  };

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card p-6">
      <h1 className="mb-8 text-lg font-serif text-foreground">ManifestFlow</h1>

      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => { useAppStore.getState().resetApp(); }}
        className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> New Visualization
      </button>
    </aside>
  );
};

export default AppSidebar;
