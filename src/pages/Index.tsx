import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import OnboardingScreen from "@/components/OnboardingScreen";
import DreamCaptureScreen from "@/components/DreamCaptureScreen";
import GeneratingScreen from "@/components/GeneratingScreen";
import ScriptScreen from "@/components/ScriptScreen";
import DailyRitualScreen from "@/components/DailyRitualScreen";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const step = useAppStore((s) => s.step);
  const showNav = step === "script" || step === "ritual";

  return (
    <div className="mx-auto max-w-md">
      <AnimatePresence mode="wait">
        {step === "onboarding" && <OnboardingScreen key="onboarding" />}
        {step === "dream-capture" && <DreamCaptureScreen key="dream-capture" />}
        {step === "generating" && <GeneratingScreen key="generating" />}
        {step === "script" && <ScriptScreen key="script" />}
        {step === "ritual" && <DailyRitualScreen key="ritual" />}
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
};

export default Index;
