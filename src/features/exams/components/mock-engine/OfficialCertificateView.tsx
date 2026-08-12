"use client";

/**
 * @file OfficialCertificateView.tsx
 * @description Tampilan dokumen sertifikat resmi (Official Notice/Certificate) hasil simulasi ujian.
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Share, ErrorWarning, Award } from "@/components/ui/icons";
import Link from "next/link";
import type { ExamData } from "./types";
import type { JlptScores, JftScores, CertificatePayload } from "./examResultData";
import { PdfGenerator } from "./PdfGeneratorLazy";

/**
 * Props untuk tampilan sertifikat resmi.
 */
interface OfficialCertificateViewProps {
 exam: ExamData;
 userFullName: string;
 regNo: string;
 testDateStr: string;
 isJft: boolean;
 isPassed: boolean;
 failedSection: boolean;
 finalScore: number;
 jlptScores: JlptScores;
 jftScores: JftScores;
 certificateData: CertificatePayload;
 backLink: string;
 onReview: () => void;
 onShare: () => void;
}

/**
 * View dokumen sertifikat resmi (Official Notice).
 */
export function OfficialCertificateView({
 exam,
 userFullName,
 regNo,
 testDateStr,
 isJft,
 isPassed,
 failedSection,
 finalScore,
 jlptScores,
 jftScores,
 certificateData,
 backLink,
 onReview,
 onShare,
}: OfficialCertificateViewProps) {
 return (
 /* Tata Letak Sertifikat Kertas Kulit Autentik */
 <div className="p-1 md:p-1.5 rounded-2xl shadow-2xl">
 <Card className="p-6 md:p-12 text-[#2d2821] relative overflow-hidden bg-[#FAF8F5] border-4 border-double border-[#C8BFA7] rounded-xl font-serif transition-all duration-500">
 {/* Logo / Lambang Latar Belakang Tanda Air Halus */}
 <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center select-none">
 <svg className="size-[85%]" viewBox="0 0 100 100" fill="currentColor">
 <path d="M50 5 L95 28 L95 72 L50 95 L5 72 L5 28 Z" />
 </svg>
 </div>

 <div className="relative z-10 space-y-6 md:space-y-8">
 {/* Logo & Judul Kepala Dokumen */}
 <div className="text-center border-b border-[#E3DEC3] pb-6 space-y-2">
 <span className="text-[10px] font-sans tracking-[0.25em] font-black text-success uppercase block mb-1">
 Official Result Notice & Transcript
 </span>
 {isJft ? (
 <>
 <h1 className="text-xl md:text-3xl tracking-wide text-stone-800 leading-tight">
 国際交流基金日本語基礎テスト 結果通知書
 </h1>
 <h2 className="text-[11px] md:text-sm tracking-wider text-stone-600 uppercase">
 THE JAPAN FOUNDATION TEST FOR BASIC JAPANESE
 </h2>
 <p className="text-[9px] md:text-[10px] font-sans text-stone-500 italic uppercase tracking-wider">
 Notification of Test Results
 </p>
 </>
 ) : (
 <>
 <h1 className="text-xl md:text-3xl tracking-wide text-stone-800 leading-tight">
 日本語能力試験 合否判定書
 </h1>
 <h2 className="text-[11px] md:text-sm tracking-wider text-stone-600 uppercase">
 JAPANESE-LANGUAGE PROFICIENCY TEST
 </h2>
 <p className="text-[9px] md:text-[10px] font-sans text-stone-500 italic uppercase tracking-wider">
 Certificate of Result and Scores
 </p>
 </>
 )}
 </div>

 {/* Tabel Identitas Peserta Ujian */}
 <div className="overflow-x-auto">
 <table className="w-full text-[11px] md:text-[13px] font-sans border-collapse border border-[#C8BFA7] bg-[#FCFBF8]/60">
 <tbody>
 <tr className="border-b border-[#C8BFA7]">
 <td className="w-1/4 p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
 Examinee Name <br className="hidden md:inline" />
 <span className="text-[10px] font-normal font-serif">(受験者氏名)</span>
 </td>
 <td className="p-2.5 border-r border-[#C8BFA7] font-serif font-bold text-stone-800 text-left pl-4">
 {userFullName}
 </td>
 <td className="w-1/4 p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
 Registration No. <br className="hidden md:inline" />
 <span className="text-[10px] font-normal font-serif">(受験番号)</span>
 </td>
 <td className="p-2.5 font-mono font-bold text-stone-800 text-left pl-4">
 {regNo}
 </td>
 </tr>
 <tr>
 <td className="p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
 Date of Test <br className="hidden md:inline" />
 <span className="text-[10px] font-normal font-serif">(受験年月日)</span>
 </td>
 <td className="p-2.5 border-r border-[#C8BFA7] font-mono text-stone-800 text-left pl-4">
 {testDateStr}
 </td>
 <td className="p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
 Level <br className="hidden md:inline" />
 <span className="text-[10px] font-normal font-serif">(レベル)</span>
 </td>
 <td className="p-2.5 font-serif font-bold text-success text-left pl-4 uppercase">
 {exam.levelCode || (isJft ? "A2" : "JLPT")}
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 {/* Kisi Skor & Bagian Hasil */}
 {isJft ? (
 /* Rincian Skor CBT Otentik JFT-Basic */
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Kartu Skor Berskala */}
 <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-5 flex flex-col items-center justify-center relative rounded-lg">
 <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
 Scaled Score (総合評価点)
 </span>
 <div className="mt-2 flex items-baseline gap-1">
 <span className={`text-4xl md:text-5xl font-black font-mono ${isPassed ? 'text-success' : 'text-destructive'}`}>
 {jftScores.score}
 </span>
 <span className="text-xs font-sans font-semibold text-stone-400">/ 250</span>
 </div>
 <span className="text-[9px] font-sans text-stone-500 mt-1">
 Passing Standard: 200 points or above (合格基準点: 200点以上)
 </span>
 </div>

 {/* Kartu Segel Status Hasil */}
 <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-5 flex flex-col items-center justify-center relative rounded-lg overflow-hidden">
 <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
 Test Result (合否結果)
 </span>
 <div className="mt-2 flex items-center justify-center gap-2">
 {isPassed ? (
 <div className="flex items-center gap-1.5 text-success font-extrabold text-2xl tracking-wider">
 <Check size={24} />
 合格 (PASS)
 </div>
 ) : (
 <div className="flex items-center gap-1.5 text-destructive font-extrabold text-2xl tracking-wider">
 <ErrorWarning size={24} />
 不合格 (FAIL)
 </div>
 )}
 </div>
 {/* Stempel Hanko SVG */}
 <div className="absolute right-2 -bottom-2 opacity-90 pointer-events-none rotate-[-15deg] select-none">
 <svg className={`w-20 h-20 ${isPassed ? 'text-[#c23b22]' : 'text-stone-500'}`} viewBox="0 0 100 100">
 <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
 <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
 <text x="50" y="32" textAnchor="middle" fill="currentColor" className="font-serif text-[7px] font-bold tracking-widest">JFT-BASIC</text>
 <text x="50" y="58" textAnchor="middle" fill="currentColor" className="font-serif text-xl font-extrabold tracking-wider">{isPassed ? "合格" : "不判定"}</text>
 <text x="50" y="78" textAnchor="middle" fill="currentColor" className="font-serif text-[9px] font-bold tracking-widest">判定之印</text>
 </svg>
 </div>
 </div>
 </div>

 {/* Tingkat Area CBT */}
 <div className="border border-[#C8BFA7] rounded-lg overflow-hidden">
 <div className="bg-[#F3EFE3] p-2 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
 Section Performance Rates (セクション別正答率)
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#C8BFA7] bg-[#FCFBF8]">
 <div className="p-3 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase">Writing & Vocab</p>
 <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.vocabRate}%</p>
 </div>
 <div className="p-3 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase">Grammar</p>
 <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.grammarRate}%</p>
 </div>
 <div className="p-3 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase">Reading</p>
 <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.readingRate}%</p>
 </div>
 <div className="p-3 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase">Listening</p>
 <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.listeningRate}%</p>
 </div>
 </div>
 </div>

 {/* Kotak Level CEFR */}
 <div className="border border-[#C8BFA7] bg-[#FCFBF8]/40 p-4 rounded-lg text-left text-xs space-y-2">
 <p className="font-bold text-[#554d3d] uppercase border-b border-[#E3DEC3] pb-1.5 flex items-center gap-2">
 <Award size={14} className="text-success" />
 CEFR A2 Qualification Standard Remarks
 </p>
 <p className="text-stone-700 leading-relaxed font-serif text-[11px] md:text-xs">
 <strong>[Jap]</strong> ごく基本的な個人情報や家族情報、買い物、近所の様子、仕事など、直接的関係がある領域に関する、よく使われる文や表現を理解できる。簡単で日常的な範囲なら、馴染みがある事柄についての情報交換に応じることができる。
 </p>
 <p className="text-stone-500 leading-relaxed font-serif text-[10px] md:text-[11px] italic">
 <strong>[Eng]</strong> Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.
 </p>
 </div>
 </div>
 ) : (
 /* Rincian Skor Otentik JLPT */
 <div className="space-y-6">
 <div className="flex flex-wrap gap-4">
 {/* Kotak 1: Tabel Skor */}
 <div className="md:col-span-2 border border-[#C8BFA7] rounded-lg overflow-hidden bg-[#FCFBF8]">
 <div className="bg-[#F3EFE3] p-2.5 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
 Scores by Test Section (得点区分別得点)
 </div>
 
 {jlptScores.isN4N5 ? (
 /* Rincian 2 Bagian N4/N5 */
 <div className="grid grid-cols-2 divide-x divide-[#C8BFA7]">
 <div className="p-4 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Language Knowledge & Reading</p>
 <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(言語知識・読解)</p>
 <p className="text-3xl font-bold font-mono text-stone-800 mt-2">
 {jlptScores.scoreLang} <span className="text-sm text-stone-400 font-semibold">/ 120</span>
 </p>
 </div>
 <div className="p-4 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Listening</p>
 <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(聴解)</p>
 <p className="text-3xl font-bold font-mono text-stone-800 mt-2">
 {jlptScores.scoreList} <span className="text-sm text-stone-400 font-semibold">/ 60</span>
 </p>
 </div>
 </div>
 ) : (
 /* Rincian 3 Bagian N1-N3 */
 <div className="flex flex-col gap-2 border-l border-[#C8BFA7] pl-4">
 <div className="p-4 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Language Knowledge</p>
 <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(言語知識)</p>
 <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
 {jlptScores.scoreLang} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
 </p>
 </div>
 <div className="p-4 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Reading</p>
 <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(読解)</p>
 <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
 {jlptScores.scoreRead} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
 </p>
 </div>
 <div className="p-4 text-center">
 <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Listening</p>
 <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(聴解)</p>
 <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
 {jlptScores.scoreList} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Kotak 2: Total Skor & Stempel Status */}
 <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-4 flex flex-col items-center justify-center relative rounded-lg overflow-hidden">
 <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
 Total Score (総合得点)
 </span>
 <div className="mt-2 flex items-baseline gap-1 z-10">
 <span className={`text-4xl md:text-5xl font-black font-mono ${isPassed ? 'text-success' : 'text-destructive'}`}>
 {finalScore}
 </span>
 <span className="text-xs font-sans font-semibold text-stone-400">/ 180</span>
 </div>
 
 <div className="mt-1.5 z-10 text-[10px] font-sans font-bold flex items-center gap-1 text-[#554d3d]">
 Result: {isPassed ? (
 <span className="text-success uppercase">合格 (Passed)</span>
 ) : (
 <span className="text-destructive uppercase">不合格 (Failed)</span>
 )}
 </div>

 {/* Stempel Hanko SVG */}
 <div className="absolute right-2 -bottom-2 opacity-95 pointer-events-none rotate-[-12deg] select-none">
 <svg className={`w-20 h-20 ${isPassed ? 'text-[#c23b22]' : 'text-stone-500'}`} viewBox="0 0 100 100">
 <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
 <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
 <text x="50" y="32" textAnchor="middle" fill="currentColor" className="font-serif text-[7px] font-bold tracking-widest">JLPT OFFICE</text>
 <text x="50" y="58" textAnchor="middle" fill="currentColor" className="font-serif text-xl font-extrabold tracking-wider">{isPassed ? "合格" : "不判定"}</text>
 <text x="50" y="78" textAnchor="middle" fill="currentColor" className="font-serif text-[9px] font-bold tracking-widest">判定之印</text>
 </svg>
 </div>
 </div>
 </div>

 {/* Tabel Informasi Referensi: Nilai Huruf (A/B/C) */}
 <div className="border border-[#C8BFA7] rounded-lg overflow-hidden bg-[#FCFBF8]">
 <div className="bg-[#F3EFE3] p-2 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
 Reference Information (参考情報)
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs font-sans text-center border-collapse">
 <thead>
 <tr className="border-b border-[#C8BFA7] bg-[#FCFBF8] text-[#554d3d] text-[10px] font-bold">
 <th className="p-2.5 border-r border-[#C8BFA7] text-left pl-4">Vocabulary (文字・語彙)</th>
 <th className="p-2.5 border-r border-[#C8BFA7]">Grammar (文法)</th>
 <th className="p-2.5">Reading (読解)</th>
 </tr>
 </thead>
 <tbody>
 <tr className="font-mono text-stone-800 font-bold">
 <td className="p-3 border-r border-[#C8BFA7] text-left pl-4 font-sans">
 Grade <span className="font-mono text-success text-sm font-black">{jlptScores.vocabGrade}</span>
 <span className="text-[9px] font-normal text-stone-400 block mt-0.5">(A: 67%+ | B: 34-66% | C: &lt;34%)</span>
 </td>
 <td className="p-3 border-r border-[#C8BFA7] font-sans">
 Grade <span className="font-mono text-success text-sm font-black">{jlptScores.grammarGrade}</span>
 </td>
 <td className="p-3 font-sans">
 Grade <span className="font-mono text-success text-sm font-black">{jlptScores.readingGrade}</span>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Peringatan mengenai Kegagalan Maiten */}
 {failedSection && finalScore >= exam.passingScore && (
 <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-sans font-bold flex items-center justify-center gap-2">
 <ErrorWarning size={16} className="text-destructive" />
 <span>Total score meets passing bar, but candidate did not satisfy sectional minimum score criteria (Maiten failed).</span>
 </div>
 )}

 {/* Tanda Tangan Resmi & Kotak Segel */}
 <div className="border-t border-[#E3DEC3] pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] md:text-[11px] text-stone-500 font-sans">
 <div className="text-left space-y-1">
 <p className="font-bold text-stone-700">ORGANIZED BY:</p>
 <p>The Japan Foundation (独立行政法人 国際交流基金)</p>
 <p>Japan Educational Exchanges and Services (日本国際教育支援協会)</p>
 </div>

 {/* Aksi Unduhan & PDF */}
 <div className="flex flex-col sm:flex-row gap-3 items-center z-20">
 <PdfGenerator 
 type="certificate" 
 data={certificateData} 
 title={`Sertifikat_${exam.title}`} 
 />
 
 <Button
 onClick={onShare}
 variant="outline"
 size="sm"
 className="bg-transparent hover:bg-[#F3EFE3] text-stone-700 border-[#C8BFA7] font-bold text-xs h-9"
 >
 <Share size={14} className="mr-1.5 text-stone-500" /> Share Result
 </Button>
 </div>
 </div>
 </div>
 </Card>

 {/* Baris Aksi di Bawah Sertifikat Resmi */}
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 pb-2">
 <Button
 asChild
 variant="outline"
 className="w-full sm:w-auto px-12 h-14 bg-background/10 hover:bg-background/20 text-xs font-black uppercase tracking-widest rounded-lg transition-all border border-border text-foreground glass"
 >
 <Link href={backLink}>Finish & Exit</Link>
 </Button>
 
 <Button
 onClick={() => onReview()}
 variant="outline"
 className="w-full sm:w-auto px-12 h-14 bg-background/5 hover:bg-background/15 text-xs font-black uppercase tracking-widest rounded-lg transition-all border border-border text-muted-foreground glass"
 >
 Analisis Kesalahan
 </Button>
 </div>
 </div>
 );
}
