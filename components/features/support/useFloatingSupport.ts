import { usePathname } from "next/navigation";

export function useFloatingSupport() {
  const pathname = usePathname();

  const isHidden =
    pathname === "/support" ||
    pathname?.startsWith("/studio") ||
    pathname?.includes("/exam") ||
    pathname === "/review";

  return { isHidden };
}
