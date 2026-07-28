# barebase

The installer and project scaffolder for [BareBase](https://barebase.io) - everything your backend needs, nothing it does not.

BareBase is a zero-dependency, drop-in replacement for Directus and Strapi. One engine that runs on Bun, Node 22+, and Cloudflare Workers, with a built-in MCP server, first-class realtime, and native ClickHouse mounts. This package is the free front door: it scaffolds a project, downloads the engine binary for your platform (sha256-verified from barebase.io), and forwards every engine command to it.

## Install

npm:

    npm install -g barebase

pip:

    pip install barebase

Or run without installing:

    npx barebase init my-app

## Use

    barebase init my-app
    cd my-app
    barebase dev

The first engine command downloads the platform binary from https://barebase.io/dl/ and verifies it against the published sha256sums. `barebase update` re-downloads it. Supported platforms: linux x64/arm64, macOS x64/arm64, Windows x64.

## Docs

Full documentation, downloads, and a free self-host license: https://barebase.io

## License

This installer is MIT licensed. The BareBase engine is a separate commercial product, licensed per major version. See https://barebase.io/pricing.
