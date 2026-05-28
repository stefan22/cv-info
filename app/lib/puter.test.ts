import { afterEach, describe, expect, it, vi } from 'vitest';

import { parsePuterAiError } from '~/lib/puter';

describe('parsePuterAiError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects funding-related credit errors', () => {
    const result = parsePuterAiError(
      new Error('Available funding is insufficient for this request.')
    );

    expect(result.isCreditError).toBe(true);
    expect(result.message).toContain('run out of free AI credits');
  });

  it('detects usage-limited-chat credit errors', () => {
    const result = parsePuterAiError(new Error('usage-limited-chat'));

    expect(result.isCreditError).toBe(true);
  });

  it('detects low balance credit errors', () => {
    const result = parsePuterAiError(
      new Error('Low Balance: Your account has not enough funding')
    );

    expect(result.isCreditError).toBe(true);
  });

  it('returns a sanitized message for internal SDK errors', () => {
    const result = parsePuterAiError(
      new Error('puter.kv.delete is not a function')
    );

    expect(result.isCreditError).toBe(false);
    expect(result.message).toBe('Failed to analyse CV. Please try again.');
    expect(result.message).not.toContain('puter.kv.delete');
  });

  it('does not expose raw error text in the returned message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = parsePuterAiError(new Error('some internal sdk failure'));

    expect(result.message).toBe('Failed to analyse CV. Please try again.');
    expect(result.message).not.toContain('some internal sdk failure');

    consoleSpy.mockRestore();
  });
});
