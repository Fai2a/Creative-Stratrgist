import { Music2, Search } from "lucide-react";
import type { PlatformId } from "@/lib/platforms";

const SIZES = {
  sm: "h-8 w-8 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

export default function PlatformIcon({
  id,
  size = "sm",
}: {
  id: PlatformId;
  size?: keyof typeof SIZES;
}) {
  const base = `${SIZES[size]} flex items-center justify-center shrink-0 text-white`;
  const icon = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  if (id === "tiktok") {
    return (
      <span className={`${base} bg-neutral-900`}>
        <Music2 className={icon} />
      </span>
    );
  }
  if (id === "meta") {
    return (
      <span
        className={`${base} bg-[#1877F2] font-bold ${size === "lg" ? "text-xl" : "text-sm"}`}
      >
        f
      </span>
    );
  }
  return (
    <span className={`${base} bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05]`}>
      <Search className={icon} />
    </span>
  );
}
