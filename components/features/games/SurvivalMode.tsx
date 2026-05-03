"use client";

import { useSurvivalMode } from "./survival/useSurvivalMode";
import { CardData } from "./survival/types";
import { SurvivalIntro } from "./survival/SurvivalIntro";
import { SurvivalGameOver } from "./survival/SurvivalGameOver";
import { SurvivalPlaying } from "./survival/SurvivalPlaying";

interface SurvivalModeProps {
  cards: CardData[];
}

export default function SurvivalMode({ cards }: SurvivalModeProps) {
  const engine = useSurvivalMode(cards);

  if (engine.gameState === "idle") {
    return <SurvivalIntro startGame={engine.startGame} />;
  }

  if (engine.gameState === "gameover" || engine.gameState === "victory") {
    return (
      <SurvivalGameOver
        gameState={engine.gameState}
        score={engine.score}
        startGame={engine.startGame}
      />
    );
  }

  return (
    <SurvivalPlaying
      hp={engine.hp}
      MAX_HP={engine.MAX_HP}
      score={engine.score}
      timeLeft={engine.timeLeft}
      TIME_PER_QUESTION={engine.TIME_PER_QUESTION}
      currentCard={engine.currentCard}
      options={engine.options}
      isShaking={engine.isShaking}
      selectedWrongId={engine.selectedWrongId}
      selectedId={engine.selectedId}
      isCorrecting={engine.isCorrecting}
      handleAnswer={engine.handleAnswer}
    />
  );
}
