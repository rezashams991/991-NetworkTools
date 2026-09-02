/**
 * IP Info Tool - Using ip-api.com (CORS-enabled)
 * IMPORTANT: Do NOT add custom headers to the request
 */

export default function run(container) {
  container.innerHTML = `
    <h3>📍 IP Info</h3>
    <p>Get information about an IP address.</p>
    <div class="converter-row">
      <input type="text" id="ip" placeholder="Enter IP or leave blank for your IP" style="width:300px;" />
      <button id="btn">Lookup</button>
    </div>
    <div id="result"></div>
  `;

  const ipInput = container.querySelector('#ip');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');

  async function lookup() {
    const ip = ipInput.value.trim();
    // Use HTTPS to avoid mixed-content blocking
    const url = ip ? `https://ip-api.com/json/${encodeURIComponent(ip)}` : 'https://ip-api.com/json/';
    
    result.textContent = '⏳ Looking up...';
    btn.disabled = true;

    try {
      // ✅ DO NOT add custom headers - just a simple fetch
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'fail') {
        throw new Error(data.message || 'IP not found');
      }

      const info = [
        `IP: ${data.query}`,
        `Country: ${data.country} (${data.countryCode})`,
        `Region: ${data.regionName}`,
        `City: ${data.city}`,
        `ISP: ${data.isp}`,
        `Organization: ${data.org}`,
        `Timezone: ${data.timezone}`,
        `Lat/Long: ${data.lat}, ${data.lon}`
      ].join('\n');

      result.textContent = `✅ ${info}`;
      result.style.color = '#28a745';
      result.style.whiteSpace = 'pre-wrap';
    } catch (err) {
      result.textContent = `❌ Error: ${err.message}`;
      result.style.color = '#dc3545';
    } finally {
      btn.disabled = false;
    }
  }

  btn.onclick = lookup;
  ipInput.onkeyup = e => { if (e.key === 'Enter') lookup(); };
}