import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../src/utils';
import ScrapeService from '../src/services/scrape-service';

describe('sanitizeFilename', () => {
  it('rejects invalid names', () => {
    expect(() => sanitizeFilename('../secret')).toThrow();
    expect(() => sanitizeFilename('foo/../bar')).toThrow();
    expect(() => sanitizeFilename('foo\\bar')).toThrow();
  });

  it('allows valid names', () => {
    expect(sanitizeFilename('valid.json')).toBe('valid.json');
  });
});

describe('ScrapeService filename validation', () => {
  const service = new ScrapeService();

  it('readFile throws on invalid name', async () => {
    await expect(service.readFile('../secret')).rejects.toThrow('Invalid file name');
  });

  it('saveFile throws on invalid name', async () => {
    await expect(service.saveFile('..\\secret', Buffer.from(''))).rejects.toThrow('Invalid file name');
  });
});
