import { describe, it, expect } from 'vitest';
import { isDisposable, isDisposableBulk, isDomainDisposable, extractDomain, createIsDisposable } from '../src/index';

describe('isDisposable', () => {
  describe('known disposable domains', () => {
    const disposableDomains = [
      'mailinator.com',
      'guerrillamail.com',
      'yopmail.com',
      'temp-mail.org',
      '10minutemail.com',
      'fakeinbox.com',
      'sharklasers.com',
      'guerrillamailblock.com',
      'grr.la',
    ];

    for (const domain of disposableDomains) {
      it(`should detect ${domain} as disposable`, () => {
        expect(isDisposable(`test@${domain}`)).toBe(true);
      });
    }
  });

  describe('known safe domains', () => {
    const safeDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'protonmail.com',
      'icloud.com',
      'hotmail.com',
      'hey.com',
      'fastmail.com',
    ];

    for (const domain of safeDomains) {
      it(`should detect ${domain} as safe`, () => {
        expect(isDisposable(`user@${domain}`)).toBe(false);
      });
    }
  });

  describe('case insensitivity', () => {
    it('should handle uppercase domains', () => {
      expect(isDisposable('test@MAILINATOR.COM')).toBe(true);
    });

    it('should handle mixed case', () => {
      expect(isDisposable('Test@MailInator.Com')).toBe(true);
    });

    it('should handle uppercase safe domains', () => {
      expect(isDisposable('user@GMAIL.COM')).toBe(false);
    });
  });

  describe('wildcard matching', () => {
    it('should match wildcard subdomain patterns', () => {
      expect(isDisposable('user@sub.33mail.com')).toBe(true);
    });

    it('should match base wildcard domain', () => {
      expect(isDisposable('user@33mail.com')).toBe(true);
    });

    it('should match deep subdomain wildcard', () => {
      expect(isDisposable('user@deep.sub.guerrillamailblock.com')).toBe(true);
    });
  });

  describe('invalid email handling', () => {
    it('should return false for empty string', () => {
      expect(isDisposable('')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isDisposable(null as unknown as string)).toBe(false);
      expect(isDisposable(undefined as unknown as string)).toBe(false);
    });

    it('should return false for email without @', () => {
      expect(isDisposable('notanemail')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(isDisposable('user@')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(isDisposable('user @gmail.com')).toBe(false);
    });
  });

  describe('email with subdomains', () => {
    it('should handle subdomain of disposable domain', () => {
      // sub.mailinator.com may or may not be in the list,
      // but wildcard patterns should catch known ones
      const result = isDisposable('user@sub.sharklasers.com');
      expect(result).toBe(true);
    });
  });
});

describe('isDisposableBulk', () => {
  it('should check multiple emails', () => {
    const results = isDisposableBulk([
      'test@mailinator.com',
      'user@gmail.com',
      'spam@yopmail.com',
      'real@outlook.com',
    ]);
    expect(results).toEqual([true, false, true, false]);
  });

  it('should handle empty array', () => {
    expect(isDisposableBulk([])).toEqual([]);
  });
});

describe('isDomainDisposable', () => {
  it('should check domain directly', () => {
    expect(isDomainDisposable('mailinator.com')).toBe(true);
    expect(isDomainDisposable('gmail.com')).toBe(false);
  });

  it('should handle empty input', () => {
    expect(isDomainDisposable('')).toBe(false);
  });
});

describe('extractDomain', () => {
  it('should extract domain from valid email', () => {
    expect(extractDomain('user@gmail.com')).toBe('gmail.com');
  });

  it('should return null for invalid email', () => {
    expect(extractDomain('notanemail')).toBeNull();
    expect(extractDomain('')).toBeNull();
  });

  it('should lowercase the domain', () => {
    expect(extractDomain('User@GMAIL.COM')).toBe('gmail.com');
  });
});

describe('createIsDisposable', () => {
  it('should create an API client', () => {
    const checker = createIsDisposable({ apiKey: 'test_key' });
    expect(checker).toHaveProperty('check');
    expect(checker).toHaveProperty('checkBulk');
    expect(checker).toHaveProperty('clearCache');
  });

  it('should handle invalid email in check', async () => {
    const checker = createIsDisposable({ apiKey: 'test_key', apiUrl: 'http://localhost:9999' });
    const result = await checker.check('');
    expect(result.disposable).toBe(false);
    expect(result.reason).toBe('invalid_email');
  });

  it('should fallback to offline mode on network error', async () => {
    const checker = createIsDisposable({ apiKey: 'test_key', apiUrl: 'http://localhost:9999', timeout: 100 });
    const result = await checker.check('test@mailinator.com');
    expect(result.disposable).toBe(true);
    expect(result.reason).toBe('blocklist_match');
  });
});

describe('performance', () => {
  it('should check 10,000 emails in under 100ms', () => {
    const emails = Array.from({ length: 10000 }, (_, i) =>
      i % 2 === 0 ? `user${i}@mailinator.com` : `user${i}@gmail.com`
    );

    const start = performance.now();
    for (const email of emails) {
      isDisposable(email);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
