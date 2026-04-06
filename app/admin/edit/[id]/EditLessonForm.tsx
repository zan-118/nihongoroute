"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminEditor from "@/components/AdminEditor";
import { useRouter } from "next/navigation";

export default function EditLessonForm({ lesson }: any) {
  const router = useRouter();

  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [content, setContent] = useState(lesson.content_html);
  const [published, setPublished] = useState(lesson.published);

  const updateLesson = async () => {
    await supabase
      .from("lessons")
      .update({
        title,
        summary,
        content_html: content,
        published,
      })
      .eq("id", lesson.id);

    router.push("/admin/lessons");
  };

  const deleteLesson = async () => {
    if (!confirm("Delete this lesson?")) return;

    await supabase.from("lessons").delete().eq("id", lesson.id);

    router.push("/admin/lessons");
  };

  return (
    <div className="min-h-screen bg-[#1f242d] p-10 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Edit Lesson</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-[#1e2024] rounded"
        />

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 bg-[#1e2024] rounded"
        />

        <AdminEditor content={content} onChange={setContent} />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={() => setPublished(!published)}
          />
          Publish
        </label>

        <div className="flex gap-4">
          <button
            onClick={updateLesson}
            className="px-6 py-3 bg-[#0ef] text-black font-bold rounded"
          >
            Save
          </button>

          <button
            onClick={deleteLesson}
            className="px-6 py-3 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
