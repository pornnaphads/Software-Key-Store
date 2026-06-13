import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateProductImageInput(file: {
  size: number;
  type: string;
}) {
  if (file.size <= 0) {
    throw new Error("IMAGE_EMPTY");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("IMAGE_TYPE_NOT_ALLOWED");
  }
}

export function isManagedProductImageUrl(url: string, baseUrl: string) {
  try {
    const normalizedBase = new URL(`${baseUrl.replace(/\/$/, "")}/`);
    const candidate = new URL(url);

    return (
      candidate.origin === normalizedBase.origin &&
      candidate.pathname.startsWith(normalizedBase.pathname)
    );
  } catch {
    return false;
  }
}

function uploadConfig() {
  const directory = process.env.PRODUCT_UPLOAD_DIR;
  const baseUrl = process.env.PRODUCT_UPLOAD_BASE_URL;
  if (!directory || !baseUrl) {
    throw new Error("UPLOAD_CONFIG_MISSING");
  }

  return {
    directory: path.resolve(directory),
    baseUrl: baseUrl.replace(/\/$/, ""),
  };
}

function isPathInside(directory: string, target: string): boolean {
  const relative = path.relative(directory, target);
  return (
    relative.length > 0 &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

export async function storeProductImage(file: File) {
  validateProductImageInput(file);
  const { directory, baseUrl } = uploadConfig();
  const filename = `${randomUUID()}.webp`;
  const outputPath = path.resolve(directory, filename);

  if (!isPathInside(directory, outputPath)) {
    throw new Error("UPLOAD_PATH_INVALID");
  }

  const bytes = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toBuffer();

  await mkdir(directory, { recursive: true });
  await writeFile(outputPath, bytes);

  return {
    path: outputPath,
    url: `${baseUrl}/${filename}`,
  };
}

export async function removeManagedProductImage(url: string) {
  let config;
  try {
    config = uploadConfig();
  } catch {
    return;
  }

  if (!isManagedProductImageUrl(url, config.baseUrl)) {
    return;
  }

  let filename: string;
  try {
    filename = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
  } catch {
    return;
  }

  if (!/^[0-9a-f-]{36}\.webp$/i.test(filename)) {
    return;
  }

  const target = path.resolve(config.directory, filename);
  if (!isPathInside(config.directory, target)) {
    return;
  }

  await rm(target, { force: true });
}
