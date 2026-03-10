export function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_campaign: params.get('utm_campaign') || null,
  };
}
