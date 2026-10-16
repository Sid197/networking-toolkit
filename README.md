# Networking Toolkit v3 feature update

This bundle contains the updated `src/main.js`, `src/style.css`, and `public/sw.js`.

## Features added
- Advanced subnet calculator: CIDR details and VLSM allocation.
- Network troubleshooting lab: Windows/Linux command checklist and browser DNS-over-HTTPS check.
- IP address and VLAN planner: local inventory, overlap warnings, JSON export/import.
- Command generator: Linux, Windows, Cisco IOS, AWS CLI, Docker, and Kubernetes.
- Learning mode: topic-filtered quiz, explanations, locally stored score/progress.

## Apply to existing Vite project (PowerShell)
From `C:\Siddharth\networking-toolkit-pwa`, back up your existing files first, then copy the three files from this bundle into the matching paths:
```powershell
Copy-Item .\src\main.js .\src\main.js.bak
Copy-Item .\src\style.css .\src\style.css.bak
Copy-Item .\public\sw.js .\public\sw.js.bak
# Extract this bundle somewhere, then copy its src\main.js, src\style.css and public\sw.js to the matching project paths.
npm run build
```
If build succeeds:
```powershell
git status --short
git add src/main.js src/style.css public/sw.js
git commit -m "Add networking labs and planning tools"
git push origin main
```
Check GitHub Actions before testing the Pages URL. Hard refresh the page or unregister the previous service worker if the old version is cached.

## Notes
- Existing features are retained.
- VLANs and learning scores are stored locally in the browser; export a JSON backup before clearing browser site data.
- Browser-based DNS uses Cloudflare DNS-over-HTTPS. It does not perform native ping, traceroute, or TCP socket tests.
- Generated commands are not executed by the app. Review before running on production systems.


## Internet speed test addition

This bundle adds a browser-based speed test that attempts download/upload throughput, idle HTTP request timing, timing variation, loaded request timing, HTTP probe failures, and DNS-over-HTTPS lookup time using public Cloudflare endpoints. It requires internet and may be blocked by browser/network CORS policies. HTTP probe failures are not ICMP packet loss; loaded latency is an approximation, not a certified bufferbloat test. The app should not treat these measurements as an ISP-grade network diagnostic.
