# Networking Toolkit PWA v2

Includes IPv4 subnet calculator, basic IPv6 prefix calculator, IPv4 range checker, DNS-over-HTTPS lookup, IPv4 subnet planner, searchable port/concept reference, and subnetting practice.

## Update the existing repository
1. Extract this ZIP to a temporary folder.
2. Copy its contents into `C:\Siddharth\networking-toolkit-pwa`, overwriting existing files. Include the `.github` folder. Do not copy `node_modules` or `dist`.
3. In PowerShell in the existing project folder, run:
```powershell
npm install
npm run build
git add .
git commit -m "Expand networking toolkit with IPv6 DNS and subnet planner"
git push
```
4. Check https://github.com/Sid197/networking-toolkit/actions for a green check.
5. Open https://sid197.github.io/networking-toolkit/ on your phone. If an installed PWA shows old files, close and reopen while online or clear the site's cache.

DNS queries are sent to Cloudflare DNS-over-HTTPS and require internet. IPv4 classification is a local range-based check, not a reachability test. IPv6 supports normal group notation and `::` compression but not IPv4-embedded forms. Subnet planner limits display to 256 child rows. AWS reserves five IPv4 addresses per subnet.
