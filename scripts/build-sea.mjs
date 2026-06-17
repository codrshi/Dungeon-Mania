#!/usr/bin/env node
/*
 * build-sea.mjs
 *
 * Builds a Node Single Executable Application (SEA) for the host OS and
 * packs it into a release zip at build/DungeonMania-<platform>-<arch>.zip.
 *
 * Layout of the produced zip:
 *
 *   DungeonMania-<platform>-<arch>/
 *     dungeon-mania[.exe]      Node runtime + bundled server, one file
 *     public/                  static assets (sprites, audio, CSS, JS)
 *     template/                EJS views
 *
 * Pipeline (each stage logs its progress so CI logs are easy to read):
 *
 *   1. Wipe and re-create build/.
 *   2. esbuild bundles src/server.js -> build/server.bundle.cjs as a
 *      single self-contained CommonJS file. We target CJS because Node
 *      SEA in Node 20 only accepts CJS mains.
 *   3. `node --experimental-sea-config sea-config.json` produces
 *      build/sea-prep.blob from that bundle.
 *   4. Copy the running Node binary (process.execPath) to
 *      build/dungeon-mania[.exe] as our binary "host".
 *   5. On macOS, strip the codesign signature so postject can rewrite
 *      the binary; on Windows we similarly leave any signtool work as
 *      a TODO (the official nodejs.org binaries are signed by Microsoft
 *      so we ad-hoc re-sign as best we can later).
 *   6. postject injects the SEA blob into the binary using the
 *      sentinel + fuse Node looks for at startup.
 *   7. On macOS, ad-hoc re-sign so Gatekeeper accepts the new binary.
 *   8. Copy src/public/ and src/template/ alongside the binary.
 *   9. Zip the staging tree.
 *
 * The script is intentionally CI-friendly: it relies only on Node built
 * -ins + the three dev dependencies (esbuild, postject, archiver) and
 * needs no environment beyond a Node 20+ install + (on macOS) codesign.
 */

import { execFileSync } from "node:child_process";
import {
    cpSync,
    copyFileSync,
    createWriteStream,
    chmodSync,
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build as esbuild } from "esbuild";
import { inject as postjectInject } from "postject";
import { ZipArchive } from "archiver";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");
const BUILD_DIR = path.join(REPO_ROOT, "build");
const BUNDLE_PATH = path.join(BUILD_DIR, "server.bundle.cjs");
const BLOB_PATH = path.join(BUILD_DIR, "sea-prep.blob");
const SEA_CONFIG_PATH = path.join(REPO_ROOT, "sea-config.json");

const PLATFORM = process.platform; // "win32" | "darwin" | "linux"
const ARCH = process.arch;         // "x64" | "arm64" | ...
const PLATFORM_TAG = PLATFORM === "win32" ? "win" : PLATFORM === "darwin" ? "macos" : "linux";
const BINARY_NAME = PLATFORM === "win32" ? "dungeon-mania.exe" : "dungeon-mania";
const STAGING_DIR_NAME = `DungeonMania-${PLATFORM_TAG}-${ARCH}`;
const STAGING_DIR = path.join(BUILD_DIR, STAGING_DIR_NAME);
const STAGING_BINARY = path.join(STAGING_DIR, BINARY_NAME);
const ZIP_PATH = path.join(BUILD_DIR, `${STAGING_DIR_NAME}.zip`);

function log(step, msg) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [build-sea ${step}] ${msg}`);
}

async function main() {
    log("0/9", `target = ${PLATFORM_TAG}/${ARCH}, host node = ${process.version}`);

    log("1/9", "wiping build/");
    await wipeBuildDir();
    mkdirSync(BUILD_DIR, { recursive: true });
    mkdirSync(STAGING_DIR, { recursive: true });

    log("2/9", "esbuild: bundling src/server.js -> build/server.bundle.cjs");
    await esbuild({
        entryPoints: [path.join(REPO_ROOT, "src", "server.js")],
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "node20",
        outfile: BUNDLE_PATH,
        // Node SEA + CJS chokes on top-level await; we've structured
        // src/server.js to be TLA-free, but keep the check on so any
        // regression fails the build loudly.
        supported: { "top-level-await": false },
        // Keep `node:*` and `node:sea` as external; everything else
        // (express, ejs, sillyname, env-paths, open, etc.) gets inlined.
        external: [],
        // Express and EJS use a few `eval`-style requires that esbuild
        // warns about; silence the noise but keep errors visible.
        logLevel: "warning",
        legalComments: "none",
        minify: false,
        // assetRoot.js touches `import.meta.url`, but only on the dev /
        // source path (guarded by isRunningAsSea()). In the SEA bundle
        // that branch is dead, so esbuild's "empty import.meta" warning
        // is a false positive and we silence it.
        logOverride: { "empty-import-meta": "silent" },
    });

    log("3/9", `node --experimental-sea-config ${path.relative(REPO_ROOT, SEA_CONFIG_PATH)} -> ${path.relative(REPO_ROOT, BLOB_PATH)}`);
    execFileSync(
        process.execPath,
        ["--experimental-sea-config", SEA_CONFIG_PATH],
        { cwd: REPO_ROOT, stdio: "inherit" }
    );

    log("4/9", `copying host node binary (${process.execPath}) -> ${path.relative(REPO_ROOT, STAGING_BINARY)}`);
    copyFileSync(process.execPath, STAGING_BINARY);
    if (PLATFORM !== "win32") {
        chmodSync(STAGING_BINARY, 0o755);
    }

    if (PLATFORM === "darwin") {
        log("5/9", "macOS: removing codesign signature so postject can edit the Mach-O");
        try {
            execFileSync("codesign", ["--remove-signature", STAGING_BINARY], { stdio: "inherit" });
        } catch (err) {
            log("5/9", `warning: codesign --remove-signature failed (${err.message}). injection may still succeed.`);
        }
    } else {
        log("5/9", "skipping signature strip (not macOS)");
    }

    log("6/9", "postject: injecting SEA blob into the binary");
    const blob = readFileSync(BLOB_PATH);
    const injectOpts = {
        sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
    };
    if (PLATFORM === "darwin") {
        injectOpts.machoSegmentName = "NODE_SEA";
    }
    await postjectInject(STAGING_BINARY, "NODE_SEA_BLOB", blob, injectOpts);

    if (PLATFORM === "darwin") {
        log("7/9", "macOS: ad-hoc re-signing the binary so Gatekeeper accepts it");
        try {
            execFileSync("codesign", ["--sign", "-", STAGING_BINARY], { stdio: "inherit" });
        } catch (err) {
            log("7/9", `warning: codesign --sign - failed (${err.message}). users will hit Gatekeeper on first run.`);
        }
    } else {
        log("7/9", "skipping re-sign (not macOS)");
    }

    log("8/9", "copying src/public/ and src/template/ next to the binary");
    cpSync(path.join(REPO_ROOT, "src", "public"), path.join(STAGING_DIR, "public"), { recursive: true });
    cpSync(path.join(REPO_ROOT, "src", "template"), path.join(STAGING_DIR, "template"), { recursive: true });

    log("9/9", `creating ${path.relative(REPO_ROOT, ZIP_PATH)}`);
    await zipDirectory(STAGING_DIR, ZIP_PATH, STAGING_DIR_NAME);

    const sizeMb = (statSync(ZIP_PATH).size / (1024 * 1024)).toFixed(2);
    log("ok", `built ${path.relative(REPO_ROOT, ZIP_PATH)} (${sizeMb} MB).`);
}

/**
 * Wipes the build directory with EPERM-resilient retries.
 *
 * On Windows, if a previous `dungeon-mania.exe` from an earlier build
 * is still running, the OS holds an exclusive lock on the file and
 * `rmSync` fails with EPERM / EBUSY. We retry a handful of times with a
 * short backoff to ride out file-handle release on a clean shutdown,
 * then surface a clear, actionable error pointing the user at the
 * culprit instead of dumping a stack trace.
 */
async function wipeBuildDir() {
    if (!existsSync(BUILD_DIR)) return;

    const MAX_ATTEMPTS = 5;
    const BACKOFF_MS = 400;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            rmSync(BUILD_DIR, { recursive: true, force: true });
            return;
        } catch (err) {
            const isLockError = err && (err.code === "EPERM" || err.code === "EBUSY" || err.code === "ENOTEMPTY");
            if (!isLockError || attempt === MAX_ATTEMPTS) {
                if (isLockError) {
                    const hint = PLATFORM === "win32"
                        ? `Hint: an old ${BINARY_NAME} is probably still running. Run\n` +
                          `       Get-Process | Where-Object { $_.ProcessName -like "dungeon-mania*" } | Stop-Process -Force\n` +
                          `       and retry 'npm run build:sea'.`
                        : `Hint: an old ${BINARY_NAME} may still be running. Run 'pkill -f dungeon-mania' and retry.`;
                    throw new Error(
                        `could not wipe ${BUILD_DIR} (code=${err.code}); a build artifact is locked.\n${hint}`
                    );
                }
                throw err;
            }
            log("1/9", `wipe attempt ${attempt}/${MAX_ATTEMPTS} hit ${err.code}; retrying in ${BACKOFF_MS}ms`);
            await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS));
        }
    }
}

function zipDirectory(dir, outZip, dirNameInsideZip) {
    return new Promise((resolve, reject) => {
        if (!existsSync(dir)) {
            reject(new Error(`directory to zip does not exist: ${dir}`));
            return;
        }
        const output = createWriteStream(outZip);
        const archive = new ZipArchive({ zlib: { level: 9 } });
        output.on("close", resolve);
        archive.on("warning", (err) => {
            if (err.code === "ENOENT") return;
            reject(err);
        });
        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(dir, dirNameInsideZip);
        archive.finalize();
    });
}

main().catch((err) => {
    console.error("[build-sea] FAILED:", err && err.stack ? err.stack : err);
    process.exit(1);
});
