import { motion } from "framer-motion";
import { Home, Image, Flame, User } from "lucide-react";
import { useAppStore, type NavTab } from "@/lib/store";

const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "visualizations", label: "Visions", icon: Image },
  { id: "ritual", label: "Ritual", icon: Flame },
  { id: "profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const { activeTab, setActiveTab, step, setStep } = useAppStore();

  const handleTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "home" && step !== "ritual") {
      // Stay on current step
    } else if (tab === "ritual") {
      setStep("ritual");
    } else if (tab === "home") {
      setStep("ritual");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md">
      <div className="border-t border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 h-0.5 w-6 rounded-full gradient-sunrise"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
};

export default BottomNav;
