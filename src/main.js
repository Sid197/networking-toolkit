import './style.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

const app = document.querySelector('#app');
const state = { tab: 'calculator', ip: '192.168.0.1', cidr: 24 };

function ipToInt(ip) {
  const parts = ip.trim().split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
  return parts.reduce((n, p) => n * 256 + Number(p), 0);
}
function intToIp(n) {
  return [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256].join('.');
}
function toBinary(n) {
  return [24, 16, 8, 0].map(s => (Math.floor(n / 2 ** s) % 256).toString(2).padStart(8, '0')).join('.');
}
function calc(ip, prefix) {
  const n = ipToInt(ip), p = Number(prefix);
  if (n === null || !Number.isInteger(p) || p < 0 || p > 32) return null;
  const size = 2 ** (32 - p);
  const network = Math.floor(n / size) * size;
  const broadcast = network + size - 1;
  const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  const conventional = p >= 1 && p <= 30;
  return {
    ip, prefix: p, network: intToIp(network), broadcast: p === 32 ? 'Not applicable (/32)' : intToIp(broadcast),
    first: p === 32 ? intToIp(network) : intToIp(p === 31 ? network : network + 1),
    last: p === 32 ? intToIp(network) : intToIp(p === 31 ? broadcast : broadcast - 1),
    mask: intToIp(mask), wildcard: intToIp((~mask) >>> 0), total: size,
    usable: p === 32 ? 1 : p === 31 ? 2 : size - 2,
    hostBits: 32 - p, networkBits: p, binary: toBinary(n), maskBinary: toBinary(mask),
    blockSize: size, networkInt: network, broadcastInt: broadcast, conventional
  };
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number(n).toLocaleString('en-US');
const prefixes = Array.from({length: 25}, (_, i) => i + 8);
function detail(label, value) {
  return `<div class="detail"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}
function render() {
  const r = calc(state.ip, state.cidr);
  app.innerHTML = `
    <header class="hero">
      <div class="logo">⌘</div>
      <div><h1>Networking Toolkit</h1><p>IPv4 subnet calculator · Quick networking references · Works offline</p></div>
    </header>
    <nav class="tabs" aria-label="Main navigation">
      <button data-tab="calculator" class="${state.tab === 'calculator' ? 'active' : ''}">Subnet calculator</button>
      <button data-tab="reference" class="${state.tab === 'reference' ? 'active' : ''}">Reference toolkit</button>
      <button data-tab="practice" class="${state.tab === 'practice' ? 'active' : ''}">Practice</button>
    </nav>
    ${state.tab === 'calculator' ? calculatorView(r) : state.tab === 'reference' ? referenceView() : practiceView()}
    <footer>Personal offline toolkit · No account or server required</footer>`;
  app.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; render(); }));
  const ipInput = app.querySelector('#ip');
  if (ipInput) ipInput.addEventListener('input', e => { state.ip = e.target.value; const cursor = e.target.selectionStart; render(); const next = app.querySelector('#ip'); next.focus(); next.setSelectionRange(cursor, cursor); });
  const cidr = app.querySelector('#cidr');
  if (cidr) cidr.addEventListener('change', e => { state.cidr = Number(e.target.value); render(); });
  app.querySelector('#reset')?.addEventListener('click', () => { state.ip = '192.168.0.1'; state.cidr = 24; render(); });
  app.querySelector('#copy')?.addEventListener('click', async () => {
    const latest = calc(state.ip, state.cidr);
    if (!latest) return;
    const text = `IPv4 Subnet Calculator\nIP/CIDR: ${latest.ip}/${latest.prefix}\nNetwork: ${latest.network}\nFirst usable: ${latest.first}\nLast usable: ${latest.last}\nBroadcast: ${latest.broadcast}\nSubnet mask: ${latest.mask}\nWildcard mask: ${latest.wildcard}\nTotal IPs: ${fmt(latest.total)}\nUsable hosts: ${fmt(latest.usable)}\nHost bits: ${latest.hostBits}`;
    try { await navigator.clipboard.writeText(text); app.querySelector('#copy').textContent = 'Copied!'; }
    catch { window.prompt('Copy these results:', text); }
  });
  app.querySelector('#practiceCheck')?.addEventListener('click', () => {
    const answer = app.querySelector('#practiceAnswer').value.trim();
    app.querySelector('#practiceFeedback').textContent = answer === '192.168.0.63' ? 'Correct! The broadcast address for 192.168.0.1/26 is 192.168.0.63.' : 'Not quite. For /26, each subnet contains 64 addresses. Try again.';
  });
}
function calculatorView(r) {
  if (!r) return `<section class="panel"><h2>Enter an IPv4 address</h2><label for="ip">IPv4 address</label><input id="ip" value="${esc(state.ip)}" placeholder="192.168.0.1"><p class="error">Invalid IPv4 address. Use four octets from 0 to 255.</p><label for="cidr">CIDR prefix</label><select id="cidr">${prefixOptions()}</select></section>`;
  const rows = [
    ['Input IP / CIDR', `${r.ip}/${r.prefix}`], ['Network address', r.network], ['First usable IP', r.first],
    ['Last usable IP', r.last], ['Broadcast address', r.broadcast], ['Subnet mask', r.mask],
    ['Wildcard mask', r.wildcard], ['CIDR prefix', `/${r.prefix}`], ['Network bits', r.networkBits],
    ['Host bits', r.hostBits], ['Total IP addresses', fmt(r.total)], ['Usable host addresses', fmt(r.usable)],
    ['Address block size', fmt(r.blockSize)]
  ];
  return `<section class="panel">
    <div class="input-grid">
      <div><label for="ip">IPv4 address</label><input id="ip" value="${esc(state.ip)}" placeholder="192.168.0.1" autocomplete="off"><small>Example: 10.0.0.12</small></div>
      <div><label for="cidr">CIDR prefix</label><select id="cidr">${prefixOptions()}</select><small>Choose /8 through /32</small></div>
    </div>
    <div class="actions"><button id="reset" class="secondary">Reset example</button><button id="copy" class="primary">Copy results</button></div>
    <h2>Subnet details</h2><div class="details">${rows.map(([a,b]) => detail(a,b)).join('')}</div>
    <div class="notice"><strong>Gateway:</strong> A CIDR calculation cannot determine your actual default gateway. It is configured on the router or device; it may be any usable address in the subnet.</div>
    ${r.prefix === 31 ? '<div class="notice">A /31 is commonly used for point-to-point links. Both addresses can be used; conventional network/broadcast reservations do not apply.</div>' : ''}
    ${r.prefix === 32 ? '<div class="notice">A /32 represents one IPv4 address, commonly used for a host route.</div>' : ''}
    <h2>Binary representation</h2><div class="binary"><label>IP address</label><code>${r.binary}</code><label>Subnet mask</label><code>${r.maskBinary}</code><div class="bitbar"><span style="flex:${r.networkBits}">Network ${r.networkBits} bits</span><span style="flex:${r.hostBits || 0.1}">Host ${r.hostBits} bits</span></div></div>
    <h2>Subnet range visual</h2><div class="range"><div><span class="dot red"></span><small>Network</small><strong>${r.network}</strong></div><div class="range-line"></div><div><span class="dot green"></span><small>Address in subnet</small><strong>${r.ip}</strong></div><div class="range-line"></div><div><span class="dot red"></span><small>Block end</small><strong>${r.prefix === 32 ? r.network : intToIp(r.broadcastInt)}</strong></div></div>
  </section>`;
}
function prefixOptions() {
  return prefixes.map(p => `<option value="${p}" ${Number(state.cidr) === p ? 'selected' : ''}>/${p} · ${fmt(2 ** (32-p))} IPs</option>`).join('');
}
function referenceView() {
  const masks = prefixes.map(p => { const c = calc('192.168.0.1', p); return `<tr><td>/${p}</td><td>${c.mask}</td><td>${fmt(c.total)}</td><td>${fmt(c.usable)}${p === 31 ? '*' : p === 32 ? '*' : ''}</td></tr>`; }).join('');
  return `<section class="panel"><h2>CIDR quick reference</h2><p class="muted">Standard IPv4 subnet sizes and masks.</p><div class="table-wrap"><table><thead><tr><th>CIDR</th><th>Subnet mask</th><th>Total IPs</th><th>Usable hosts</th></tr></thead><tbody>${masks}</tbody></table></div><p class="muted small">* /31 supports two addresses on point-to-point links; /32 represents one address. For /8–/30, conventional usable host count subtracts network and broadcast addresses.</p>
  <h2>Private IPv4 ranges</h2><div class="details">${detail('10.0.0.0/8','10.0.0.0 – 10.255.255.255')}${detail('172.16.0.0/12','172.16.0.0 – 172.31.255.255')}${detail('192.168.0.0/16','192.168.0.0 – 192.168.255.255')}</div>
  <h2>Common networking ports</h2><div class="details">${detail('SSH','TCP 22')}${detail('DNS','TCP/UDP 53')}${detail('DHCP','UDP 67/68')}${detail('HTTP','TCP 80')}${detail('HTTPS','TCP 443')}${detail('RDP','TCP/UDP 3389')}${detail('NTP','UDP 123')}${detail('SNMP','UDP 161/162')}</div>
  <h2>Useful concepts</h2><div class="concept"><strong>Default gateway</strong><p>Router address a host uses to reach networks outside its local subnet.</p></div><div class="concept"><strong>DNS</strong><p>Translates domain names, such as example.com, into IP addresses.</p></div><div class="concept"><strong>DHCP</strong><p>Automatically leases IP settings including address, subnet mask, gateway, and DNS servers.</p></div><div class="concept"><strong>VLAN</strong><p>Logically separates a Layer 2 network into distinct broadcast domains.</p></div><div class="concept"><strong>NAT</strong><p>Translates IP addresses, often allowing private hosts to share a public IPv4 address.</p></div><div class="concept"><strong>TCP vs UDP</strong><p>TCP provides a reliable ordered stream; UDP sends datagrams without a built-in delivery guarantee.</p></div></section>`;
}
function practiceView() {
  return `<section class="panel"><h2>Subnetting practice</h2><p>Question: What is the broadcast address of <strong>192.168.0.1/26</strong>?</p><label for="practiceAnswer">Your answer</label><input id="practiceAnswer" placeholder="e.g. 192.168.0.63"><button id="practiceCheck" class="primary">Check answer</button><p id="practiceFeedback" class="feedback" aria-live="polite"></p><div class="notice">Hint: a /26 subnet contains 64 total addresses. Subnet blocks begin at .0, .64, .128, and .192.</div></section>`;
}
render();