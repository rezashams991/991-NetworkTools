/**
 * API Client with CORS proxy fallback
 */

// Try primary URL, fallback to proxy if fails
async function fetchWithCORS(url, options = {}) {
  const proxies = [
    url, // direct
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url.replace(/^https?:\/\//, '')}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        ...options,
        headers: { ...options.headers, 'Content-Type': 'application/json' }
      });
      if (!response.ok) continue;
      const data = await response.json();
      return data;
    } catch (e) {
      continue;
    }
  }
  throw new Error('All API endpoints failed. Please check your internet connection.');
}

export async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Request timeout');
    throw err;
  }
}

export { fetchWithCORS };