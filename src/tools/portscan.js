/**
 * Port Scanner Tool - Scans common ports on a host
 * Uses fetch with timeout to check if port is open
 */

import { fetchWithTimeout } from '../core/apiClient.js';

export default function run(container) {
  container.innerHTML = `
    <h3>🔍 Port Scanner</h3>
    <p>Scan common ports on a host (HTTP/HTTPS only for CORS).</p>
    <div class="converter-row">
      <input type="text" id="host" value="example.com" style="width:300px;" />
      <button id="btn">Scan</button>
    </div>
    <div id="result"></div>
    <div id="portResult" style="margin-top:0.5rem;"></div>
  `;

  const hostInput = container.querySelector('#host');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');
  const portResult = container.querySelector('#portResult');

  async function scan() {
    let host = hostInput.value.trim();
    if (!host) { result.textContent = '⚠️ Enter a host.'; return; }
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      host = 'https://' + host;
    }

    // Common ports to scan (only HTTP/HTTPS works in browser due to CORS)
    const ports = [
      { port: 80, name: 'HTTP' },
      { port: 443, name: 'HTTPS' },
      { port: 8080, name: 'HTTP-Alt' },
      { port: 8443, name: 'HTTPS-Alt' },
      { port: 3000, name: 'Dev Server' },
      { port: 5000, name: 'Dev Server' },
      { port: 8000, name: 'Dev Server' }
    ];

    result.textContent = '⏳ Scanning ports... (this may take a moment)';
    btn.disabled = true;
    portResult.innerHTML = '';

    const openPorts = [];

    for (const p of ports) {
      try {
        const url = `${host.split(':')[0]}://${host.split('/')[2] || host.split('/')[0]}:${p.port}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const start = performance.now();
        await fetch(url, { signal: controller.signal, mode: 'no-cors' });
        clearTimeout(timeoutId);
        const latency = (performance.now() - start).toFixed(0);

        // no-cors mode doesn't give response, but if it doesn't throw, it's reachable
        openPorts.push(`${p.port} (${p.name}) - ${latency}ms`);
        portResult.innerHTML += `<div style="color:#28a745;">✅ Port ${p.port} (${p.name}) - open</div>`;

      } catch (err) {
        if (err.name === 'AbortError') {
          portResult.innerHTML += `<div style="color:#ffc107;">⏱️ Port ${p.port} (${p.name}) - timeout</div>`;
        } else {
          portResult.innerHTML += `<div style="color:#dc3545;">❌ Port ${p.port} (${p.name}) - closed</div>`;
        }
      }
    }

    if (openPorts.length === 0) {
      result.textContent = `ℹ️ No open ports found on ${host}`;
      result.style.color = '#ffc107';
    } else {
      result.textContent = `✅ Open ports on ${host}: ${openPorts.join(', ')}`;
      result.style.color = '#28a745';
    }

    btn.disabled = false;
  }

  btn.onclick = scan;
  hostInput.onkeyup = e => { if (e.key === 'Enter') scan(); };
}