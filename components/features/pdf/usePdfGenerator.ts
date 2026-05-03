import { useState, useEffect } from "react";
import { TemplateType } from "./PdfGenerator";

interface UsePdfGeneratorProps {
  type: TemplateType;
  title?: string;
  level?: string;
}

export function usePdfGenerator({ type, title, level }: UsePdfGeneratorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getFileName = () => {
    if (title) return `${title}_NihongoRoute.pdf`;
    const timestamp = new Date()
      .toLocaleDateString("id-ID")
      .replace(/\//g, "-");

    if (type === "vocab")
      return `ListKosakata_${level || "All"}_${timestamp}.pdf`;
    return `Materi_NihongoRoute_${timestamp}.pdf`;
  };

  return { isClient, getFileName };
}
