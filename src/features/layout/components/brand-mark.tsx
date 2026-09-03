import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function BrandMark({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 min-w-0 transition-opacity hover:opacity-90 ${
        isCollapsed ? "justify-center w-full" : ""
      }`}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8d6ae8] to-[#5d35bd] text-white shadow-sm">
        <MessageCircle className="size-4.5" strokeWidth={2.2} />
      </div>
      {!isCollapsed && (
        <span className="font-bold text-lg text-sidebar-foreground truncate tracking-tight">
          FlexoWhats
        </span>
      )}
    </Link>
  );
}
