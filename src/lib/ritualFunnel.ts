// Canonical ritual funnel events.
// Wraps trackEvent so client-side event names stay consistent.
// Note: audio_generated / audio_failed / audio_blocked_* are emitted SERVER-SIDE
// by the generate-audio edge function — don't duplicate them here.
import { trackEvent } from "@/lib/events";

export const RITUAL_EVENTS = {
  STARTED: "ritual_started",
  DREAM_CAPTURED: "dream_captured",
  SCRIPT_GENERATED: "script_generated",
  AUDIO_REQUESTED: "audio_requested",
  AUDIO_PLAYED: "audio_played",
} as const;

export type RitualEvent = (typeof RITUAL_EVENTS)[keyof typeof RITUAL_EVENTS];

export const trackRitual = (event: RitualEvent, submissionId?: string) =>
  trackEvent(event, "ritual", submissionId);
