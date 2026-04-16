/** Trigger device vibration (works on Android; silently no-ops on iOS/desktop) */
export function haptic(pattern: number | number[] = 8) {
  try { navigator.vibrate?.(pattern); } catch {}
}
