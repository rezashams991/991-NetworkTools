/**
 * Ping Tool - Simulates ping with multiple requests
 * Uses fetch to measure latency
 */

export default function run(container) {
  container.innerHTML = `
    <h3>📶 Ping</h3>
    <p>Measure latency to a server.</p>
    <div class="converter-row">
      <input type="text" id="target" value="google.com" style="width:300px;" />
      <button id="btn">Ping</button>
    </div>
    <div id="result"></div>
  `;

  const targetInput = container.querySelector('#target');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');

  async function ping() {
    let target = targetInput.value.trim();
    if (!target) { result.textContent = '⚠️ Enter a target.'; return; }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    result.textContent = '⏳ Pinging... (3 packets)';
    btn.disabled = true;

    const latencies = [];
    const packetCount = 3;
    const timeout = 5000;

    for (let i = 1; i <= packetCount; i++) {
      try {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        await fetch(target, { signal: controller.signal, mode: 'no-cors' });
        clearTimeout(timeoutId);
        const latency = performance.now() - start;
        latencies.push(latency);
        result.textContent = `📡 Packet ${i}/${packetCount}: ${latency.toFixed(0)}ms`;
      } catch (err) {
        if (err.name === 'AbortError') {
          result.textContent = `📡 Packet ${i}/${packetCount}: Timeout`;
        } else {
          result.textContent = `📡 Packet ${i}/${packetCount}: Error`;
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }

    if (latencies.length === 0) {
      result.textContent = `❌ All packets lost. Server may be down or blocked.`;
      result.style.color = '#dc3545';
    } else {
      const avg = latencies.reduce((a,b) => a+b, 0) / latencies.length;
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);
      const loss = ((packetCount - latencies.length) / packetCount * 100).toFixed(0);
      result.textContent = `✅ Ping results:\nPackets: ${latencies.length}/${packetCount} received\nLoss: ${loss}%\nMin: ${min.toFixed(0)}ms\nAvg: ${avg.toFixed(0)}ms\nMax: ${max.toFixed(0)}ms`;
      result.style.color = '#28a745';
      result.style.whiteSpace = 'pre-wrap';
    }
    btn.disabled = false;
  }

  btn.onclick = ping;
  targetInput.onkeyup = e => { if (e.key === 'Enter') ping(); };
}