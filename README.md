# Networking Toolkit PWA (Option 1)

Installable offline-capable web app version of the personal Networking Toolkit.

## Requirements
- Node.js LTS: https://nodejs.org/
- A GitHub account for free HTTPS hosting: https://github.com/

## Build on Windows
Extract the ZIP, open PowerShell in the extracted folder, then run:
```powershell
npm install
npm run build
```
The production site is generated in `dist`.

## Publish it using GitHub Pages
1. Create a GitHub repository named `networking-toolkit`.
2. Upload the project source files to the repository, including `.github/workflows/deploy.yml`. Do not upload `node_modules` or `dist`.
3. In the repository, open **Settings → Pages** and set the source to **GitHub Actions**.
4. Push the project to the `main` branch. The included workflow builds and deploys `dist`.
5. Your site URL will look like `https://YOUR-USERNAME.github.io/networking-toolkit/`.

## Install on Android
1. Open the published HTTPS URL in Chrome on your phone or tablet.
2. Open Chrome's three-dot menu and tap **Install app** or **Add to Home screen**.
3. Confirm. The app icon appears on your home screen.
4. Open the app once while online, then test airplane mode.

## Update later
Edit the source, commit and push to `main`. GitHub Actions deploys the new version. Open the installed app while online to fetch updates.

## Included
- IPv4 subnet calculator for `/8` through `/32`
- Network, first/last usable, broadcast, mask and wildcard mask
- Host counts and binary display
- CIDR table, private ranges, common ports and networking definitions
- Simple subnetting practice
- Offline support and copyable results

The calculator runs locally and does not send entered IPs to a server. Gateway discovery, ping, traceroute and DNS queries are not implemented in this version.
