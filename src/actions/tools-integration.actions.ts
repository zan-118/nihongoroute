"use server";

/**
 * @file tools-integration.actions.ts
 * @description Server Actions delegating integrated learning tools queries (mini drills, counters, shadowing, library text tools) to tools service layer.
 * @module actions
 */

// ==========================================
// Import & Dependencies
// ==========================================
import {
 getIntegratedMiniDrillQuestions as serviceGetIntegratedMiniDrillQuestions,
 getIntegratedCounterQuestions as serviceGetIntegratedCounterQuestions,
 getIntegratedShadowingPresets as serviceGetIntegratedShadowingPresets,
 getLibraryTextForTool as serviceGetLibraryTextForTool,
 getToolsIntegrationData as serviceGetToolsIntegrationData,
 type ToolsIntegrationContext,
 type ToolSourceText,
 type ToolsIntegrationData
} from "@/lib/services/tools.service";



export async function getIntegratedMiniDrillQuestions(context?: ToolsIntegrationContext) {
 return serviceGetIntegratedMiniDrillQuestions(context);
}

export async function getIntegratedCounterQuestions(context?: ToolsIntegrationContext) {
 return serviceGetIntegratedCounterQuestions(context);
}

export async function getIntegratedShadowingPresets(context?: ToolsIntegrationContext) {
 return serviceGetIntegratedShadowingPresets(context);
}

export async function getLibraryTextForTool(context?: ToolsIntegrationContext): Promise<ToolSourceText | null> {
 return serviceGetLibraryTextForTool(context);
}

export async function getToolsIntegrationData(): Promise<ToolsIntegrationData> {
 return serviceGetToolsIntegrationData();
}
