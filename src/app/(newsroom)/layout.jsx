import { Toaster } from "sonner";
import CommandPalette from "@/components/newsroom/CommandPalette";

export default function NewsroomLayout({ children }) {
  return (
    <>
      <CommandPalette />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "inherit",
          },
        }}
      />
    </>
  );
}
