/**
 * WhoIs Lookup Tool - Uses official RDAP protocol (rdap.org).
 * Direct browser fetch without CORS proxy or third-party backend.
 */

export default function run(container) {
  container.innerHTML = `
    <h3>📋 WhoIs Lookup (RDAP)</h3>
    <p>Get domain registration information via official RDAP protocol.</p>
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
    let domain = domainInput.value.trim();
    if (!domain) { result.textContent = '⚠️ Enter a domain.'; return; }

    // Strip protocol and path if entered by user
    domain = domain.replace(/^https?:\/\//, '').split('/')[0];

    result.textContent = '⏳ Looking up... (via RDAP)';
    btn.disabled = true;

    try {
      // rdap.org acts as an open, CORS-friendly client gateway for domain RDAP queries
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('Domain not found or unsupported TLD');
        throw new Error(`RDAP request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract event dates from RDAP response JSON
      const getEventDate = (action) => {
        const evt = data.events?.find(e => e.eventAction === action);
        return evt ? new Date(evt.eventDate).toLocaleDateString() : 'N/A';
      };

      // Extract registrar entity name
      const registrarEntity = data.entities?.find(e => e.roles?.includes('registrar'));
      const registrarName = registrarEntity?.vcardArray?.[1]?.find(item => item[0] === 'fn')?.[3] || registrarEntity?.handle || 'N/A';

      // Extract nameservers
      const nameservers = data.nameservers ? data.nameservers.map(ns => ns.ldhName).join(', ') : 'N/A';

      const info = [
        `Domain: ${data.ldhName || domain}`,
        `Registrar: ${registrarName}`,
        `Registration Date: ${getEventDate('registration')}`,
        `Expiration Date: ${getEventDate('expiration')}`,
        `Last Changed: ${getEventDate('last changed')}`,
        `Status: ${data.status ? data.status.join(', ') : 'Active'}`,
        `Name Servers: ${nameservers}`
      ].join('\n');

      result.textContent = `✅ ${info}`;
      result.style.color = '#28a745';
      result.style.whiteSpace = 'pre-wrap';
    } catch (err) {
      result.textContent = `❌ Error: ${err.message}`;
      result.style.color = '#dc3545';
      result.style.whiteSpace = 'pre-wrap';
    } finally {
      btn.disabled = false;
    }
  }

  btn.onclick = lookup;
  domainInput.onkeyup = e => { if (e.key === 'Enter') lookup(); };
}