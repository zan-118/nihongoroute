"use client";

import { useMemo } from "react";

/* ============================= */
/* TYPES */
/* ============================= */

interface Props {
  studyDays: Record<string, number>;
}

/* ============================= */
/* HELPERS */
/* ============================= */

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function generateLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(formatLocalDate(d));
  }

  return days;
}

function getColor(value: number): string {
  if (!value) return "bg-[#1e2024]";
  if (value < 5) return "bg-[#0ef]/30";
  if (value < 10) return "bg-[#0ef]/60";
  return "bg-[#0ef]";
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function Heatmap({ studyDays }: Props) {
  const days = useMemo(() => generateLastNDays(30), []);

  return (
    <div>
      <h3 className="text-[#0ef] font-bold mb-4">
        📅 Study Heatmap (Last 30 Days)
      </h3>

      <div className="grid grid-cols-10 gap-2">
        {days.map((day) => {
          const value = studyDays?.[day] ?? 0;

          return (
            <div
              key={day}
              title={`${day}: ${value} reviews`}
              className={`w-6 h-6 rounded ${getColor(
                value,
              )} transition-all duration-300`}
            />
          );
        })}
      </div>
    </div>
  );
}
