import { Timestamp } from 'firebase-admin/firestore';

function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value instanceof Timestamp ||
    (typeof value === 'object' &&
      value !== null &&
      typeof (value as Timestamp).toDate === 'function')
  );
}

function isTimestampLikeObject(value: unknown): value is { _seconds?: number; seconds?: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('_seconds' in value || 'seconds' in value)
  );
}

export function serializeForClient<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (isFirestoreTimestamp(value)) {
    return value.toDate().toISOString() as T;
  }

  if (isTimestampLikeObject(value)) {
    const seconds = value._seconds ?? value.seconds ?? 0;
    return new Date(seconds * 1000).toISOString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForClient(item)) as T;
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        serializeForClient(nested),
      ])
    ) as T;
  }

  return value;
}

export function serializeFirestoreDoc<T extends Record<string, unknown>>(
  id: string,
  data: T
): T & { id: string } {
  return serializeForClient({ id, ...data });
}
