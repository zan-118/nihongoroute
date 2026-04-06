"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/lessons");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f242d]">
      <div className="bg-[#1e2024] p-8 rounded-xl">
        <input
          type="password"
          className="p-3 w-full bg-[#111] text-white rounded"
          placeholder="Admin password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="mt-4 px-6 py-3 bg-[#0ef] text-black font-bold rounded w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
}
