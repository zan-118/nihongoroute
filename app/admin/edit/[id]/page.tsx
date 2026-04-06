import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import EditLessonForm from "./EditLessonForm";

export default async function Page({ params }: any) {
  requireAdmin();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", params.id)
    .single();

  return <EditLessonForm lesson={lesson} />;
}
