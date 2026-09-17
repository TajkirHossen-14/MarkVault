// @ts-check
// Deliberately external and blocking: no inline-script exception in the CSP.
(() => {
  let theme = 'dark';
  const test = new URLSearchParams(location.search).get('test');
  const key = test && /^mvtest-[a-z0-9-]+$/.test(test) ? `mv:prefs:v1:${test}` : 'mv:prefs:v1';
  try { theme = JSON.parse(localStorage.getItem(key) || '{}').theme || 'dark'; } catch {}
  const preview = new URLSearchParams(location.search).get('theme');
  if (preview === 'light' || preview === 'dark') theme = preview;
  const resolved = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#141722' : '#f5f6fa');
})();
