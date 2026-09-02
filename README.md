# 991-NetworkTools

**Client-side network diagnostic tools** – 4 pure JavaScript utilities that run entirely in your browser.  
All requests are made directly from your browser using public APIs. No data stored on any server.

---

## Features

- **4 Network Tools**: Ping (HTTP latency), DNS Lookup, WhoIs (RDAP), IP Info
- **100% Client-Side** – No backend required
- **CORS-Friendly APIs** – Uses Cloudflare DNS, ipwho.is, and RDAP protocol
- **Modular ES Modules** – Import only what you need
- **Framework Agnostic** – Works with any website or framework

---

## File Structure

```
991-NetworkTools/
├── src/
│   ├── tools/
│   │   ├── ping.js
│   │   ├── dns.js
│   │   ├── whois.js
│   │   └── ipinfo.js
│   └── index.js                  # Exports all tools
├── test.html                     # Test harness
└── README.md
```

---

## Usage

### Local Testing
Open `test.html` in your browser or serve with any static server.

### Integration
```html
<script type="module">
  import { ping, dns, whois, ipinfo } from './src/index.js';
  ping(document.getElementById('container'));
</script>
```

---

## Tool List

| Tool | Description |
|------|-------------|
| **Ping** | Measure HTTP/HTTPS round-trip latency |
| **DNS Lookup** | Query DNS records (A, AAAA, MX, TXT, CNAME, NS) using Cloudflare DoH |
| **WhoIs** | Get domain registration info via RDAP protocol |
| **IP Info** | Get geolocation and ISP details for any IP |

---

## License

MIT License – see [LICENSE](LICENSE) file.

---

*Built with ❤ by [Reza Shams](https://github.com/rezashams991)*
