/**
 * @file sync-pipeline-engine.ts
 * @description Modul dalam (Deep Module) yang mengapsulasi seluruh alur sinkronisasi data progres belajar:
 * pengolahan debounce timer (2000ms), penyiaran event multi-tab (BroadcastChannel),
 * serta rekonsiliasi Poin XP anti-cheat dari server RPC database.
 */

export const SYNC_CHANNEL_NAME = "nihongoroute_sync";
export const DEFAULT_DEBOUNCE_MS = 2000;

export interface SyncDispatchParams {
 triggerSync: () => Promise<void> | void;
 debounceMs?: number;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Encapsulated Debounce Timer Manager.
 * Cancels pending execution and schedules a new callback.
 *
 * @param callback Sync execution callback.
 * @param delayMs Delay in milliseconds (default 2000ms).
 * @returns Cleanup function to cancel the scheduled timer.
 */
export function scheduleDebouncedSync(
 callback: () => void,
 delayMs: number = DEFAULT_DEBOUNCE_MS
): () => void {
 if (debounceTimer) {
 clearTimeout(debounceTimer);
 }

 debounceTimer = setTimeout(() => {
 debounceTimer = null;
 callback();
 }, delayMs);

 return () => {
 if (debounceTimer) {
 clearTimeout(debounceTimer);
 debounceTimer = null;
 }
 };
}

/**
 * Cancel any pending scheduled debounced sync timer immediately.
 */
export function cancelPendingSyncTimer(): void {
 if (debounceTimer) {
 clearTimeout(debounceTimer);
 debounceTimer = null;
 }
}

/**
 * Broadcast sync completion signal across browser tabs using BroadcastChannel API.
 *
 * @param message Event message payload (default "SYNC_COMPLETE").
 */
export function broadcastMultiTabSync(message: string = "SYNC_COMPLETE"): void {
 if (typeof window !== "undefined" && "BroadcastChannel" in window) {
 try {
 const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
 channel.postMessage(message);
 channel.close();
 } catch (error) {
 console.warn("[MultiTabSyncBroadcaster] Gagal menyiarkan pesan:", error);
 }
 }
}

/**
 * Anti-Cheat Reconciliation:
 * Reconcile local XP state with the accepted_xp validated by Supabase RPC algorithm.
 *
 * @param acceptedXp Accepted XP value returned by database RPC.
 * @param updateLocalXp Function callback to sync local Zustand store.
 */
export function reconcileAcceptedXp(
 acceptedXp: number | undefined,
 updateLocalXp: (xp: number) => void
): void {
 if (acceptedXp !== undefined && typeof acceptedXp === "number" && !isNaN(acceptedXp)) {
 updateLocalXp(acceptedXp);
 }
}

/**
 * Seam utama untuk memicu eksekusi alur sinkronisasi (dispatchSyncEvent).
 * Mengombinasikan penjadwalan timer debounce dan eksekusi callback sinkronisasi.
 *
 * @param params Parameter trigger sync dan opsi debounce delay.
 */
export function dispatchSyncEvent(params: SyncDispatchParams): () => void {
 const delay = params.debounceMs ?? DEFAULT_DEBOUNCE_MS;
 return scheduleDebouncedSync(() => {
 void params.triggerSync();
 }, delay);
}

export interface ProgressSyncEngineOptions {
 debounceMs?: number;
 channelName?: string;
 onSyncComplete?: (message: string) => void;
}

/**
 * Deep Module Engine murni untuk mengelola seluruh siklus hidup sinkronisasi progres:
 * debounce queueing, anti-cheat XP reconciliation, dan multi-tab messaging via BroadcastChannel.
 */
export class ProgressSyncEngine {
 private debounceMs: number;
 private channelName: string;
 private timer: ReturnType<typeof setTimeout> | null = null;
 private isSyncingState: boolean = false;
 private lastSyncedAtState: number | null = null;
 private broadcastChannel: BroadcastChannel | null = null;
 private onSyncCompleteCallback?: (message: string) => void;

 constructor(options: ProgressSyncEngineOptions = {}) {
 this.debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
 this.channelName = options.channelName ?? SYNC_CHANNEL_NAME;
 this.onSyncCompleteCallback = options.onSyncComplete;

 this.initBroadcastListener();
 }

 private initBroadcastListener(): void {
 if (typeof window !== "undefined" && "BroadcastChannel" in window) {
 try {
 this.broadcastChannel = new BroadcastChannel(this.channelName);
 this.broadcastChannel.onmessage = (event) => {
 if (typeof event.data === "string" && this.onSyncCompleteCallback) {
 this.onSyncCompleteCallback(event.data);
 }
 };
 } catch (error) {
 console.warn("[ProgressSyncEngine] BroadcastChannel error:", error);
 }
 }
 }

 public isSyncing(): boolean {
 return this.isSyncingState;
 }

 public getLastSyncedAt(): number | null {
 return this.lastSyncedAtState;
 }

 public scheduleSync(syncTask: () => Promise<void> | void): () => void {
 this.cancelScheduledSync();

 this.timer = setTimeout(() => {
 this.timer = null;
 this.executeSync(syncTask);
 }, this.debounceMs);

 return () => this.cancelScheduledSync();
 }

 public cancelScheduledSync(): void {
 if (this.timer) {
 clearTimeout(this.timer);
 this.timer = null;
 }
 }

 public async executeSync(syncTask: () => Promise<void> | void): Promise<void> {
 this.isSyncingState = true;
 try {
 await syncTask();
 this.lastSyncedAtState = Date.now();
 this.broadcastSync("SYNC_COMPLETE");
 } finally {
 this.isSyncingState = false;
 }
 }

 public broadcastSync(message: string = "SYNC_COMPLETE"): void {
 broadcastMultiTabSync(message);
 }

 public reconcileAntiCheatXp(
 acceptedXp: number | undefined,
 updateLocalXp: (xp: number) => void
 ): void {
 reconcileAcceptedXp(acceptedXp, updateLocalXp);
 }

 public dispose(): void {
 this.cancelScheduledSync();
 if (this.broadcastChannel) {
 this.broadcastChannel.close();
 this.broadcastChannel = null;
 }
 }
}

