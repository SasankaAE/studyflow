export function generateReferenceNumber(userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userFragment = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `SF-${userFragment}-${timestamp}`;
}