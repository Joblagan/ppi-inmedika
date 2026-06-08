import type { ReactNode } from "react";

export const metadata = {
  title: "Mode Presentasi | PPI/IPCN",
};

export default function PresentationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
