import Image from "next/image";

import { getProductAsset } from "@/lib/product-assets";
import type { ProductDetail } from "@/types/commerce";

const TRUST_POINTS = [
  {
    icon: "verified",
    title: "ลิขสิทธิ์แท้ 100%",
    detail: "ตรวจสอบและเปิดใช้งานได้จริง",
  },
  {
    icon: "bolt",
    title: "รับคีย์อัตโนมัติ",
    detail: "จัดส่งทางอีเมลหลังชำระเงิน",
  },
  {
    icon: "support_agent",
    title: "ดูแลหลังการขาย",
    detail: "มีทีมช่วยเหลือทุกขั้นตอน",
  },
] as const;

export function ProductGallery({ product }: { product: ProductDetail }) {
  return (
    <section className="product-gallery" aria-label={`รูปภาพ ${product.name}`}>
      <div className="product-gallery__stage">
        <span className="product-gallery__eyebrow">Digital license</span>
        <Image
          alt={product.name}
          className="product-gallery__image"
          height={520}
          priority
          sizes="(max-width: 767px) 82vw, (max-width: 1100px) 46vw, 420px"
          src={getProductAsset(product.image)}
          width={520}
        />
        <span className="product-gallery__watermark" aria-hidden="true">
          SOFTKEY
        </span>
      </div>

      <div className="product-gallery__trust">
        {TRUST_POINTS.map((point) => (
          <article key={point.title}>
            <span
              aria-hidden="true"
              className="material-symbols-outlined fill"
            >
              {point.icon}
            </span>
            <div>
              <strong>{point.title}</strong>
              <small>{point.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
