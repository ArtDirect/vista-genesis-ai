import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  showNav: boolean;
}

const AppLayout = ({ children, showNav }: AppLayoutProps) => {
  return (
    <div className="flex min-h-[100dvh] w-full">
      {showNav && <AppSidebar />}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
