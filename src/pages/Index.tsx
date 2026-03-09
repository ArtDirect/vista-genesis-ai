import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import LandingPage from "@/pages/LandingPage";
import OnboardingScreen from "@/components/OnboardingScreen";
import DreamCaptureScreen from "@/components/DreamCaptureScreen";
import GeneratingScreen from "@/components/GeneratingScreen";
import ScriptScreen from "@/components/ScriptScreen";
import DailyRitualScreen from "@/components/DailyRitualScreen";
import AppLayout from "@/components/AppLayout";

const Index = () => {
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);
  const [showLanding, setShowLanding] = useState(true);

  const showNav = step === "script" || step === "ritual";

  if (showLanding && step === "onboarding") {
    return (
      <LandingPage
        onStart={() => {
          setShowLanding(false);
          setStep("onboarding");
        }}
      />
    );
  }

  return (
    <AppLayout showNav={showNav}>
      <AnimatePresence mode="wait">
        {step === "onboarding" && <OnboardingScreen key="onboarding" />}
        {step === "dream-capture" && <DreamCaptureScreen key="dream-capture" />}
        {step === "generating" && <GeneratingScreen key="generating" />}
        {step === "script" && <ScriptScreen key="script" />}
        {step === "ritual" && <DailyRitualScreen key="ritual" />}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
