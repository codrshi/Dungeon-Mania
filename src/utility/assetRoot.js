/* assetRoot.js
 *
 * Resolves the directory that contains the runtime asset folders --
 * `public/` (sprites, audio, CSS, JS) and `template/` (EJS views).
 *
 * Two execution modes:
 *
 *  1. Source / Docker: We run `node src/server.js`. `import.meta.url`
 *     points at this file inside src/utility/, so the asset root is
 *     one level up at src/, matching the on-disk layout.
 *
 *  2. SEA binary: The bundled CJS lives inside `dungeon-mania.exe`,
 *     and `public/` and `template/` are shipped as siblings of the
 *     executable inside the release zip. We detect this via
 *     `node:sea`'s `isSea()` helper and root the assets at
 *     `dirname(process.execPath)`.
 *
 * Keeping this in one place means app.js (and anyone else who needs to
 * load on-disk assets) doesn't have to special-case the two modes.
 *
 * Bundling note: esbuild transforms this ESM source into a CommonJS
 * bundle for SEA, where `import.meta` is empty but `require` is
 * available. The detection below works in BOTH worlds:
 *
 *   - In ESM source, `typeof require === "undefined"` short-circuits
 *     the SEA probe and we use import.meta.url.
 *   - In bundled CJS, `require("node:sea")` succeeds and we trust
 *     `isSea()` for the actual mode.
 */

import path from "path";
import { fileURLToPath } from "url";

function tryLoadSeaModule() {
    try {
        if (typeof require === "function") {
            return require("node:sea");
        }
    } catch (_err) {
    }
    return null;
}

function isRunningAsSea() {
    const sea = tryLoadSeaModule();
    return Boolean(sea && typeof sea.isSea === "function" && sea.isSea());
}

function resolveAssetRoot() {
    if (isRunningAsSea()) {
        return path.dirname(process.execPath);
    }
    // src/utility/assetRoot.js -> src/utility -> src
    return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

const ASSET_ROOT = resolveAssetRoot();

export default ASSET_ROOT;
