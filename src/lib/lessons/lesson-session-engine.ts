/**
 * @file lesson-session-engine.ts
 * @description Core domain engine seam untuk mengelola alur sesi pembelajaran (Lesson Session),
 * mencakup urutan seksi (Dialogue, Vocab, Kanji, Practice), kalkulasi persentase progres, dan penandaan kelengkapan bab.
 * 100% bebas dari ketergantungan React DOM/hooks untuk keterujian murni via Vitest.
 */

export type LessonSectionType = "dialogue" | "vocab" | "kanji" | "practice";

export interface LessonSectionItem {
 id: LessonSectionType;
 title: string;
 itemCount: number;
}

export interface LessonSessionOptions {
 lessonId: string;
 sections: LessonSectionItem[];
 initialCompletedSections?: LessonSectionType[];
}

export class LessonSessionEngine {
 private lessonId: string;
 private sections: LessonSectionItem[];
 private activeSectionIndex: number = 0;
 private completedSections: Set<LessonSectionType>;

 constructor(options: LessonSessionOptions) {
 this.lessonId = options.lessonId;
 this.sections = options.sections;
 this.completedSections = new Set(options.initialCompletedSections ?? []);
 }

 public getLessonId(): string {
 return this.lessonId;
 }

 public getSections(): LessonSectionItem[] {
 return this.sections;
 }

 public getActiveSectionIndex(): number {
 return this.activeSectionIndex;
 }

 public getActiveSection(): LessonSectionItem | undefined {
 return this.sections[this.activeSectionIndex];
 }

 public getCompletedSections(): LessonSectionType[] {
 return Array.from(this.completedSections);
 }

 public markSectionComplete(sectionId: LessonSectionType): void {
 this.completedSections.add(sectionId);
 }

 public isSectionCompleted(sectionId: LessonSectionType): boolean {
 return this.completedSections.has(sectionId);
 }

 public getProgressPercentage(): number {
 if (this.sections.length === 0) return 100;
 return Math.round((this.completedSections.size / this.sections.length) * 100);
 }

 public isFullyCompleted(): boolean {
 return this.sections.length > 0 && this.completedSections.size >= this.sections.length;
 }

 public nextSection(): boolean {
 if (this.activeSectionIndex < this.sections.length - 1) {
 this.activeSectionIndex += 1;
 return true;
 }
 return false;
 }

 public previousSection(): boolean {
 if (this.activeSectionIndex > 0) {
 this.activeSectionIndex -= 1;
 return true;
 }
 return false;
 }

 public jumpToSection(sectionId: LessonSectionType): boolean {
 const idx = this.sections.findIndex((s) => s.id === sectionId);
 if (idx !== -1) {
 this.activeSectionIndex = idx;
 return true;
 }
 return false;
 }
}
