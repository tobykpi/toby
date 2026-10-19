(() => {
  'use strict';
  const card = document.querySelector('#gamdom-edit');
  if (!card) return;
  const note = card.querySelector('[data-metrics-status]');
  const fields = ['views', 'likes', 'replies'];
  const interval = 5 * 60 * 1000;
  const formatter = new Intl.NumberFormat('en-US');
  let busy = false;
  let lastAttempt = 0;
  let lastSuccess = '';

  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    lastAttempt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('https://api.fxtwitter.com/GamdomTopluluk/status/2088979699053543474', {
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Metrics request failed');
      const payload = await response.json();
      const tweet = payload.tweet;
      if (payload.code !== 200 || tweet?.id !== '2088979699053543474' ||
          !fields.every(field => Number.isSafeInteger(tweet[field]) && tweet[field] >= 0)) {
        throw new Error('Incomplete metrics');
      }
      for (const field of fields) {
        card.querySelector(`[data-metric="${field}"]`).textContent = formatter.format(tweet[field]);
      }
      lastSuccess = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      note.textContent = `Public counts via FxTwitter. Last checked ${lastSuccess}. Refreshes every 5 minutes; source may cache counts.`;
      note.dataset.state = 'updated';
    } catch {
      note.textContent = lastSuccess
        ? `Refresh unavailable. Showing counts last checked ${lastSuccess}. Retrying automatically.`
        : 'Live refresh unavailable. Showing the October 19, 2026 snapshot. Retrying automatically.';
      note.dataset.state = 'unavailable';
    } finally {
      clearTimeout(timeout);
      busy = false;
    }
  }

  refresh();
  setInterval(refresh, interval);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastAttempt >= interval) refresh();
  });
})();