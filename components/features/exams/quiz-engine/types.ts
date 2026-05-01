export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizProps {
  questions: QuizQuestion[];
}
