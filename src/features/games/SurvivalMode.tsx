"use client";

/**
 * @file SurvivalMode.tsx
 * @description Komponen pembungkus utama (Controller/Orchestrator) untuk mode permainan bertahan hidup (Survival Mode).
 * Mengelola transisi status permainan antara layar perkenalan (Intro), area permainan aktif (Playing), dan layar kekalahan/kemenangan (GameOver).
 */

// IMPOR

import { useSurvivalMode } from "./survival/useSurvivalMode";
import { CardData } from "./survival/types";
import { SurvivalIntro } from "./survival/SurvivalIntro";
import { SurvivalGameOver } from "./survival/SurvivalGameOver";
import { SurvivalPlaying } from "./survival/SurvivalPlaying";

// ANTARMUKA & TIPE

/**
 * Props for the SurvivalMode component.
 */
interface SurvivalModeProps {
 /** Array of card data used as questions in the game. */
 cards: CardData[];
}

// EKSEKUSI UTAMA

/**
 * SurvivalMode orchestrates the survival game state machine.
 * Switches views between Intro, Playing, and GameOver based on engine state.
 * 
 * @param props - Component props.
 * @returns React element matching current game state.
 */
export default function SurvivalMode({ cards }: SurvivalModeProps) {
 // Initialize game state engine hook
 const engine = useSurvivalMode(cards);

 // Show intro screen if game not started
 if (engine.gameState === "idle") {
 return <SurvivalIntro startGame={engine.startGame} />;
 }

 // Show game over or victory screen when game ends
 if (engine.gameState === "gameover" || engine.gameState === "victory") {
 return (
 <SurvivalGameOver
 gameState={engine.gameState}
 score={engine.score}
 startGame={engine.startGame}
 />
 );
 }

 // Show active gameplay screen
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