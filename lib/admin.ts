import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin-auth");

  if (!auth) {
    redirect("/admin/login");
  }
}
