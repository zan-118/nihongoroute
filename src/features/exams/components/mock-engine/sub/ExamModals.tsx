"use client";

import React from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useExamSession } from "../ExamSessionContext";

/**
 * Confirm modals for section change and exam completion.
 */
export function ExamModals() {
 const {
 pendingConfirm,
 setPendingConfirm,
 confirmPendingAction,
 pendingConfirmLabel,
 isSubmittingSession,
 } = useExamSession();

 return (
 <ConfirmModal
 isOpen={!!pendingConfirm}
 onClose={() => setPendingConfirm(null)}
 onConfirm={confirmPendingAction}
 title={pendingConfirmLabel?.title || "Konfirmasi"}
 description={pendingConfirmLabel?.description || "Apakah kamu yakin?"}
 confirmText={pendingConfirm === "finish" ? "Ya, Kumpulkan" : "Ya, Lanjutkan"}
 cancelText="Batal"
 isDestructive={pendingConfirm === "finish"}
 />
 );
}
