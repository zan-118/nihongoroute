"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDownloadPdfButton } from "../useDownloadPdfButton";

const PdfGenerator = dynamic(() => import("../PdfGenerator"), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" disabled className="bg-[rgba(var(--background-rgb),0.4)] border border-border neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-muted-foreground text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
      <Loader2 size={16} aria-hidden="true" className="animate-spin text-destructive" />
      Initializing Engine...
    </Button>
  ),
});

export default function DownloadPdfButton({
  data,
  type = "lesson",
}: {
   
  data: any;
  type?: "lesson" | "vocab";
}) {
  const { isMounted } = useDownloadPdfButton();

  if (!isMounted || !data) {
    return (
      <Button variant="ghost" disabled className="bg-[rgba(var(--background-rgb),0.4)] border border-border neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-muted-foreground text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
        <Loader2 size={16} aria-hidden="true" className="animate-spin text-destructive" />
        Loading Payload...
      </Button>
    );
  }

  return <PdfGenerator data={data} type={type} />;
}
