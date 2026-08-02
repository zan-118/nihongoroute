"use client";

/**
 * @file ExamSessionContext.tsx
 * @description React Context Provider dan custom hook `useExamSession` untuk CBT Exam Engine.
 * Menghilangkan 25-prop drilling dari MockExamEngine ke ExamPlaying dan sub-komponennya.
 */

import React, { createContext, useContext, ReactNode } from "react";
import { ExamData } from "./types";
import { useMockExamEngine } from "./useMockExamEngine";

export type ExamSessionContextType = ReturnType<typeof useMockExamEngine>;

const ExamSessionContext = createContext<ExamSessionContextType | null>(null);

interface ExamSessionProviderProps {
 exam: ExamData;
 children: ReactNode;
}

/**
 * Encapsulates exam session state engine behind a clean React Context seam.
 */
export function ExamSessionProvider({ exam, children }: ExamSessionProviderProps) {
 const session = useMockExamEngine(exam);

 return (
 <ExamSessionContext.Provider value={session}>
 {children}
 </ExamSessionContext.Provider>
 );
}

/**
 * Custom hook to access current active CBT exam session.
 * Throws clean error if invoked outside of ExamSessionProvider.
 */
export function useExamSession(): ExamSessionContextType {
 const context = useContext(ExamSessionContext);
 if (!context) {
 throw new Error("useExamSession must be used within an ExamSessionProvider");
 }
 return context;
}
