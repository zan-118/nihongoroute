"use server";

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
