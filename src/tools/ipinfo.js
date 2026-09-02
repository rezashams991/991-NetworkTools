/**
 * IP Info Tool - Uses ipwho.is API.
 * Free, HTTPS-supported, and natively allows CORS without proxies.
 */

export default function run(container) {
  container.innerHTML = `
    <h3>📍 IP Info</h3>
    <p>Get information about an IP address or your current IP.</p>
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
    // ipwho.is supports both client IP (empty endpoint) and target IP endpoints over HTTPS
    const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/';
    
    result.textContent = '⏳ Looking up...';
    btn.disabled = true;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch IP details');
      }

      const info = [
        `IP: ${data.ip}`,
        `Type: ${data.type || 'N/A'}`,
        `Country: ${data.country} (${data.country_code})`,
        `Region: ${data.region}`,
        `City: ${data.city}`,
        `ISP: ${data.connection ? data.connection.isp : 'N/A'}`,
        `ASN: ${data.connection ? data.connection.asn : 'N/A'}`,
        `Timezone: ${data.timezone ? data.timezone.id : 'N/A'}`,
        `Lat/Long: ${data.latitude}, ${data.longitude}`
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