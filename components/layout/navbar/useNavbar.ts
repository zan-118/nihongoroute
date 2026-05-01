import { usePathname, useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/lib/supabase/client";

export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, userFullName } = useProgressStore(
    useShallow((state) => ({ isAuthenticated: state.isAuthenticated, userFullName: state.userFullName }))
  );
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const links = [
    { href: "/courses", label: "Materi" },
    { href: "/exams", label: "Ujian" },
    { href: "/library", label: "Pustaka" },
    { href: "/review", label: "Hafalan" },
  ];

  return { pathname, isAuthenticated, userFullName, handleLogout, links };
}
