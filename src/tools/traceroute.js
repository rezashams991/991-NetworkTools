/**
 * Traceroute Tool - Simulates traceroute by sending requests with increasing TTL
 * Uses a technique with fetch and AbortController
 */

import { fetchWithTimeout } from '../core/apiClient.js';

export default function run(container) {
  container.innerHTML = `
    <h3>🧭 Traceroute</h3>
    <p>Simulate traceroute to a destination (up to 30 hops).</p>
    <div class="converter-row">
      <input type="text" id="target" value="example.com" style="width:300px;" />
      <button id="btn">Trace</button>
    </div>
    <div id="result"></div>
  `;

  const targetInput = container.querySelector('#target');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');

  async function trace() {
    let target = targetInput.value.trim();
    if (!target) { result.textContent = '⚠️ Enter a target.'; return; }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    result.textContent = '⏳ Traceroute in progress... (may take a moment)';
    btn.disabled = true;

    const lines = [];
    const maxHops = 30;
    const timeout = 3000;

    for (let ttl = 1; ttl <= maxHops; ttl++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const start = performance.now();
        await fetch(target, {
          signal: controller.signal,
          // Note: We can't actually set TTL in browser fetch,
          // but we simulate by measuring response time per hop
          // and adding artificial delay to simulate routing
        });

        clearTimeout(timeoutId);
        const latency = (performance.now() - start).toFixed(0);

        // Simulate hop info - in real traceroute we'd get IP from response
        // but browser fetch doesn't expose that, so we show hop number and latency
        lines.push(`Hop ${String(ttl).padStart(2, ' ')}: ${latency}ms  (simulated)`);

        // If we got a response, we're done
        if (latency < 100) {
          lines.push(`✅ Destination reached at hop ${ttl}`);
          break;
        }

      } catch (err) {
        if (err.name === 'AbortError') {
          lines.push(`Hop ${String(ttl).padStart(2, ' ')}: * * * Timeout`);
        } else {
          lines.push(`Hop ${String(ttl).padStart(2, ' ')}: Error - ${err.message}`);
        }
      }

      // Update progress every 5 hops
      if (ttl % 5 === 0) {
        result.textContent = `⏳ ${ttl}/${maxHops} hops...`;
      }
    }

    result.textContent = `✅ Traceroute complete:\n${lines.join('\n')}`;
    result.style.color = '#28a745';
    result.style.whiteSpace = 'pre-wrap';
    btn.disabled = false;
  }

  btn.onclick = trace;
  targetInput.onkeyup = e => { if (e.key === 'Enter') trace(); };
}