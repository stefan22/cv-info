import { create } from 'zustand';

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<Object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        del: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
  typeof window !== 'undefined' && window.puter ? window.puter : null;

const CREDIT_ERROR_KEYWORDS = [
  'usage-limited-chat',
  'usage limit',
  'permission denied',
  'insufficient',
  'insufficient_funds',
  'credit',
  'allowance',
  'ai usage limit',
  'funding',
  'low balance',
  'not enough funding',
  '402',
];

const PUTER_BILLING_MODAL_TAG = 'usage-limit-dialog';

const PUTER_BILLING_MODAL_KEYWORDS = [
  'low balance',
  'not enough funding',
  'please upgrade',
];

const GENERIC_ANALYSIS_ERROR =
  'Failed to analyse CV. Please try again.';

export const CREDIT_ERROR_HEADING = 'AI Puter Credits Exhausted';

export const CREDIT_ERROR_PARAGRAPH_1 =
  'Your Puter account has run out of free AI credits. Add credits at puter.com or wait for your monthly allowance to reset, then try again.';

export const CREDIT_ERROR_PARAGRAPH_2 =
  "Our application is 100% free. It uses your Puter's free AI allowance to analyse your CV. This is a limitation of the Puter.com service. If you have another Gmail account, you may be able to use it to continue with your CV analysis.";

export const CREDIT_ERROR_MESSAGE = `${CREDIT_ERROR_PARAGRAPH_1} ${CREDIT_ERROR_PARAGRAPH_2}`;

let billingModalObserverInstalled = false;
let billingLimitEncountered = false;

function isPuterBillingModalElement(el: Element): boolean {
  if (el.tagName.toLowerCase() === PUTER_BILLING_MODAL_TAG) {
    return true;
  }

  const shadow = el.shadowRoot;
  if (!shadow) {
    return false;
  }

  const text = shadow.textContent?.toLowerCase() ?? '';
  return PUTER_BILLING_MODAL_KEYWORDS.some((keyword) => text.includes(keyword));
}

function removePuterBillingModal(el: Element): void {
  if (el instanceof HTMLElement) {
    billingLimitEncountered = true;
    el.remove();
  }
}

export function takeBillingLimitEncountered(): boolean {
  const seen = billingLimitEncountered;
  billingLimitEncountered = false;
  return seen;
}

function scanForPuterBillingModals(root: ParentNode): void {
  if (root instanceof Element && isPuterBillingModalElement(root)) {
    removePuterBillingModal(root);
    return;
  }

  if ('querySelectorAll' in root) {
    for (const el of root.querySelectorAll(PUTER_BILLING_MODAL_TAG)) {
      removePuterBillingModal(el);
    }
  }

  const elements =
    root instanceof Element || root instanceof Document || root instanceof DocumentFragment ?
      root.querySelectorAll('*')
    : [];

  for (const el of elements) {
    if (isPuterBillingModalElement(el)) {
      removePuterBillingModal(el);
    }
  }
}

export function suppressPuterBillingModals(): void {
  if (typeof document === 'undefined' || billingModalObserverInstalled) {
    return;
  }

  billingModalObserverInstalled = true;

  const start = () => {
    if (!document.body) {
      return;
    }

    scanForPuterBillingModals(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            scanForPuterBillingModals(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
}

export interface ParsedPuterAiError {
  message: string;
  isCreditError: boolean;
}

function extractPuterErrorText(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
    if (obj.error && typeof obj.error === 'object') {
      const nested = obj.error as Record<string, unknown>;
      const parts = [
        nested.delegate,
        nested.message,
        nested.code,
      ].filter((part): part is string => typeof part === 'string');
      if (parts.length > 0) {
        return parts.join(': ');
      }
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

function isCreditRelatedError(text: string): boolean {
  const lower = text.toLowerCase();
  return CREDIT_ERROR_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function createCreditError(): ParsedPuterAiError {
  return {
    message: CREDIT_ERROR_MESSAGE,
    isCreditError: true,
  };
}

export function parsePuterAiError(err: unknown): ParsedPuterAiError {
  const raw = extractPuterErrorText(err);

  if (isCreditRelatedError(raw)) {
    return createCreditError();
  }

  if (import.meta.env.DEV && raw) {
    console.error('[CV analysis]', raw);
  }

  return {
    message: GENERIC_ANALYSIS_ERROR,
    isCreditError: false,
  };
}

export function resolvePuterAiError(err: unknown): ParsedPuterAiError {
  const parsed = parsePuterAiError(err);
  if (parsed.isCreditError) {
    return parsed;
  }
  if (takeBillingLimitEncountered()) {
    return createCreditError();
  }
  return parsed;
}

export const usePuterStore = create<PuterStore>((set, get) => {
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser,
      },
    });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user,
          },
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null,
          },
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to check auth status';
      setError(msg);
      return false;
    }
  };

  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setError(msg);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh user';
      setError(msg);
    }
  };

  const init = (): void => {
    suppressPuterBillingModals();

    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        setError('Puter.js failed to load within 10 seconds');
      }
    }, 10000);
  };

  const write = async (path: string, data: string | File | Blob) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.fs.write(path, data);
  };

  const readDir = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.fs.readdir(path);
  };

  const readFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.fs.read(path);
  };

  const upload = async (files: File[] | Blob[]) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.fs.upload(files);
  };

  const deleteFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.fs.delete(path);
  };

  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string | PuterChatOptions,
    testMode?: boolean,
    options?: PuterChatOptions
  ) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    // return puter.ai.chat(prompt, imageURL, testMode, options);
    return (await puter.ai.chat(
      prompt,
      imageURL,
      testMode,
      options
    )) as Promise<AIResponse | undefined>;
  };

  const feedback = async (path: string, message: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }

    return (await puter.ai.chat(
      [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              puter_path: path,
            },
            {
              type: 'text',
              text: message,
            },
          ],
        },
      ],
      { model: 'claude-sonnet-4' }

      //"claude-3-7-sonnet"
      //"claude-sonnet-4"
    )) as Promise<AIResponse | undefined>;
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };

  const getKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.kv.get(key);
  };

  const setKV = async (key: string, value: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.kv.set(key, value);
  };

  const deleteKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.kv.del(key);
  };

  const listKV = async (pattern: string, returnValues?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    if (returnValues === undefined) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };

  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError('Puter.js not available');
      return;
    }
    return puter.kv.flush();
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    ai: {
      chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
      ) => chat(prompt, imageURL, testMode, options),
      feedback: (path: string, message: string) => feedback(path, message),
      img2txt: (image: string | File | Blob, testMode?: boolean) =>
        img2txt(image, testMode),
    },
    kv: {
      get: (key: string) => getKV(key),
      set: (key: string, value: string) => setKV(key, value),
      delete: (key: string) => deleteKV(key),
      list: (pattern: string, returnValues?: boolean) =>
        listKV(pattern, returnValues),
      flush: () => flushKV(),
    },
    init,
    clearError: () => set({ error: null }),
  };
});
