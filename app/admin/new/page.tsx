"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminEditor from "@/components/AdminEditor";
import { useRouter } from "next/navigation";

export default function NewLesson() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [levelId, setLevelId] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) {
      router.push("/admin/login");
    }

    supabase
      .from("levels")
      .select("*")
      .then(({ data }) => {
        if (data) setLevels(data);
      });
  }, []);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-");

  const saveLesson = async () => {
    await supabase.from("lessons").insert({
      level_id: levelId,
      slug: slug || generateSlug(title),
      title,
      summary,
      content_html: content,
      order_number: 999,
      category: "grammar",
    });

    alert("Saved!");
  };

  return (
    <div className="min-h-screen bg-[#1f242d] p-10 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">New Lesson</h1>

        <input
          className="w-full p-3 bg-[#1e2024] rounded"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full p-3 bg-[#1e2024] rounded"
          placeholder="Slug (optional)"
          onChange={(e) => setSlug(e.target.value)}
        />

        <textarea
          className="w-full p-3 bg-[#1e2024] rounded"
          placeholder="Summary"
          onChange={(e) => setSummary(e.target.value)}
        />

        <select
          className="w-full p-3 bg-[#1e2024] rounded"
          onChange={(e) => setLevelId(e.target.value)}
        >
          <option>Select Level</option>
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.name}
            </option>
          ))}
        </select>

        <AdminEditor content={content} onChange={setContent} />

        <button
          onClick={saveLesson}
          className="px-6 py-3 bg-[#0ef] text-black font-bold rounded"
        >
          Save Lesson
        </button>
      </div>
    </div>
  );
}
