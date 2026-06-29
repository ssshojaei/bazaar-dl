# Bazaar-dl

Generate direct APK download links for [Cafe Bazaar](https://cafebazaar.ir) apps from the command line.

## Requirements

- Node.js 18 or newer

## Install

```bash
npm install -g bazaar-dl
```

Or run without installing:

```bash
npx bazaar-dl https://cafebazaar.ir/app/com.digikala
```

## Usage

```bash
bazaar-dl <cafebazaar-url-or-package-name>
```

### Examples

```bash
# From a Cafe Bazaar app URL
bazaar-dl https://cafebazaar.ir/app/com.digikala

# From a package name
bazaar-dl com.digikala

# Print only the download URL (useful for scripts)
bazaar-dl com.digikala --link-only

# Machine-readable JSON output
bazaar-dl com.digikala --json

# Skip scraping app metadata from the Bazaar page
bazaar-dl com.digikala --no-metadata

# Request a specific Android SDK version
bazaar-dl com.digikala --sdk 33
```

### Sample output

```text
Package: com.digikala
Download: https://appcdn.cafebazaar.ir/apks/....apk?...
Title: دیجی‌کالا
Developer: دیجی‌کالا
Version: 3.5.1
SDK: 33
```

## How it works

1. Parses the Android package name from a Cafe Bazaar URL or accepts a package name directly.
2. Requests a temporary CDN download link from the Cafe Bazaar API (tries SDK 33, 25, then 22 by default).
3. Optionally scrapes app metadata (title, developer, version) from the Bazaar app page.

If the Bazaar website is unreachable, the tool still attempts to resolve the download link from the API.

## Development

```bash
npm install
npm run typecheck
npm run build
npm test
node dist/bin.js com.digikala
```

## License

GPL-3.0-or-later
