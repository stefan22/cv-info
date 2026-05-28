import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('suppressPuterBillingModals', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  async function flushDomUpdates(): Promise<void> {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  }

  it('removes usage-limit-dialog elements from the DOM', async () => {
    const { suppressPuterBillingModals } = await import('~/lib/puter');
    const dialog = document.createElement('usage-limit-dialog');
    document.body.appendChild(dialog);

    suppressPuterBillingModals();
    await flushDomUpdates();

    expect(document.querySelector('usage-limit-dialog')).toBeNull();
  });

  it('removes usage-limit-dialog elements added after the observer starts', async () => {
    const { suppressPuterBillingModals } = await import('~/lib/puter');
    suppressPuterBillingModals();

    const dialog = document.createElement('usage-limit-dialog');
    document.body.appendChild(dialog);
    await flushDomUpdates();

    expect(document.querySelector('usage-limit-dialog')).toBeNull();
  });

  it('records when a billing modal is removed', async () => {
    const { suppressPuterBillingModals, takeBillingLimitEncountered } =
      await import('~/lib/puter');
    suppressPuterBillingModals();

    const dialog = document.createElement('usage-limit-dialog');
    document.body.appendChild(dialog);
    await flushDomUpdates();

    expect(takeBillingLimitEncountered()).toBe(true);
    expect(takeBillingLimitEncountered()).toBe(false);
  });
});

describe('parsePuterAiError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects funding-related credit errors', async () => {
    const { parsePuterAiError } = await import('~/lib/puter');
    const result = parsePuterAiError(
      new Error('Available funding is insufficient for this request.')
    );

    expect(result.isCreditError).toBe(true);
    expect(result.message).toContain('run out of free AI credits');
  });

  it('detects usage-limited-chat credit errors', async () => {
    const { parsePuterAiError } = await import('~/lib/puter');
    const result = parsePuterAiError(new Error('usage-limited-chat'));

    expect(result.isCreditError).toBe(true);
  });

  it('detects low balance credit errors', async () => {
    const { parsePuterAiError } = await import('~/lib/puter');
    const result = parsePuterAiError(
      new Error('Low Balance: Your account has not enough funding')
    );

    expect(result.isCreditError).toBe(true);
  });

  it('returns a sanitized message for internal SDK errors', async () => {
    const { parsePuterAiError } = await import('~/lib/puter');
    const result = parsePuterAiError(
      new Error('puter.kv.delete is not a function')
    );

    expect(result.isCreditError).toBe(false);
    expect(result.message).toBe('Failed to analyse CV. Please try again.');
    expect(result.message).not.toContain('puter.kv.delete');
  });

  it('does not expose raw error text in the returned message', async () => {
    const { parsePuterAiError } = await import('~/lib/puter');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = parsePuterAiError(new Error('some internal sdk failure'));

    expect(result.message).toBe('Failed to analyse CV. Please try again.');
    expect(result.message).not.toContain('some internal sdk failure');

    consoleSpy.mockRestore();
  });
});

describe('resolvePuterAiError', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  async function flushDomUpdates(): Promise<void> {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  }

  it('returns a credit error when a billing modal was suppressed', async () => {
    const { suppressPuterBillingModals, resolvePuterAiError } =
      await import('~/lib/puter');
    suppressPuterBillingModals();

    const dialog = document.createElement('usage-limit-dialog');
    document.body.appendChild(dialog);
    await flushDomUpdates();

    const result = resolvePuterAiError(new Error('random failure'));

    expect(result.isCreditError).toBe(true);
    expect(result.message).toContain('run out of free AI credits');
  });

  it('returns a generic error when no billing modal was suppressed', async () => {
    const { resolvePuterAiError } = await import('~/lib/puter');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = resolvePuterAiError(new Error('some internal sdk failure'));

    expect(result.isCreditError).toBe(false);
    expect(result.message).toBe('Failed to analyse CV. Please try again.');

    consoleSpy.mockRestore();
  });
});
