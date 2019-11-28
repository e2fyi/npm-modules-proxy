"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const utils_1 = require("./utils");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const PORT = process.env.PORT || 8080;
const CACHE_DIR = process.env.CACHE_DIR || ".caches";
const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || 1 * 24 * 60 * 60;
const cacheControl = `max-age=${CACHE_MAX_AGE}`;
mkdirp(CACHE_DIR, init);
function cachePath(prefix) {
    return path.resolve(CACHE_DIR, `${prefix}.cache`.replace(/\//g, "."));
}
function init() {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.get("/", async (req, res) => {
        res.redirect("https://github.com/e2fyi/npm-modules-proxy");
    });
    app.get(/[^ ]+/, async (req, res) => {
        const prefix = req.path;
        const cache = cachePath(prefix);
        const proxyUrl = `${req.protocol}://${req.headers.host}/`;
        res.type("application/javascript");
        res.setHeader("Cache-Control", cacheControl);
        if (fs.existsSync(cache)) {
            const stream = fs.createReadStream(cache);
            stream.pipe(res);
            return;
        }
        const payload = await utils_1.fetchAndReplace(prefix, proxyUrl);
        if (payload)
            fs.writeFile(cache, payload, () => { });
        res.send(payload);
    });
    app.listen(PORT, () => {
        console.log(`Server running at: http://localhost:${PORT}/`);
    });
}
