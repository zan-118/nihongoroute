"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function AdminEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      Link,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    editor.chain().focus().setImage({ src: data.secure_url }).run();
  };

  return (
    <div className="bg-[#1e2024] p-4 rounded-xl text-white">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>

        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
          }
        >
          Table
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
        />

        <button
          onClick={() => {
            const url = prompt("Audio URL");
            if (url)
              editor
                .chain()
                .focus()
                .insertContent(`<audio controls src="${url}"></audio>`)
                .run();
          }}
        >
          Audio
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
