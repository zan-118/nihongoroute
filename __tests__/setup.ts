import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IndexedDB via idb-keyval
vi.mock('idb-keyval', () => {
  const store = new Map();
  return {
    get: vi.fn(async (key) => store.get(key)),
    set: vi.fn(async (key, val) => store.set(key, val)),
    del: vi.fn(async (key) => store.delete(key)),
    clear: vi.fn(async () => store.clear()),
    entries: vi.fn(async () => Array.from(store.entries())),
  };
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((ev: MessageEvent) => any) | null = null;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(message: any) {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
global.BroadcastChannel = MockBroadcastChannel as any;

// Mock window.speechSynthesis
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    },
    writable: true,
  });
  
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: vi.fn().mockImplementation(() => ({
      text: '',
      lang: '',
      volume: 1,
      rate: 1,
      pitch: 1,
    })),
    writable: true,
  });
}
