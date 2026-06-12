export type ProductImageKey =
  | "windows11_pro"
  | "windows10_pro"
  | "office2021_pro"
  | "adobe_cc"
  | "adobe_photoshop"
  | "adobe_premiere"
  | "kaspersky_total"
  | "eset_smart"
  | "ccleaner_pro"
  | "nordvpn_1yr";

export const PRODUCT_ASSETS: Record<ProductImageKey, string> = {
  windows11_pro: "/assets/softkeystore/products/windows11-pro.png",
  windows10_pro: "/assets/softkeystore/products/windows10-pro.png",
  office2021_pro: "/assets/softkeystore/products/office2021-pro.png",
  adobe_cc: "/assets/softkeystore/products/adobe-creative-cloud.png",
  adobe_photoshop: "/assets/softkeystore/products/adobe-photoshop.png",
  adobe_premiere: "/assets/softkeystore/products/adobe-premiere.png",
  kaspersky_total: "/assets/softkeystore/products/kaspersky-total.png",
  eset_smart: "/assets/softkeystore/products/eset-smart.png",
  ccleaner_pro: "/assets/softkeystore/products/ccleaner-pro.png",
  nordvpn_1yr: "/assets/softkeystore/products/nordvpn.png",
};

const FALLBACK_PRODUCT_ASSET = PRODUCT_ASSETS.office2021_pro;

export function getProductAsset(imageKey: string | null): string {
  if (imageKey && imageKey in PRODUCT_ASSETS) {
    return PRODUCT_ASSETS[imageKey as ProductImageKey];
  }

  return FALLBACK_PRODUCT_ASSET;
}
