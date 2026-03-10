import { supabase } from "@/integrations/supabase/client";
import { getUtmParams } from "./utm";

export async function trackEvent(
  event_name: string,
  page: string,
  submission_id?: string | null
) {
  const utm = getUtmParams();
  try {
    await supabase.from("events").insert({
      event_name,
      page,
      submission_id: submission_id || null,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  } catch (e) {
    console.error("[trackEvent]", e);
  }
}
