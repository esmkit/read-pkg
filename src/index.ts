import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import parseJson from "@esmkit/parse-json";
import normalizePackageData from "normalize-package-data";

export type ReadPackageOptions = {
  cwd?: string | URL;
  normalize?: boolean;
};

export type ParsePackageOptions = {
  normalize?: boolean;
};

const toPath = (urlOrPath: string | URL | undefined) => (urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath);

const getPackagePath = (cwd: string | URL | undefined) => path.resolve(toPath(cwd) ?? ".", "package.json");

const _readPackage = (file: Record<string, any> | string, normalize: boolean) => {
  const json: any = typeof file === "string" ? parseJson(file) : file;

  if (normalize) {
    normalizePackageData(json);
  }

  return json;
};

export async function readPackage({ cwd, normalize = true }: ReadPackageOptions = {}) {
  const packageFile = await fsPromises.readFile(getPackagePath(cwd), "utf8");
  return _readPackage(packageFile, normalize);
}

export function readPackageSync({ cwd, normalize = true }: ReadPackageOptions = {}) {
  const packageFile = fs.readFileSync(getPackagePath(cwd), "utf8");
  return _readPackage(packageFile, normalize);
}

export function parsePackage(packageFile: Record<string, any> | string, { normalize = true }: ParsePackageOptions = {}) {
  const isObject = packageFile !== null && typeof packageFile === "object" && !Array.isArray(packageFile);
  const isString = typeof packageFile === "string";

  if (!isObject && !isString) {
    throw new TypeError("`packageFile` should be either an `object` or a `string`.");
  }

  // Input should not be modified - if `structuredClone` is available, do a deep clone, shallow otherwise
  // TODO: Remove shallow clone when targeting Node.js 18
  const clonedPackageFile = isObject
    ? // eslint-disable-next-line no-undef
      globalThis.structuredClone === undefined
      ? { ...packageFile }
      : structuredClone(packageFile)
    : packageFile;

  return _readPackage(clonedPackageFile, normalize);
}
