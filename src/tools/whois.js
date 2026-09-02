/**
 * WhoIs Tool - Using CORS proxy to bypass CORS restrictions
 */

export default function run(container) {
  container.innerHTML = `
    <h3>📋 WhoIs Lookup</h3>
    <p>Get domain registration information (via CORS proxy).</p>
    <div class="converter-row">
      <input type="text" id="domain" value="google.com" style="width:300px;" />
      <button id="btn">Lookup</button>
    </div>
    <div id="result"></div>
  `;

  const domainInput = container.querySelector('#domain');
  const btn = container.querySelector('#btn');
  const result = container.querySelector('#result');

  async function lookup() {
    const domain = domainInput.value.trim();
    if (!domain) { result.textContent = '⚠️ Enter a domain.'; return; }

    result.textContent = '⏳ Looking up... (via proxy)';
    btn.disabled = true;

    try {
      // Using whois-api.com with CORS proxy
      const targetUrl = `https://whois-api.com/api/v1/whois?domain=${encodeURIComponent(domain)}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data || data.error) {
        throw new Error(data?.error || 'No data returned');
      }

      const info = [
        `Domain: ${data.domain || domain}`,
        `Registrar: ${data.registrar || data.registrant || 'N/A'}`,
        `Creation: ${data.creation_date || data.created || 'N/A'}`,
        `Expiry: ${data.expiration_date || data.expires || 'N/A'}`,
        `Name Servers: ${data.name_servers ? data.name_servers.join(', ') : 'N/A'}`,
        `Status: ${data.status || 'N/A'}`
      ].join('\n');

      result.textContent = `✅ ${info}`;
      result.style.color = '#28a745';
      result.style.whiteSpace = 'pre-wrap';
    } catch (err) {
      result.textContent = `❌ Error: ${err.message}\n\n💡 Tip: Try again or check your internet connection.`;
      result.style.color = '#dc3545';
      result.style.whiteSpace = 'pre-wrap';
    } finally {
      btn.disabled = false;
    }
  }

  btn.onclick = lookup;
  domainInput.onkeyup = e => { if (e.key === 'Enter') lookup(); };
}