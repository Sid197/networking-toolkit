import './style.css';
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
const app=document.querySelector('#app');
const S={tab:'ipv4',ip:'192.168.0.1',cidr:24,ipv6:'2001:db8::1',v6p:64,check:'192.168.1.10',domain:'example.com',dtype:'A',dns:'',dnsErr:'',plan:26,search:'',advIp:'192.168.1.10',advPrefix:24,vlsm:'100,50,25,10',
labHost:'example.com',labPort:'443',labOs:'Windows',labResult:'',
vlanName:'Office',vlanId:'10',vlanNetwork:'192.168.10.0/24',vlanGateway:'192.168.10.1',vlanDns:'1.1.1.1',
commandOs:'Linux',commandTask:'Show IP configuration',commandHost:'example.com',commandPort:'443',
learnTopic:'Subnetting',learnIndex:0,learnAnswer:'',learnFeedback:'',learnScore:0,learnAnswered:0,speedRunning:false,speedStatus:'',speedResults:null}; 
const STORE_KEY='networking-toolkit-workspace-v3';
function loadWorkspace(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');if(x.vlans) S.vlans=x.vlans;if(x.learn)Object.assign(S,x.learn)}catch{}}
function saveWorkspace(){try{localStorage.setItem(STORE_KEY,JSON.stringify({vlans:S.vlans||[],learn:{learnScore:S.learnScore,learnAnswered:S.learnAnswered}}))}catch{}}
loadWorkspace();
const $=s=>app.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=n=>Number(n).toLocaleString('en-US');
function ipN(ip){let a=ip.trim().split('.');if(a.length!==4||a.some(x=>!/^\d{1,3}$/.test(x)||+x>255))return null;return a.reduce((n,x)=>n*256+ +x,0)}
function ipS(n){return [Math.floor(n/16777216)%256,Math.floor(n/65536)%256,Math.floor(n/256)%256,n%256].join('.')}
function bin(n){return [24,16,8,0].map(s=>Math.floor(n/2**s)%256).map(x=>x.toString(2).padStart(8,'0')).join('.')}
function c4(ip,p){let n=ipN(ip);p=+p;if(n===null||p<0||p>32)return null;let z=2**(32-p),net=Math.floor(n/z)*z,b=net+z-1,m=p===0?0:(0xffffffff<<(32-p))>>>0;return{ip,p,net,network:ipS(net),first:p===32?ipS(net):ipS(p===31?net:net+1),last:p===32?ipS(net):ipS(p===31?b:b-1),broadcast:p===32?'Not applicable (/32)':ipS(b),mask:ipS(m),wild:ipS((~m)>>>0),total:z,usable:p===32?1:p===31?2:z-2,binary:bin(n),maskbin:bin(m),end:b}}
function p6(s){s=s.trim().toLowerCase();if(!s||s.includes('.')||(s.match(/::/g)||[]).length>1)return null;let a=s.split('::'),l=a[0]?a[0].split(':'):[],r=a.length===2&&a[1]?a[1].split(':'):[];if([...l,...r].some(x=>!/^[0-9a-f]{1,4}$/.test(x)))return null;let g;if(a.length===2){let missing=8-l.length-r.length;if(missing<1)return null;g=[...l,...Array(missing).fill('0'),...r]}else g=l;if(g.length!==8)return null;return g.map(x=>parseInt(x,16))}
function c6(s,p){let g=p6(s);p=+p;if(!g||p<0||p>128)return null;let bits=g.map(x=>x.toString(2).padStart(16,'0')).join(''),nb=bits.slice(0,p).padEnd(128,'0'),ng=Array.from({length:8},(_,i)=>parseInt(nb.slice(i*16,(i+1)*16),2));return{groups:g,expanded:g.map(x=>x.toString(16).padStart(4,'0')).join(':'),network:compress(ng),p,host:128-p,total:(2n**BigInt(128-p)).toString(),binary:bits.match(/.{16}/g).join(':')}}
function compress(g){let h=g.map(x=>x.toString(16)),bs=-1,bl=1;for(let i=0;i<8;){if(g[i]){i++;continue}let j=i;while(j<8&&!g[j])j++;if(j-i>bl){bs=i;bl=j-i}i=j}if(bs<0)return h.join(':');return h.slice(0,bs).join(':')+'::'+h.slice(bs+bl).join(':')}
function classify(ip){let a=ip.split('.').map(Number),n=ipN(ip);if(n===null)return null;let [x,y,z]=a,t='Public IPv4 (range-based)',d='Not in the common private/special ranges checked here; reachability is not guaranteed.';if(x===10||(x===172&&y>=16&&y<=31)||(x===192&&y===168)){t='Private IPv4 (RFC 1918)';d='For internal networks; not globally routable directly.'}else if(x===127){t='Loopback';d='Refers to the local host.'}else if(x===169&&y===254){t='Link-local';d='Often self-assigned when DHCP is unavailable.'}else if(x===100&&y>=64&&y<=127){t='Shared address space (CGNAT)';d='Often used by service providers behind carrier-grade NAT.'}else if(x===0){t='Unspecified / this network';d='Special-use range.'}else if(x>=224&&x<=239){t='Multicast';d='One-to-many delivery range.'}else if(x>=240){t='Reserved';d='Reserved or experimental range.'}else if(x===192&&y===0&&z===2){t='Documentation';d='Reserved for examples.'}else if(x===198&&y===51&&z===100){t='Documentation';d='Reserved for examples.'}else if(x===203&&y===0&&z===113){t='Documentation';d='Reserved for examples.'}else if(x===198&&(y===18||y===19)){t='Benchmark testing';d='Reserved for network-device benchmarking.'}return{t,d}}
function detail(a,b){return `<div class="detail"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`}
const prefixes=Array.from({length:25},(_,i)=>i+8);
const ports=[['FTP control','TCP 21'],['SSH','TCP 22'],['SMTP','TCP 25'],['DNS','TCP/UDP 53'],['DHCP','UDP 67/68'],['HTTP','TCP 80'],['POP3','TCP 110'],['NTP','UDP 123'],['IMAP','TCP 143'],['SNMP','UDP 161/162'],['HTTPS','TCP 443'],['SMB','TCP 445'],['Syslog','UDP 514'],['LDAPS','TCP 636'],['MySQL','TCP 3306'],['RDP','TCP/UDP 3389'],['PostgreSQL','TCP 5432'],['Redis','TCP 6379'],['MongoDB','TCP 27017']];
const concepts=[['CIDR','Prefix notation such as 192.168.1.0/24.'],['Default gateway','Router address used to reach other networks.'],['DNS','Translates names into records such as A and AAAA.'],['DHCP','Leases IP configuration to clients automatically.'],['VLAN','Separates Layer 2 networks into broadcast domains.'],['NAT','Translates addresses, often sharing public IPv4.'],['TCP','Reliable, ordered, connection-oriented transport.'],['UDP','Datagrams without built-in delivery guarantees.'],['ARP','Maps IPv4 addresses to MAC addresses on a local link.'],['ICMP','Network control/error messages; ping commonly uses Echo.'],['MTU','Maximum packet size carried at a network link.'],['VPN tunnelling','Encapsulates traffic inside another protocol.'],['IPv6','128-bit IP addresses written in hexadecimal groups.'],['Subnetting','Divides an address block into smaller prefixes.']];
function nav(){const tools=[['ipv4','◈','IPv4 subnet'],['advanced','⌘','Advanced subnet'],['ipv6','ϟ','IPv6 tools'],['check','✓','IP checker'],['dns','◎','DNS lookup'],['planner','▦','Subnet planner'],['ipplan','⌁','IP & VLAN planner'],['lab','⌕','Troubleshooting lab'],['commands','›_','Commands'],['speed','◉','Speed test'],['ref','▤','References'],['practice','✳','Learning mode']];return `<header class="hero"><div class="logo" aria-hidden="true">⌘</div><div class="brand-copy"><h1>Networking Toolkit</h1><p>IPv4 · Advanced subnetting · IPv6 · Troubleshooting · VLAN planning · Commands · Learning</p></div><div class="header-actions"><span class="header-status"><i></i> Network tools workspace</span><button id="themeToggle" class="theme-toggle" type="button" aria-label="Toggle light and dark theme" title="Toggle light/dark theme">◐ <span>Theme</span></button></div></header><nav class="tabs" aria-label="Networking tools">${tools.map(([k,icon,label])=>`<button data-tab="${k}" class="${S.tab===k?'active':''}" ${S.tab===k?'aria-current="page"':''}><span class="tab-icon" aria-hidden="true">${icon}</span>${label}</button>`).join('')}</nav>`}
function ipv4(){let r=c4(S.ip,S.cidr);if(!r)return `<section class="panel"><h2>IPv4 subnet calculator</h2>${ipfields()}<p class="error">Enter a valid IPv4 address.</p></section>`;let rows=[['Input',r.ip+'/'+r.p],['Network address',r.network],['First usable IP',r.first],['Last usable IP',r.last],['Broadcast address',r.broadcast],['Subnet mask',r.mask],['Wildcard mask',r.wild],['Network bits',r.p],['Host bits',32-r.p],['Total IP addresses',fmt(r.total)],['Usable host addresses',fmt(r.usable)]];return `<section class="panel"><h2>IPv4 subnet calculator</h2><div class="input-grid"><div><label for="ip">IPv4 address</label><input id="ip" value="${esc(S.ip)}"></div><div><label for="cidr">CIDR prefix</label><select id="cidr">${prefixes.map(p=>`<option value="${p}" ${p===+S.cidr?'selected':''}>/${p}</option>`).join('')}</select></div></div><div class="actions"><button id="reset" class="secondary">Reset</button><button id="copy" class="primary">Copy results</button></div><div class="details">${rows.map(x=>detail(...x)).join('')}</div><h3>Binary representation</h3><code>${r.binary}</code><label>Subnet mask binary</label><code>${r.maskbin}</code><div class="notice"><b>Gateway:</b> Cannot be determined from CIDR alone; check router/device settings.</div></section>`}
function ipfields(){return `<label for="ip">IPv4 address</label><input id="ip" value="${esc(S.ip)}"><label for="cidr">CIDR prefix</label><select id="cidr">${prefixes.map(p=>`<option value="${p}" ${p===+S.cidr?'selected':''}>/${p}</option>`).join('')}</select>`}
function ipv6(){let r=c6(S.ipv6,S.v6p);return `<section class="panel"><h2>IPv6 tools</h2><p class="muted">Basic IPv6 notation and :: compression are supported; IPv4-embedded IPv6 is not supported yet.</p><label for="ipv6">IPv6 address</label><input id="ipv6" value="${esc(S.ipv6)}" placeholder="2001:db8::1"><label for="v6p">Prefix length</label><select id="v6p">${[0,16,24,32,48,56,64,80,96,112,120,124,126,127,128].map(p=>`<option value="${p}" ${p===+S.v6p?'selected':''}>/${p}</option>`).join('')}</select>${!r?'<p class="error">Invalid IPv6 address or prefix.</p>':`<div class="details">${detail('Expanded address',r.expanded)}${detail('Network prefix',r.network+'/'+r.p)}${detail('Host bits',r.host)}${detail('Addresses in prefix',r.total)}</div><h3>Binary representation</h3><code>${r.binary}</code>`}<div class="notice">IPv6 has no broadcast address. /64 is common for LAN subnets; 2001:db8::/32 is reserved for documentation.</div></section>`}
function checker(){let r=classify(S.check);return `<section class="panel"><h2>IPv4 address checker</h2><label for="check">IPv4 address</label><input id="check" value="${esc(S.check)}" placeholder="192.168.1.10">${r?`<div class="result-card"><span class="eyebrow">Classification</span><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></div>`:'<p class="error">Enter a valid IPv4 address.</p>'}<h3>Private IPv4 ranges (RFC 1918)</h3><div class="details">${detail('10.0.0.0/8','10.0.0.0 – 10.255.255.255')}${detail('172.16.0.0/12','172.16.0.0 – 172.31.255.255')}${detail('192.168.0.0/16','192.168.0.0 – 192.168.255.255')}</div><p class="muted">Range-based educational classification, not a live reachability or public-IP test.</p></section>`}
function dns(){return `<section class="panel"><h2>DNS record lookup</h2><p class="muted">Uses Cloudflare DNS-over-HTTPS. Queries are sent to Cloudflare and require internet.</p><label for="domain">Domain name</label><input id="domain" value="${esc(S.domain)}" placeholder="example.com"><label for="dtype">Record type</label><select id="dtype">${['A','AAAA','CNAME','MX','TXT','NS'].map(x=>`<option ${S.dtype===x?'selected':''}>${x}</option>`).join('')}</select><button id="dnsgo" class="primary">Look up DNS</button>${S.dnsErr?`<p class="error">${esc(S.dnsErr)}</p>`:''}${S.dns?`<h3>Results</h3><pre class="dns-result">${esc(S.dns)}</pre>`:''}<div class="notice">A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, TXT = text, NS = nameservers.</div></section>`}
async function lookup(){S.dns='';S.dnsErr='';render();let d=S.domain.trim().replace(/\.$/,'');if(!d||!/^[a-z0-9.-]+$/i.test(d)||d.includes('..')){S.dnsErr='Enter a valid domain name.';render();return;}try{let res=await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${S.dtype}`,{headers:{accept:'application/dns-json'}});if(!res.ok)throw Error('HTTP '+res.status);let data=await res.json();if(data.Status===3)S.dnsErr='NXDOMAIN: resolver reports that this domain does not exist.';else if(data.Status!==0)S.dnsErr='DNS response status: '+data.Status;else{let typ={A:1,AAAA:28,CNAME:5,MX:15,TXT:16,NS:2}[S.dtype],ans=(data.Answer||[]).filter(x=>x.type===typ);S.dns=ans.length?ans.map(x=>`${x.name}  TTL ${x.TTL}  ${x.data}`).join('\n'):'No records of this type returned.'}}catch(e){S.dnsErr='Lookup failed. Check internet access and try again. '+e.message}render()}
function planner(){let r=c4(S.ip,S.cidr),p=+S.plan,ok=r&&p>=r.p&&p<=32,rows='';if(ok){let count=2**(p-r.p),size=2**(32-p);for(let i=0;i<Math.min(count,256);i++){let n=r.net+i*size,b=n+size-1;rows+=`<tr><td>${i+1}</td><td>${ipS(n)}/${p}</td><td>${p===32?ipS(n):ipS(p===31?n:n+1)}</td><td>${p===32?ipS(n):ipS(p===31?b:b-1)}</td><td>${p>=31?'—':ipS(b)}</td><td>${fmt(size)}</td><td>${fmt(p===32?1:p===31?2:size-2)}</td></tr>`}}return `<section class="panel"><h2>IPv4 subnet planner</h2><p>Divide the parent network into smaller equal-sized subnets.</p><div class="input-grid"><div><label for="ip">Parent IPv4 address</label><input id="ip" value="${esc(S.ip)}"></div><div><label for="cidr">Parent CIDR</label><select id="cidr">${prefixes.map(p=>`<option value="${p}" ${p===+S.cidr?'selected':''}>/${p}</option>`).join('')}</select></div></div><label for="plan">Child subnet prefix</label><select id="plan">${prefixes.map(p=>`<option value="${p}" ${p===+S.plan?'selected':''}>/${p}</option>`).join('')}</select>${!ok?'<p class="error">Child prefix must be equal to or longer than parent prefix.</p>':`<div class="result-card"><h3>${fmt(2**(p-r.p))} child subnets of /${p}</h3><p>${fmt(2**(32-p))} addresses each. Showing at most 256 rows.</p></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Network</th><th>First</th><th>Last</th><th>Broadcast</th><th>Total</th><th>Usable</th></tr></thead><tbody>${rows}</tbody></table></div>`}<div class="notice">AWS reserves five IPv4 addresses per subnet, so AWS-usable counts differ.</div></section>`}
function refs(){let q=S.search.toLowerCase(),p=ports.filter(x=>x.join(' ').toLowerCase().includes(q)),c=concepts.filter(x=>x.join(' ').toLowerCase().includes(q));return `<section class="panel"><h2>Searchable networking references</h2><label for="search">Search concepts and ports</label><input id="search" value="${esc(S.search)}" placeholder="DNS, TCP, 443, VLAN…"><h3>Common ports</h3><div class="details">${p.map(x=>detail(...x)).join('')||'<p class="muted">No matching ports.</p>'}</div><h3>Networking concepts</h3>${c.map(x=>`<div class="concept"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join('')||'<p class="muted">No matching concepts.</p>'}<h3>CIDR quick reference</h3><div class="table-wrap"><table><thead><tr><th>CIDR</th><th>Mask</th><th>Total IPs</th><th>Usable*</th></tr></thead><tbody>${prefixes.map(p=>{let r=c4('192.168.0.1',p);return `<tr><td>/${p}</td><td>${r.mask}</td><td>${fmt(r.total)}</td><td>${fmt(r.usable)}</td></tr>`}).join('')}</tbody></table></div><p class="muted">* Conventional usable counts exclude network/broadcast addresses; /31 and /32 are special cases.</p></section>`}
function practice(){return `<section class="panel"><h2>Subnetting practice</h2><p>What is the broadcast address of <b>192.168.0.1/26</b>?</p><label for="answer">Your answer</label><input id="answer" placeholder="192.168.0.63"><button class="primary" id="checkanswer">Check answer</button><p id="feedback" class="feedback"></p></section>`}

function advancedSubnet(){
 const r=c4(S.advIp,S.advPrefix);
 const hosts=(S.vlsm||'').split(',').map(x=>Number(x.trim())).filter(x=>Number.isInteger(x)&&x>0).sort((a,b)=>b-a);
 let vlsmRows='',vlsmError='';
 if(r && hosts.length){
   let cursor=r.net;
   for(const h of hosts){
     const bits=Math.ceil(Math.log2(h+2)),p=Math.max(0,32-bits),size=2**(32-p);
     cursor=Math.ceil(cursor/size)*size;
     if(cursor+size-1>r.end){vlsmError='Requested hosts do not fit inside the selected parent network.';vlsmRows='';break;}
     const end=cursor+size-1;
     vlsmRows+=`<tr><td>${h}</td><td>${ipS(cursor)}/${p}</td><td>${ipS(cursor+1)}</td><td>${ipS(end-1)}</td><td>${ipS(end)}</td><td>${size}</td></tr>`;
     cursor=end+1;
   }
 }
 return `<section class="panel"><h2>Advanced subnet calculator</h2><p class="muted">Calculate CIDR details, wildcard masks, binary values, and allocate variable-sized subnets (VLSM).</p>
 <div class="input-grid"><div><label for="advIp">IPv4 address / parent network</label><input id="advIp" value="${esc(S.advIp)}"></div><div><label for="advPrefix">CIDR prefix</label><select id="advPrefix">${Array.from({length:33},(_,i)=>i).map(p=>`<option value="${p}" ${p===+S.advPrefix?'selected':''}>/${p}</option>`).join('')}</select></div></div>
 ${!r?'<p class="error">Enter a valid IPv4 address and prefix.</p>':`<div class="details">${detail('Canonical network',r.network+'/'+r.p)}${detail('Subnet mask',r.mask)}${detail('Wildcard mask',r.wild)}${detail('Total addresses',fmt(r.total))}${detail('Usable host addresses',fmt(r.usable))}${detail('Address binary',r.binary)}${detail('Mask binary',r.maskbin)}</div>`}
 <h3>VLSM allocator</h3><p class="muted">Enter required host counts separated by commas. The tool allocates largest subnets first within the parent CIDR.</p>
 <label for="vlsm">Required hosts per subnet</label><input id="vlsm" value="${esc(S.vlsm)}" placeholder="100,50,25,10">
 <button id="runVlsm" class="primary">Allocate subnets</button>${vlsmError?`<p class="error">${esc(vlsmError)}</p>`:''}${vlsmRows?`<div class="table-wrap"><table><thead><tr><th>Hosts needed</th><th>Subnet</th><th>First host</th><th>Last host</th><th>Broadcast</th><th>Total IPs</th></tr></thead><tbody>${vlsmRows}</tbody></table></div>`:''}
 <div class="notice">VLSM reserves conventional network/broadcast addresses for prefixes /0–/30. Validate production allocations against your routing and address-management standards.</div></section>`;
}
const commandCatalog={
 'Linux':[
 ['Show IP configuration','ip addr show'],['Show routing table','ip route'],['Show DNS configuration','resolvectl status'],['Test reachability','ping -c 4 {host}'],['Trace route','traceroute {host}'],['Check listening ports','ss -tulpn'],['Test TCP port','nc -vz {host} {port}'],['DNS lookup','dig {host}'],['ARP/neighbor table','ip neigh show']],
 'Windows':[
 ['Show IP configuration','ipconfig /all'],['Show routing table','route print'],['Show DNS cache','ipconfig /displaydns'],['Test reachability','ping {host}'],['Trace route','tracert {host}'],['Check listening ports','netstat -ano'],['Test TCP port','Test-NetConnection {host} -Port {port}'],['DNS lookup','nslookup {host}'],['ARP table','arp -a']],
 'Cisco IOS':[
 ['Show interfaces','show ip interface brief'],['Show routes','show ip route'],['Show VLANs','show vlan brief'],['Show trunk ports','show interfaces trunk'],['Show MAC table','show mac address-table'],['Show access lists','show access-lists'],['Ping host','ping {host}'],['Trace route','traceroute {host}']],
 'AWS CLI':[
 ['List VPCs','aws ec2 describe-vpcs --query "Vpcs[*].[VpcId,CidrBlock,State]" --output table'],['List subnets','aws ec2 describe-subnets --query "Subnets[*].[SubnetId,VpcId,CidrBlock,AvailabilityZone]" --output table'],['Inspect route tables','aws ec2 describe-route-tables --output table'],['Inspect security groups','aws ec2 describe-security-groups --output table'],['Check instance status','aws ec2 describe-instance-status --include-all-instances']],
 'Docker':[
 ['List networks','docker network ls'],['Inspect network','docker network inspect {host}'],['List containers','docker ps'],['Inspect container','docker inspect {host}'],['Show published ports','docker port {host}']],
 'Kubernetes':[
 ['List services','kubectl get svc -A'],['List pods','kubectl get pods -A -o wide'],['Inspect service','kubectl describe svc {host}'],['Check endpoints','kubectl get endpoints -A'],['DNS test pod','kubectl run dns-test --rm -it --image=busybox:1.36 --restart=Never -- nslookup {host}']]
};
function commands(){
 const options=(commandCatalog[S.commandOs]||[]),selected=options.find(x=>x[0]===S.commandTask)||options[0]||['',''];
 const cmd=selected[1].replaceAll('{host}',S.commandHost||'HOST').replaceAll('{port}',S.commandPort||'PORT');
 return `<section class="panel"><h2>Command generator & cheat sheets</h2><p class="muted">Generate copyable commands. Review placeholders and permissions before running commands in production.</p>
 <label for="commandOs">Platform</label><select id="commandOs">${Object.keys(commandCatalog).map(x=>`<option ${S.commandOs===x?'selected':''}>${x}</option>`).join('')}</select>
 <label for="commandTask">Task</label><select id="commandTask">${options.map(x=>`<option ${S.commandTask===x[0]?'selected':''}>${esc(x[0])}</option>`).join('')}</select>
 <div class="input-grid"><div><label for="commandHost">Host / resource / container</label><input id="commandHost" value="${esc(S.commandHost)}"></div><div><label for="commandPort">TCP port</label><input id="commandPort" value="${esc(S.commandPort)}"></div></div>
 <h3>Generated command</h3><pre class="dns-result" id="generatedCommand">${esc(cmd)}</pre><button id="copyCommand" class="primary">Copy command</button>
 <h3>${esc(S.commandOs)} quick reference</h3><div class="table-wrap"><table><thead><tr><th>Task</th><th>Command template</th></tr></thead><tbody>${options.map(x=>`<tr><td>${esc(x[0])}</td><td><code>${esc(x[1])}</code></td></tr>`).join('')}</tbody></table></div>
 <div class="notice">Commands are generated locally and are not executed by this PWA. Some commands require elevated permissions or additional tools.</div></section>`;
}
function ipVlanPlanner(){
 const vlans=S.vlans||[];
 const validNet=v=>{let m=String(v).match(/^(.+)\/(\d{1,2})$/);return m&&c4(m[1],+m[2])?c4(m[1],+m[2]):null};
 const overlaps=(net,skip=-1)=>{let a=validNet(net);if(!a)return false;return vlans.some((v,i)=>i!==skip&&validNet(v.network)&&a.net<=validNet(v.network).end&&validNet(v.network).net<=a.end)};
 const r=validNet(S.vlanNetwork);
 return `<section class="panel"><h2>IP address & VLAN planner</h2><p class="muted">Create a local inventory of VLANs and IPv4 networks. Data stays in this browser unless you export it.</p>
 <div class="input-grid"><div><label for="vlanName">Name / purpose</label><input id="vlanName" value="${esc(S.vlanName)}" placeholder="Management"></div><div><label for="vlanId">VLAN ID (1–4094)</label><input id="vlanId" type="number" min="1" max="4094" value="${esc(S.vlanId)}"></div>
 <div><label for="vlanNetwork">Network CIDR</label><input id="vlanNetwork" value="${esc(S.vlanNetwork)}" placeholder="192.168.10.0/24"></div><div><label for="vlanGateway">Gateway IP</label><input id="vlanGateway" value="${esc(S.vlanGateway)}" placeholder="192.168.10.1"></div>
 <div><label for="vlanDns">DNS server(s)</label><input id="vlanDns" value="${esc(S.vlanDns)}" placeholder="1.1.1.1"></div></div>
 ${!r?'<p class="error">Enter a valid IPv4 CIDR, such as 192.168.10.0/24.</p>':`<p class="${overlaps(S.vlanNetwork)?'error':'muted'}">${overlaps(S.vlanNetwork)?'Warning: this subnet overlaps an existing saved network.':'Network looks valid and does not overlap saved networks.'}</p>`}
 <div class="actions"><button id="saveVlan" class="primary">Save VLAN / network</button><button id="exportVlans" class="secondary">Export JSON</button><button id="importVlans" class="secondary">Import JSON</button><input id="importFile" type="file" accept="application/json,.json" hidden></div>
 <h3>Saved inventory (${vlans.length})</h3>${vlans.length?`<div class="table-wrap"><table><thead><tr><th>VLAN</th><th>Name</th><th>Network</th><th>Gateway</th><th>DNS</th><th>Action</th></tr></thead><tbody>${vlans.map((v,i)=>`<tr><td>${esc(v.id)}</td><td>${esc(v.name)}</td><td>${esc(v.network)}</td><td>${esc(v.gateway)}</td><td>${esc(v.dns)}</td><td><button class="secondary deleteVlan" data-index="${i}">Delete</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No saved networks yet.</p>'}
 <div class="notice">Overlap checks compare valid IPv4 CIDR ranges in this saved inventory. They cannot discover devices or duplicate IPs on your live network.</div></section>`;
}
const labGuides={
 'Windows':[['Check interface configuration','ipconfig /all','Confirm the assigned IP, subnet mask, default gateway, and DNS servers.'],['Check local TCP/IP','ping 127.0.0.1','If this fails, investigate the local TCP/IP stack.'],['Check gateway','ping GATEWAY_IP','Replace GATEWAY_IP with the configured default gateway.'],['Check name resolution','nslookup HOSTNAME','Compare DNS server and returned records.'],['Trace path','tracert HOSTNAME','Look for where hops stop responding; routers may block probes.'],['Test TCP port','Test-NetConnection HOSTNAME -Port PORT','A failed TCP test may indicate DNS, routing, firewall, or service issues.']],
 'Linux':[['Check interface configuration','ip addr show','Confirm address and prefix on the expected interface.'],['Check routes','ip route','Verify a default route or route to the destination exists.'],['Check gateway','ping -c 4 GATEWAY_IP','Replace GATEWAY_IP with the actual gateway.'],['Check DNS','getent hosts HOSTNAME','Check local resolver configuration if lookup fails.'],['Trace path','traceroute HOSTNAME','Install traceroute if needed; ICMP/UDP probes can be filtered.'],['Test TCP port','nc -vz HOSTNAME PORT','Check destination, listener, routing, and firewall rules.']]
};
function troubleshooting(){
 const guides=labGuides[S.labOs]||labGuides.Windows;
 return `<section class="panel"><h2>Network troubleshooting lab</h2><p class="muted">A guided checklist for diagnosing connectivity. A browser-only PWA cannot directly run ping, traceroute, or arbitrary TCP port probes.</p>
 <label for="labOs">Client operating system</label><select id="labOs">${Object.keys(labGuides).map(x=>`<option ${S.labOs===x?'selected':''}>${x}</option>`).join('')}</select>
 <div class="input-grid"><div><label for="labHost">Destination hostname or IP</label><input id="labHost" value="${esc(S.labHost)}"></div><div><label for="labPort">TCP port</label><input id="labPort" value="${esc(S.labPort)}"></div></div>
 <div class="actions"><button id="resolveLab" class="primary">Browser DNS check</button><button id="makeChecklist" class="secondary">Show test commands</button></div>
 ${S.labResult?`<pre class="dns-result">${esc(S.labResult)}</pre>`:''}
 <h3>Step-by-step checklist</h3><div class="table-wrap"><table><thead><tr><th>Step</th><th>Command</th><th>What to check</th></tr></thead><tbody>${guides.map((g,i)=>`<tr><td>${i+1}. ${esc(g[0])}</td><td><code>${esc(g[1].replaceAll('HOSTNAME',S.labHost||'HOSTNAME').replaceAll('PORT',S.labPort||'PORT'))}</code></td><td>${esc(g[2])}</td></tr>`).join('')}</tbody></table></div>
 <h3>Interpret common symptoms</h3><div class="details">${detail('IP address missing / 169.254.x.x','Check DHCP, VLAN membership, switch port, and DHCP relay.')}${detail('IP works but hostname fails','Check DNS server, resolver configuration, and records.')}${detail('Gateway works but remote IP fails','Inspect routes, firewall rules, NAT, VPN, and upstream connectivity.')}${detail('Host responds but TCP port fails','Check service listener, destination port, security groups, ACLs, and host firewall.')}${detail('Intermittent latency / loss','Compare wired vs Wi-Fi, interface errors, congestion, and multiple hops.')}</div>
 <div class="notice">Browser DNS check uses Cloudflare DNS-over-HTTPS and requires internet. It does not prove that the destination is reachable from your device or network.</div></section>`;
}
const quiz=[
 {topic:'Subnetting',q:'What is the network address of 192.168.10.77/26?',opts:['192.168.10.0','192.168.10.64','192.168.10.77','192.168.10.128'],a:1,why:'/26 has blocks of 64 addresses. .77 is in the .64–.127 block.'},
 {topic:'Subnetting',q:'How many conventional usable host addresses are in a /27 IPv4 subnet?',opts:['14','30','32','62'],a:1,why:'/27 leaves 5 host bits: 32 total addresses, usually 30 usable.'},
 {topic:'VLANs',q:'What is the primary purpose of a VLAN?',opts:['Encrypt all traffic','Separate Layer 2 broadcast domains','Assign public IPs','Replace routing'],a:1,why:'VLANs logically separate Layer 2 networks; inter-VLAN communication normally needs Layer 3 routing.'},
 {topic:'DNS',q:'Which DNS record maps a name to an IPv6 address?',opts:['A','AAAA','MX','PTR'],a:1,why:'AAAA records publish IPv6 address data; A records are for IPv4.'},
 {topic:'Routing',q:'A host uses its default gateway when the destination is…',opts:['On the same subnet','Outside its directly connected networks','Always a DNS server','A MAC address'],a:1,why:'Traffic for destinations without a more specific route typically uses the default route.'},
 {topic:'Protocols',q:'Which protocol provides reliable, ordered transport?',opts:['UDP','ARP','TCP','ICMP'],a:2,why:'TCP provides connection-oriented, reliable, ordered byte-stream delivery.'},
 {topic:'Troubleshooting',q:'IP connectivity works, but a hostname does not resolve. What should you check first?',opts:['DNS configuration and records','Monitor refresh rate','VLAN name spelling only','Disk capacity'],a:0,why:'Check resolver configuration, DNS reachability, and the relevant record.'},
 {topic:'Cloud networking',q:'In AWS, what commonly allows instances in a private subnet to initiate IPv4 internet connections without accepting unsolicited inbound internet connections?',opts:['Internet Gateway alone','NAT Gateway with suitable routes','Route 53 hosted zone','Security group with no rules'],a:1,why:'A NAT Gateway plus appropriate route tables enables outbound-initiated internet access for private IPv4 subnets.'}
];
function learning(){
 const topics=['All topics',...new Set(quiz.map(x=>x.topic))],items=quiz.filter(x=>S.learnTopic==='All topics'||x.topic===S.learnTopic),q=items[S.learnIndex%Math.max(1,items.length)]||quiz[0];
 return `<section class="panel"><h2>Learning mode & progress</h2><p class="muted">Practice networking concepts with explanations. Your score is stored locally in this browser.</p>
 <div class="input-grid"><div><label for="learnTopic">Topic</label><select id="learnTopic">${topics.map(x=>`<option ${S.learnTopic===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div><div class="result-card"><b>Score:</b> ${S.learnScore} correct / ${S.learnAnswered} answered</div></div>
 <div class="progress-track"><span style="width:${S.learnAnswered?Math.round(S.learnScore/S.learnAnswered*100):0}%"></span></div><p class="muted">${S.learnAnswered?Math.round(S.learnScore/S.learnAnswered*100):0}% accuracy · Question ${(S.learnIndex%Math.max(1,items.length))+1} of ${items.length}</p>
 <div class="quiz-card"><span class="eyebrow">${esc(q.topic)}</span><h3>${esc(q.q)}</h3>${q.opts.map((o,i)=>`<label class="quiz-option"><input type="radio" name="learnAnswer" value="${i}" ${S.learnAnswer===String(i)?'checked':''}><span>${esc(o)}</span></label>`).join('')}
 <div class="actions"><button id="submitQuiz" class="primary">Check answer</button><button id="nextQuiz" class="secondary">Next question</button><button id="resetProgress" class="secondary">Reset progress</button></div>
 ${S.learnFeedback?`<div class="notice">${esc(S.learnFeedback)}</div>`:''}</div>
 <h3>Topics covered</h3><div class="details">${topics.slice(1).map(t=>detail(t,`${quiz.filter(x=>x.topic===t).length} question(s)`)).join('')}</div>
 <div class="notice">Progress is stored in this browser's local storage. Clearing browser site data may erase it. This initial version uses a fixed quiz bank; future expansion can add spaced repetition and more questions.</div></section>`;
}


function speedTest(){
 const r=S.speedResults;
 const metric=(name,value,unit='')=>`<div class="speed-metric"><span>${esc(name)}</span><strong>${value===null||value===undefined?'Not measured':esc(value)+(unit?' '+unit:'')}</strong></div>`;
 return `<section class="panel"><h2>Internet speed test</h2>
 <p class="muted">Measures download/upload throughput, idle latency, jitter, latency under load, HTTP probe failures, and DNS lookup time using Cloudflare's public speed-test endpoints. Requires internet access.</p>
 <div class="speed-hero"><div class="speed-orb"><span>${S.speedRunning?'Testing':(r&&r.downloadMbps!==null?esc(r.downloadMbps):'—')}</span><small>${S.speedRunning?'in progress':'Mbps download'}</small></div></div>
 <div class="actions"><button id="runSpeedTest" class="primary" ${S.speedRunning?'disabled':''}>${S.speedRunning?'Test running…':'Start speed test'}</button><button id="clearSpeedTest" class="secondary" ${S.speedRunning?'disabled':''}>Clear results</button></div>
 <p class="muted" id="speedStatus" aria-live="polite">${esc(S.speedStatus||'Run a test to measure your connection.')}</p>
 ${S.speedRunning?'<div class="progress-track"><span class="speed-progress"></span></div>':''}
 ${r?`<h3>Results</h3><div class="speed-grid">
 ${metric('Download',r.downloadMbps,'Mbps')}${metric('Upload',r.uploadMbps,'Mbps')}
 ${metric('Idle latency',r.idleLatency,'ms')}${metric('Jitter (mean delta)',r.jitter,'ms')}
 ${metric('Loaded latency',r.loadedLatency,'ms')}${metric('Latency increase under load',r.latencyIncrease,'ms')}
 ${metric('HTTP probe failures',r.probeLoss,'')}${metric('DNS lookup time',r.dnsMs,'ms')}
 ${metric('Download data',r.downloadMB,'MB')}${metric('Upload data',r.uploadMB,'MB')}
 </div><p class="muted">Test endpoint: Cloudflare · Completed: ${esc(r.completedAt)}</p>
 <div class="notice">HTTP probe failures are not ICMP packet loss. Jitter is the mean absolute difference between consecutive HTTP timing samples. Loaded latency is sampled during transfers. Results depend on the endpoint, browser, Wi-Fi, device load, and network conditions.</div>`:''}
 <h3>How to interpret results</h3><div class="details">
 ${detail('Download / upload','Higher throughput usually means faster transfers.')}
 ${detail('Latency','Lower round-trip time generally improves responsiveness.')}
 ${detail('Jitter','Lower variation is usually better for real-time voice and video.')}
 ${detail('Latency increase','A large rise during transfer can indicate queueing/bufferbloat.')}
 ${detail('DNS lookup','Time for a DNS-over-HTTPS query; not a full page-load measurement.')}
 </div><div class="notice">A browser cannot send raw ICMP packets or guarantee an ISP-grade bufferbloat/packet-loss diagnosis. Metrics are only estimates of what this browser test measures.</div></section>`;
}
const SPEED_BASE='https://speed.cloudflare.com';
async function timedFetch(url,options={},timeoutMs=20000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs),started=performance.now();
 try{const response=await fetch(url,{...options,signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);return {response,ms:performance.now()-started};}
 finally{clearTimeout(timer);}
}
async function speedProbe(){
 const x=await timedFetch(`${SPEED_BASE}/__down?bytes=0&cachebust=${Date.now()}-${Math.random()}`,{},10000);
 await x.response.arrayBuffer();return x.ms;
}
async function runSpeedTest(){
 if(S.speedRunning)return;
 S.speedRunning=true;S.speedStatus='Checking idle latency…';S.speedResults=null;render();
 let probes=[],failed=0,downloadMbps=null,uploadMbps=null,loadedSamples=[],downloadMB=null,uploadMB=null,dnsMs=null;
 const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
 try{
   for(let i=0;i<8;i++){
     try{probes.push(await speedProbe())}catch{failed++}
     S.speedStatus=`Measuring idle latency (${i+1}/8)…`;render();
   }
   if(!probes.length)throw Error('Speed-test endpoint could not be reached. Check internet access or browser/network restrictions.');
   const idle=avg(probes),jitter=avg(probes.slice(1).map((x,i)=>Math.abs(x-probes[i])));
   S.speedStatus='Measuring download throughput and latency under load…';render();
   let start=performance.now(),loadSamples=[];
   const dPromise=(async()=>{const {response}=await timedFetch(`${SPEED_BASE}/__down?bytes=10000000&cachebust=${Date.now()}`,{},30000);const buf=await response.arrayBuffer();const sec=(performance.now()-start)/1000;downloadMB=buf.byteLength/1e6;downloadMbps=sec>0?buf.byteLength*8/sec/1e6:null;})();
   const dProbeLoop=(async()=>{for(let i=0;i<5;i++){try{loadSamples.push(await speedProbe())}catch{failed++}}})();
   await Promise.all([dPromise,dProbeLoop]);loadedSamples.push(...loadSamples);
   S.speedStatus='Measuring upload throughput and latency under load…';render();
   const bytes=1024*1024;const payload=new Uint8Array(bytes);
   // Randomize a sample of each chunk so compression cannot materially inflate the measured rate.
   for(let i=0;i<payload.length;i+=65536){crypto.getRandomValues(payload.subarray(i,Math.min(i+65536,payload.length)));}
   start=performance.now();loadSamples=[];
   const uPromise=(async()=>{const {response}=await timedFetch(`${SPEED_BASE}/__up?cachebust=${Date.now()}`,{method:'POST',body:payload,headers:{'Content-Type':'application/octet-stream'}},30000);await response.arrayBuffer().catch(()=>new ArrayBuffer(0));const sec=(performance.now()-start)/1000;uploadMB=bytes/1e6;uploadMbps=sec>0?bytes*8/sec/1e6:null;})();
   const uProbeLoop=(async()=>{for(let i=0;i<5;i++){try{loadSamples.push(await speedProbe())}catch{failed++}}})();
   await Promise.all([uPromise,uProbeLoop]);loadedSamples.push(...loadSamples);
   S.speedStatus='Measuring DNS lookup time…';render();
   try{const t=performance.now();const res=await fetch(`https://cloudflare-dns.com/dns-query?name=example.com&type=A&cachebust=${Date.now()}`,{headers:{accept:'application/dns-json'},cache:'no-store'});if(res.ok){await res.json();dnsMs=performance.now()-t;}}catch{}
   const loaded=avg(loadedSamples),round=n=>n===null||n===undefined?null:Math.round(n*100)/100;
   S.speedResults={downloadMbps:round(downloadMbps),uploadMbps:round(uploadMbps),idleLatency:round(idle),jitter:round(jitter),loadedLatency:round(loaded),latencyIncrease:loaded===null?null:round(Math.max(0,loaded-idle)),probeLoss:`${failed}/${8+loadedSamples.length} failed`,dnsMs:round(dnsMs),downloadMB:round(downloadMB),uploadMB:round(uploadMB),completedAt:new Date().toLocaleString()};
   S.speedStatus='Test completed. Values are estimates from this browser session.';
 }catch(err){S.speedStatus='Test could not complete: '+(err?.message||'unknown error')+'. The endpoint may be blocked by browser/network policy or CORS.';}
 finally{S.speedRunning=false;render();}
}

function render(){let v={ipv4,advanced:advancedSubnet,ipv6,check:checker,dns,planner,ipplan:ipVlanPlanner,lab:troubleshooting,commands,speed:speedTest,ref:refs,practice:learning};app.innerHTML=nav()+v[S.tab]()+`<footer>Networking Toolkit · Offline calculations · DNS and speed tests require internet</footer>`;const savedTheme=localStorage.getItem('networking-toolkit-theme')||'light';document.body.dataset.theme=savedTheme;const themeButton=$('#themeToggle');if(themeButton){themeButton.innerHTML=savedTheme==='dark'?'☼ <span>Light mode</span>':'◐ <span>Dark mode</span>';themeButton.addEventListener('click',()=>{const next=document.body.dataset.theme==='dark'?'light':'dark';localStorage.setItem('networking-toolkit-theme',next);document.body.dataset.theme=next;themeButton.innerHTML=next==='dark'?'☼ <span>Light mode</span>':'◐ <span>Dark mode</span>'})};
 app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;render()});
 $('#ip')?.addEventListener('input',e=>{S.ip=e.target.value;refreshKeeping('ip')});$('#cidr')?.addEventListener('change',e=>{S.cidr=+e.target.value;render()});
 $('#reset')?.addEventListener('click',()=>{S.ip='192.168.0.1';S.cidr=24;render()});
 $('#copy')?.addEventListener('click',async()=>{let r=c4(S.ip,S.cidr);if(!r)return;let t=`${r.ip}/${r.p}\nNetwork ${r.network}\nFirst ${r.first}\nLast ${r.last}\nBroadcast ${r.broadcast}\nMask ${r.mask}\nWildcard ${r.wild}\nTotal ${r.total}\nUsable ${r.usable}`;try{await navigator.clipboard.writeText(t);$('#copy').textContent='Copied!'}catch{prompt('Copy results',t)}});
 $('#ipv6')?.addEventListener('input',e=>{S.ipv6=e.target.value;refreshKeeping('ipv6')});$('#v6p')?.addEventListener('change',e=>{S.v6p=+e.target.value;render()});
 $('#check')?.addEventListener('input',e=>{S.check=e.target.value;refreshKeeping('check')});
 $('#domain')?.addEventListener('input',e=>S.domain=e.target.value);$('#dtype')?.addEventListener('change',e=>S.dtype=e.target.value);$('#dnsgo')?.addEventListener('click',lookup);
 $('#plan')?.addEventListener('change',e=>{S.plan=+e.target.value;render()});
 $('#search')?.addEventListener('input',e=>{S.search=e.target.value;refreshKeeping('search')});
 $('#checkanswer')?.addEventListener('click',()=>{$('#feedback').textContent=$('#answer').value.trim()==='192.168.0.63'?'Correct!':'Not quite. The /26 block containing .1 ends at .63.'});
 $('#advIp')?.addEventListener('input',e=>S.advIp=e.target.value);
 $('#advPrefix')?.addEventListener('change',e=>{S.advPrefix=+e.target.value;render()});
 $('#vlsm')?.addEventListener('input',e=>S.vlsm=e.target.value);
 $('#runVlsm')?.addEventListener('click',render);
 ['vlanName','vlanId','vlanNetwork','vlanGateway','vlanDns'].forEach(id=>$('#'+id)?.addEventListener('input',e=>S[id]=e.target.value));
 $('#saveVlan')?.addEventListener('click',()=>{
   const m=String(S.vlanNetwork).match(/^(.+)\/(\d{1,2})$/),net=m&&c4(m[1],+m[2]),id=Number(S.vlanId),gw=ipN(S.vlanGateway);
   if(!S.vlanName.trim()||!net||id<1||id>4094||!Number.isInteger(id)||gw===null){alert('Check VLAN name, VLAN ID, network CIDR, and gateway IPv4 address.');return;}
   if(gw<net.net||gw>net.end){if(!confirm('Gateway is outside the entered subnet range. Save anyway?'))return;}
   S.vlans=S.vlans||[];const existing=S.vlans.findIndex(v=>String(v.id)===String(id));
   const item={name:S.vlanName.trim(),id:String(id),network:net.network+'/'+net.p,gateway:S.vlanGateway.trim(),dns:S.vlanDns.trim()};
   if(existing>=0)S.vlans[existing]=item;else S.vlans.push(item);saveWorkspace();render();
 });
 app.querySelectorAll('.deleteVlan').forEach(b=>b.addEventListener('click',()=>{S.vlans.splice(+b.dataset.index,1);saveWorkspace();render()}));
 $('#exportVlans')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(S.vlans||[],null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='networking-toolkit-vlans.json';a.click();URL.revokeObjectURL(a.href)});
 $('#importVlans')?.addEventListener('click',()=>$('#importFile')?.click());
 $('#importFile')?.addEventListener('change',async e=>{try{const arr=JSON.parse(await e.target.files[0].text());if(!Array.isArray(arr)||arr.some(v=>!v||!v.id||!v.network))throw Error('Expected an array of VLAN records.');S.vlans=arr;saveWorkspace();render()}catch(err){alert('Could not import file: '+err.message)}});
 $('#labOs')?.addEventListener('change',e=>{S.labOs=e.target.value;render()});
 $('#labHost')?.addEventListener('input',e=>S.labHost=e.target.value);
 $('#labPort')?.addEventListener('input',e=>S.labPort=e.target.value);
 $('#makeChecklist')?.addEventListener('click',()=>{S.labResult=(labGuides[S.labOs]||labGuides.Windows).map((g,i)=>`${i+1}. ${g[0]}\\n   ${g[1].replaceAll('HOSTNAME',S.labHost||'HOSTNAME').replaceAll('PORT',S.labPort||'PORT')}\\n   ${g[2]}`).join('\\n\\n');render()});
 $('#resolveLab')?.addEventListener('click',async()=>{const host=S.labHost.trim();S.labResult='Checking DNS…';render();try{if(!host||/[^a-z0-9.:-]/i.test(host))throw Error('Enter a hostname or IP-like value.');const u=`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`;const res=await fetch(u,{headers:{accept:'application/dns-json'}});if(!res.ok)throw Error('DNS-over-HTTPS request failed');const data=await res.json();S.labResult=(data.Answer||[]).filter(a=>a.type===1).map(a=>`${a.name} -> ${a.data} (TTL ${a.TTL})`).join('\\n')||`No A records returned (DNS status ${data.Status}).`; }catch(err){S.labResult='DNS check failed: '+err.message}render()});
 $('#commandOs')?.addEventListener('change',e=>{S.commandOs=e.target.value;S.commandTask=(commandCatalog[S.commandOs]||[])[0]?.[0]||'';render()});
 $('#commandTask')?.addEventListener('change',e=>{S.commandTask=e.target.value;render()});
 $('#commandHost')?.addEventListener('input',e=>{S.commandHost=e.target.value;const el=$('#generatedCommand');if(el){const opt=(commandCatalog[S.commandOs]||[]).find(x=>x[0]===S.commandTask);el.textContent=(opt?.[1]||'').replaceAll('{host}',S.commandHost||'HOST').replaceAll('{port}',S.commandPort||'PORT')}});
 $('#commandPort')?.addEventListener('input',e=>{S.commandPort=e.target.value;const el=$('#generatedCommand');if(el){const opt=(commandCatalog[S.commandOs]||[]).find(x=>x[0]===S.commandTask);el.textContent=(opt?.[1]||'').replaceAll('{host}',S.commandHost||'HOST').replaceAll('{port}',S.commandPort||'PORT')}});
 $('#copyCommand')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#generatedCommand').textContent);$('#copyCommand').textContent='Copied!'}catch{prompt('Copy command',$('#generatedCommand').textContent)}});
 $('#runSpeedTest')?.addEventListener('click',runSpeedTest);
 $('#clearSpeedTest')?.addEventListener('click',()=>{S.speedResults=null;S.speedStatus='';render()});
 $('#learnTopic')?.addEventListener('change',e=>{S.learnTopic=e.target.value;S.learnIndex=0;S.learnAnswer='';S.learnFeedback='';render()});
 app.querySelectorAll('input[name="learnAnswer"]').forEach(el=>el.addEventListener('change',e=>S.learnAnswer=e.target.value));
 $('#submitQuiz')?.addEventListener('click',()=>{const items=quiz.filter(x=>S.learnTopic==='All topics'||x.topic===S.learnTopic),q=items[S.learnIndex%Math.max(1,items.length)];if(S.learnAnswer===''){S.learnFeedback='Choose an answer first.';render();return;}if(S.learnFeedback.startsWith('Correct:')||S.learnFeedback.startsWith('Incorrect:'))return;const correct=Number(S.learnAnswer)===q.a;S.learnAnswered++;if(correct)S.learnScore++;S.learnFeedback=(correct?'Correct: ':'Incorrect: ')+q.why;saveWorkspace();render()});
 $('#nextQuiz')?.addEventListener('click',()=>{const items=quiz.filter(x=>S.learnTopic==='All topics'||x.topic===S.learnTopic);S.learnIndex=(S.learnIndex+1)%Math.max(1,items.length);S.learnAnswer='';S.learnFeedback='';render()});
 $('#resetProgress')?.addEventListener('click',()=>{if(confirm('Reset your learning score and progress?')){S.learnScore=0;S.learnAnswered=0;S.learnIndex=0;S.learnAnswer='';S.learnFeedback='';saveWorkspace();render()}});
}
function refreshKeeping(id){let el=$('#'+id),pos=el?.selectionStart;render();let next=$('#'+id);if(next){next.focus();if(pos!==undefined)next.setSelectionRange(pos,pos)}}
render();
