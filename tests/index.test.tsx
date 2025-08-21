import { beforeAll, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parsePackage, readPackage, readPackageSync } from "../src";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootCwd = path.join(dirname, "..");
const rootPkgName: string = JSON.parse(fs.readFileSync(path.join(rootCwd, "package.json"), "utf8")).name;

beforeAll(() => {
  process.chdir(dirname);
});

test("async", async () => {
  const package_ = await readPackage();
  expect(package_.name).toBe("unicorn");
  expect(package_._id).toBeTruthy();
});

test("async - cwd option", async () => {
  const package_ = await readPackage({ cwd: rootCwd });
  expect(package_.name).toBe(rootPkgName);
  await expect(readPackage({ cwd: pathToFileURL(rootCwd) })).resolves.toEqual(package_);
});

test("async - normalize option", async () => {
  const package_ = await readPackage({ normalize: false });
  expect(package_.name).toBe("unicorn ");
});

test("sync", () => {
  const package_ = readPackageSync();
  expect(package_.name).toBe("unicorn");
  expect(package_._id).toBeTruthy();
});

test("sync - cwd option", () => {
  const package_ = readPackageSync({ cwd: rootCwd });
  expect(package_.name).toBe(rootPkgName);
  expect(readPackageSync({ cwd: pathToFileURL(rootCwd) })).toEqual(package_);
});

test("sync - normalize option", () => {
  const package_ = readPackageSync({ normalize: false });
  expect(package_.name).toBe("unicorn ");
});

const pkgJson = {
  name: "unicorn ",
  version: "1.0.0",
  type: "module",
};

test("parsePackage - json input", () => {
  const package_ = parsePackage(pkgJson);
  expect(package_.name).toBe("unicorn");
  expect(readPackageSync()).toEqual(package_);
});

test("parsePackage - string input", () => {
  const package_ = parsePackage(JSON.stringify(pkgJson));
  expect(package_.name).toBe("unicorn");
  expect(readPackageSync()).toEqual(package_);
});

test("parsePackage - normalize option", () => {
  const package_ = parsePackage(pkgJson, { normalize: false });
  expect(package_.name).toBe("unicorn ");
  expect(readPackageSync({ normalize: false })).toEqual(package_);
});

test("parsePackage - errors on invalid input", () => {
  expect(() => parsePackage(["foo", "bar"] as unknown as any)).toThrow("`packageFile` should be either an `object` or a `string`.");

  expect(() => parsePackage(null as unknown as any)).toThrow("`packageFile` should be either an `object` or a `string`.");

  expect(() => parsePackage((() => ({ name: "unicorn" })) as unknown as any)).toThrow("`packageFile` should be either an `object` or a `string`.");
});

test("parsePackage - does not modify source object", () => {
  const pkgObject = { name: "unicorn", version: "1.0.0" };
  const package_ = parsePackage(pkgObject);
  expect(pkgObject).not.toBe(package_);
});
