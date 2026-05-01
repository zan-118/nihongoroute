import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Zap, ShieldAlert, AlertTriangle, Target, BatteryMedium } from "lucide-react";
import { CardData } from "./types";

interface SurvivalPlayingProps {
  hp: number;
  MAX_HP: number;
  score: number;
  timeLeft: number;
  TIME_PER_QUESTION: number;
  currentCard: CardData | null;
  options: CardData[];
  isShaking: boolean;
  selectedWrongId: string | null;
  selectedId: string | null;
  isCorrecting: boolean;
  handleAnswer: (option: CardData) => void;
}

export function SurvivalPlaying({
  hp,
  MAX_HP,
  score,
  timeLeft,
  TIME_PER_QUESTION,
  currentCard,
  options,
  isShaking,
  selectedWrongId,
  selectedId,
  isCorrecting,
  handleAnswer,
}: SurvivalPlayingProps) {
  const isDangerTime = timeLeft <= 3;
  const isCriticalHp = hp === 1;

  return (
    <div className="w-full flex flex-col h-full min-h-[60vh] max-w-3xl mx-auto pb-10 px-4 md:px-0">
      <Card
        className={`flex justify-between items-center mb-8 md:mb-10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 neo-card shadow-none ${isCriticalHp ? "border-cyber-neon/60 bg-cyber-neon/10 shadow-[0_0_30px_rgba(0,238,255,0.15)]" : "bg-cyber-surface border-white/5"}`}
      >
        <div className="flex gap-2 md:gap-4 items-center">
          {[...Array(MAX_HP)].map((_, i) => (
            <BatteryMedium
              key={i}
              size={24}
              className={`transition-all duration-500 ${
                i < hp
                  ? "text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.8)]"
                  : "text-white/10 scale-75 opacity-30"
              } md:w-8 md:h-8`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-2 md:gap-4 font-mono text-2xl md:text-4xl lg:text-5xl font-black tracking-tight transition-all ${isDangerTime ? "text-cyber-neon animate-pulse drop-shadow-[0_0_15px_rgba(0,238,255,0.8)]" : "text-white opacity-80"}`}
        >
          <Timer size={24} className="md:w-8 md:h-8 lg:w-10 lg:h-10" /> 00:
          {timeLeft.toString().padStart(2, "0")}
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-cyber-neon font-black text-2xl md:text-3xl lg:text-4xl">
          <Zap size={22} className="fill-cyber-neon md:w-7 md:h-7 lg:w-8 lg:h-8" /> {score}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?._id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-10, 10, -10, 10, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 25 }}
          className="flex-1 flex flex-col mb-8 md:mb-10"
        >
          <Card
            className={`relative bg-cyber-surface rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 border text-center shadow-none flex flex-col items-center justify-center flex-1 min-h-[300px] md:min-h-[400px] lg:min-h-[500px] neo-card transition-all duration-300 ${
              isShaking
                ? "border-cyber-neon shadow-[0_0_60px_rgba(0,238,255,0.3)]"
                : "border-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] md:bg-[size:100%_6px] pointer-events-none opacity-40 rounded-[3rem] md:rounded-[4rem]" />

            <Badge
              variant="outline"
              className={`absolute top-6 md:top-10 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest border px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl neo-inset h-auto transition-all duration-300 ${isDangerTime ? "text-cyber-neon border-cyber-neon/50 bg-cyber-neon/10 shadow-[0_0_15px_rgba(0,238,255,0.2)]" : "text-slate-500 border-white/10 bg-black/30"}`}
            >
              {isDangerTime ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} className="animate-bounce md:w-4 md:h-4" /> WAKTU KRITIS
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Target size={14} className="animate-pulse md:w-4 md:h-4" /> KATA TARGET
                </span>
              )}
            </Badge>

            <div className="flex flex-col items-center justify-center w-full min-h-[150px] md:min-h-[200px]">
               <h2
                 className={`${(currentCard?.word?.length || 0) > 4 ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]"} font-black text-white tracking-tight drop-shadow-lg font-japanese leading-none transition-all duration-500`}
               >
                 {currentCard?.word}
               </h2>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mb-8 md:mb-10">
         <Progress 
           value={(timeLeft / TIME_PER_QUESTION) * 100} 
           className="h-2 md:h-3 bg-black/50 border border-white/10 rounded-full overflow-hidden"
           indicatorClassName={isDangerTime ? "bg-cyber-neon shadow-[0_0_15px_rgba(0,238,255,0.8)] transition-all duration-1000" : "bg-white opacity-40 transition-all duration-1000"}
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-stretch">
        {options.map((option, idx) => {
          const isCorrect = selectedId === option._id && option._id === currentCard?._id;
          const isWrong = selectedWrongId === option._id;
          
          return (
            <Button
              key={idx}
              variant="ghost"
              onClick={() => handleAnswer(option)}
              disabled={isCorrecting}
              className={`group flex h-full w-full p-0 overflow-hidden rounded-3xl md:rounded-[2.5rem] border transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[120px] shadow-none ${
                isWrong 
                  ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-red-400" 
                  : isCorrect
                  ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-emerald-400"
                  : "bg-black/40 border-white/5 hover:border-cyber-neon/50 hover:bg-cyber-neon hover:text-black neo-card"
              }`}
            >
              <div className="flex items-center justify-center w-full h-full p-6 md:p-8 relative">
                 <span className={`absolute top-3 left-4 md:top-4 md:left-6 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-colors ${isWrong ? 'text-red-400/30' : 'text-white/10 group-hover:text-black/30'}`}>
                   OPSI {idx+1}
                 </span>
                 <p className="font-bold text-base md:text-xl lg:text-2xl text-center leading-tight w-full break-words">
                   {option.meaning}
                 </p>
                 {isWrong && (
                   <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <ShieldAlert className="text-red-500 animate-pulse" size={24} />
                   </div>
                 )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
