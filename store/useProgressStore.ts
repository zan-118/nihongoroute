import { useAuthStore } from "./useAuthStore";
import { useUserStore } from "./useUserStore";
import { useSRSStore } from "./useSRSStore";
import { useUIStore } from "./useUIStore";
import { UserProgress } from "./types";

/**
 * @deprecated useProgressStore is now split into useAuthStore, useUserStore, useSRSStore, and useUIStore.
 * This facade is maintained for backward compatibility.
 */
export const useProgressStore = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (selector: (state: any) => any = (s) => s) => {
    // This is a bit tricky because Zustand stores are individual hooks.
    // A selector that expects a combined state won't work easily.
    // However, most components use specific selectors.
    
    // For now, we'll return a proxy or just keep the old implementation but sync it?
    // Actually, the best way to "split" while keeping the same hook is to use slices.
    // But since the user asked for separate stores, I will implement a hook that combines them.
    
    const auth = useAuthStore();
    const user = useUserStore();
    const srs = useSRSStore();
    const ui = useUIStore();

    const combinedState = {
      isAuthenticated: auth.isAuthenticated,
      progress: {
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        todayReviewCount: user.todayReviewCount,
        lastStudyDate: user.lastStudyDate,
        studyDays: user.studyDays,
        inventory: user.inventory,
        srs: srs.srs,
        notifications: ui.notifications,
        settings: ui.settings,
      } as UserProgress,
      loading: ui.loading,
      dirtySrs: srs.dirtySrs,
      
      // Actions
      setAuth: auth.setAuth,
      setLoading: ui.setLoading,
      updateProgress: srs.updateProgress,
      updateProfileName: user.updateProfileName,
      addXP: user.addXP,
      addToSRS: srs.addToSRS,
      removeFromSRS: srs.removeFromSRS,
      addNotification: ui.addNotification,
      markNotificationAsRead: ui.markNotificationAsRead,
      clearNotifications: ui.clearNotifications,
      clearDirtySrs: srs.clearDirtySrs,
      setDirtySrs: srs.setDirtySrs,
      mergeProgress: srs.mergeProgress,
      toggleNotifications: ui.toggleNotifications,
      buyStreakFreeze: user.buyStreakFreeze,
      resetProgress: () => {
        auth.resetAuth();
        user.resetUser();
        srs.resetSRS();
        ui.resetUI();
      }
    };

    return selector(combinedState);
  },
  {
    // Static methods for getState()
    getState: () => {
      const auth = useAuthStore.getState();
      const user = useUserStore.getState();
      const srs = useSRSStore.getState();
      const ui = useUIStore.getState();

      return {
        isAuthenticated: auth.isAuthenticated,
        progress: {
          name: user.name,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          todayReviewCount: user.todayReviewCount,
          lastStudyDate: user.lastStudyDate,
          studyDays: user.studyDays,
          inventory: user.inventory,
          srs: srs.srs,
          notifications: ui.notifications,
          settings: ui.settings,
        } as UserProgress,
        loading: ui.loading,
        dirtySrs: srs.dirtySrs,
        
        // Actions
        setAuth: auth.setAuth,
        setLoading: ui.setLoading,
        updateProgress: srs.updateProgress,
        updateProfileName: user.updateProfileName,
        addXP: user.addXP,
        addToSRS: srs.addToSRS,
        removeFromSRS: srs.removeFromSRS,
        addNotification: ui.addNotification,
        markNotificationAsRead: ui.markNotificationAsRead,
        clearNotifications: ui.clearNotifications,
        clearDirtySrs: srs.clearDirtySrs,
        setDirtySrs: srs.setDirtySrs,
        mergeProgress: srs.mergeProgress,
        toggleNotifications: ui.toggleNotifications,
        buyStreakFreeze: user.buyStreakFreeze,
      };
    },
    subscribe: (listener: (state: unknown, prevState: unknown) => void) => {
      // This is harder to implement for combined stores.
      // For now, we'll just subscribe to all and notify.
      const stores = [useAuthStore, useUserStore, useSRSStore, useUIStore];
      return stores.map(s => s.subscribe(listener));
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as unknown as any;

export const useProgress = useProgressStore;
export type { UserProgress };

