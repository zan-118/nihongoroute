import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function LessonsPage() {
  requireAdmin();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#1f242d] p-10 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Lessons</h1>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-[#0ef] text-black font-bold rounded"
          >
            + New
          </Link>
        </div>

        <div className="space-y-4">
          {lessons?.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-[#1e2024] p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold">{lesson.title}</h2>
                <p className="text-sm text-gray-400">
                  {lesson.published ? "Published" : "Draft"}
                </p>
              </div>

              <div className="flex gap-3">
                <Link href={`/admin/edit/${lesson.id}`} className="text-[#0ef]">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
