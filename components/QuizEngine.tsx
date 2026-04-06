"use client";

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";

/* ============================= */
/* TYPES */
/* ============================= */

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  options: Option[];
  explanation?: string;
}

interface QuizProps {
  questions: Question[];
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function QuizEngine({ questions }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  /* ============================= */
  /* SAFETY CHECK */
  /* ============================= */

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  /* ============================= */
  /* PROGRESS */
  /* ============================= */

  const progressPercent = useMemo(() => {
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  /* ============================= */
  /* HANDLERS */
  /* ============================= */

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);

    if (currentQuestion.options[index].isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedIndex(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setFinished(false);
  };

  /* ============================= */
  /* FINISHED STATE */
  /* ============================= */

  if (finished) {
    return (
      <div className="mt-20 p-10 bg-[#1e2024] rounded-[2rem] text-center border border-[#0ef]/20">
        <h2 className="text-2xl font-black text-white mb-4 uppercase">
          Quiz Completed
        </h2>

        <p className="text-[#0ef] text-lg font-bold mb-6">
          Score: {score} / {questions.length}
        </p>

        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-[#0ef] text-black font-bold rounded-lg hover:scale-105 transition"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  /* ============================= */
  /* UI */
  /* ============================= */

  return (
    <div className="mt-20 p-10 bg-[#1e2024] rounded-[2rem] border border-[#0ef]/10">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white uppercase">
          Check Point
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded mt-4">
          <div
            className="bg-[#0ef] h-2 rounded transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-sm text-[#c4cfde]/60 mt-2">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* QUESTION */}
      <p className="text-white text-lg mb-6">{currentQuestion.question}</p>

      {/* OPTIONS */}
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = option.isCorrect;

          let style = "border-white/10 hover:border-[#0ef]/40";

          if (selectedIndex !== null) {
            if (isCorrect) {
              style = "border-green-500 bg-green-500/10";
            } else if (isSelected) {
              style = "border-red-500 bg-red-500/10";
            } else {
              style = "border-white/10 opacity-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`w-full p-4 rounded-xl text-left transition border ${style}`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {/* EXPLANATION + NEXT */}
      {selectedIndex !== null && (
        <div className="mt-6">
          {currentQuestion.explanation && (
            <p className="text-sm text-[#c4cfde] mb-4">
              {currentQuestion.explanation}
            </p>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#0ef] text-black font-bold rounded-lg hover:scale-105 transition"
          >
            {currentIndex + 1 === questions.length
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
