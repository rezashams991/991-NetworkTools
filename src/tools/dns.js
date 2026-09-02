/**
 * DNS Lookup Tool - Uses Cloudflare DNS-over-HTTPS (DoH) API.
 * Fully CORS-enabled and reliable directly from the browser.
 */

export default function run(container) {
  container.innerHTML = `
    <h3>🌐 DNS Lookup</h3>
    <p>Get DNS records for a domain using Cloudflare DNS API.</p>
    <div class="converter-row">
      <input type="text" id="domain" value="google.com" style="width:300px;" />
      <select id="type">
        <option value="A">A</option>
        <option value="AAAA">AAAA</option>
        <option value="MX">MX</option>
        <option value="TXT">TXT</option>
        <option value="CNAME">CNAME</option>
        <option value="NS">NS</option>
      </select>
      <button id="btn">Lookup</button>
    </div>
    <div id="result"></div>
  `;

  const domainInput = container.querySelector('#domain');
  const typeSelect = container.querySelector('#type');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');

  async function lookup() {
    const domain = domainInput.value.trim();
    if (!domain) { result.textContent = '⚠️ Enter a domain.'; return; }

    const type = typeSelect.value;
    result.textContent = '⏳ Looking up...';
    btn.disabled = true;

    try {
      // Fetch DNS record using Cloudflare DoH API JSON interface
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/dns-json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.Answer || data.Answer.length === 0) {
        result.textContent = `ℹ️ No ${type} records found for ${domain}`;
        result.style.color = '#ffc107';
        return;
      }

      const records = data.Answer.map(r => `${r.name} → ${r.data}`).join('\n');

      result.textContent = `✅ DNS ${type} records for ${domain}:\n${records}`;
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
  domainInput.onkeyup = e => { if (e.key === 'Enter') lookup(); };
}