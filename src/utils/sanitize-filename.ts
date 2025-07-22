export default function sanitizeFilename(name: string): string {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Invalid file name');
  }
  return name;
}
