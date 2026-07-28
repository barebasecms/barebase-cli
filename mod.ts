/**
 * BareBase CLI - installer and project scaffolder for BareBase, the
 * zero-dependency headless CMS (Directus-compatible engine, built-in MCP
 * server, first-class realtime, ClickHouse mounts).
 *
 * This JSR package mirrors the npm installer. Runtime entry points:
 *
 * ```sh
 * npm install -g barebasecms   # node
 * pip install barebase         # python
 * docker run barebase/barebase # docker
 * ```
 *
 * @module
 */

/** Product homepage. */
export const HOMEPAGE = "https://barebase.io";

/** Engine version this installer tracks. */
export const ENGINE_VERSION = "1.0.0";

/** Download URL for a platform engine binary. */
export function engineArtifactUrl(platform: "windows-x64" | "darwin-arm64" | "darwin-x64" | "linux-arm64" | "linux-x64"): string {
  const ext = platform === "windows-x64" ? ".exe" : "";
  return `${HOMEPAGE}/releases/barebase-${ENGINE_VERSION}-${platform}${ext}`;
}
