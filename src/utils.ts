import fetch from "node-fetch";
import * as path from "path";

export function jsdelivr(packageName: string, version?: string, file?: string) {
  version = !!version ? `@${version}` : "";
  file = !!file ? `/${file}` : "";
  return `https://cdn.jsdelivr.net/npm/${packageName}${version}${file}`;
}

export async function fetchAndReplace(prefix: string, proxyUrl: string) {
  try {
    prefix = await sanitize(prefix);
    const url = jsdelivr(prefix);
    const resp = await fetch(url);
    if (resp.ok) {
      const text = await resp.text();
      return replaceImportPath(
        text,
        proxyUrl + getRootPathFromNpmPackageName(prefix),
        proxyUrl
      );
    }
    throw new Error(
      `Unable to retrieve ${url}: [${resp.status}] ${resp.statusText}`
    );
  } catch (error) {
    console.error(`unable to fetch npm package: ${prefix}`);
    // console.error(error);
  }
  return "";
}

function isJsFile(text: string) {
  return /\.(js|map)$/g.test(text);
}

function isPackage(text: string) {
  let chunks = text.split("/");
  if (chunks.length > 3 || chunks.length <= 1) return false;
  if (chunks[0][0] == "@") {
    return true;
  }
  return chunks.length <= 2;
}

async function sanitize(prefix: string) {
  return addExtension(await getModuleIndex(prefix));
}

function addExtension(text: string) {
  const chunks = path.join(...text.split("/")).split("/");
  if (chunks.length <= 1) return text;
  const lastChunk = chunks[chunks.length - 1];
  // has namespace
  if (chunks[1][0] == "@") {
    return chunks.length > 3 && !isJsFile(lastChunk)
      ? chunks.join("/") + ".js"
      : text;
  }
  return chunks.length > 2 && !isJsFile(lastChunk)
    ? chunks.join("/") + ".js"
    : text;
}

async function getModuleIndex(prefix: string) {
  if (!isPackage(prefix)) {
    return prefix;
  }
  const resp = await fetch(jsdelivr(path.join(prefix, "package.json")));
  if (resp.ok) {
    const spec = await resp.json();
    return path.join(prefix, spec.module ? spec.module : spec.main);
  }
  return prefix;
}

function getRootPathFromNpmPackageName(text: string) {
  let chunks = text.split("/").filter(s => s);
  let ns = "";
  if (chunks.length == 0) return "";
  if (chunks[0][0] == "@") {
    ns = chunks[0] + "/";
    chunks = chunks.slice(1);
  }
  if (/\.js$/.test(chunks[chunks.length - 1])) {
    chunks.pop();
  }
  return `${ns}${chunks.join("/")}/`;
}

function replaceImportPath(
  line: string,
  currentPath: string,
  prefixWith: string = "https://cdn.jsdelivr.net/npm/"
) {
  if (currentPath[currentPath.length - 1] !== "/") currentPath += "/";
  const absImports = /(import|export)([ \n]{0,}{?[^{}~)('!]+}?[ \n]{0,}from[ \n]{0,}[\"'])([@a-z][^'\"]+)([\"'])/gim;
  const relImports = /(import|export)([ \n]{0,}{?[^{}~)('!]+}?[ \n]{0,}from[ \n]{0,}[\"'])(\.[^'\"]+)([\"'])/gim;
  let replaced = line.replace(absImports, `$1$2${prefixWith}$3$4`);
  return replaced.replace(relImports, `$1$2${currentPath}$3$4`);
}
