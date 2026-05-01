import { useEffect, useRef, useState } from "react";

export function useAnimatedKanji(character: string, triggerKey: number, color: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setError(false);

    const baseChar = character.charAt(0);
    const code = baseChar.charCodeAt(0).toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat SVG");
        return res.text();
      })
      .then((svgText) => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = svgText;
        const svg = containerRef.current.querySelector("svg");

        if (!svg) return;

        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        const paths = svg.querySelectorAll("path");

        paths.forEach((path, index) => {
          const length = path.getTotalLength();

          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();

          path.style.stroke = color;
          path.style.strokeWidth = "3.5";
          path.style.strokeLinecap = "round";
          path.style.strokeLinejoin = "round";
          path.style.fill = "none";
          path.style.filter = `drop-shadow(0 0 4px ${color})`;

          path.style.animation = `drawKanji 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.7}s forwards`;
        });

        const texts = svg.querySelectorAll("text");
        texts.forEach((text) => (text.style.display = "none"));
      })
      .catch(() => {
        setError(true); 
      });
  }, [character, triggerKey, color]);

  return { containerRef, error };
}
