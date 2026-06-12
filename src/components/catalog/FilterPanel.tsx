import type {
  CatalogAvailability,
  CatalogCategory,
} from "@/types/commerce";

interface FilterPanelProps {
  availability: CatalogAvailability;
  category: CatalogCategory;
  showCategories: boolean;
  onAvailabilityChange: (availability: CatalogAvailability) => void;
  onCategoryChange: (category: CatalogCategory) => void;
  onClear: () => void;
}

const categories: Array<{ value: CatalogCategory; label: string }> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "windows", label: "Windows" },
  { value: "office", label: "Microsoft Office" },
  { value: "design", label: "งานออกแบบ" },
  { value: "security", label: "ความปลอดภัย" },
  { value: "vpn", label: "VPN" },
];

const availabilityOptions: Array<{
  value: CatalogAvailability;
  label: string;
}> = [
  { value: "all", label: "ทุกสถานะ" },
  { value: "in-stock", label: "พร้อมจำหน่าย" },
  { value: "out-of-stock", label: "สินค้าหมด" },
];

export function FilterPanel({
  availability,
  category,
  onAvailabilityChange,
  onCategoryChange,
  onClear,
  showCategories,
}: FilterPanelProps) {
  return (
    <div aria-label="ตัวกรองสินค้า" className="filter-panel" role="region">
      {showCategories ? (
        <fieldset>
          <legend>หมวดหมู่</legend>
          <div className="filter-panel__options">
            {categories.map((option) => (
              <button
                key={option.value}
                aria-pressed={category === option.value}
                onClick={() => onCategoryChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend>สถานะสินค้า</legend>
        <div className="filter-panel__options">
          {availabilityOptions.map((option) => (
            <button
              key={option.value}
              aria-pressed={availability === option.value}
              onClick={() => onAvailabilityChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="filter-panel__clear" onClick={onClear} type="button">
        ล้างตัวกรอง
      </button>
    </div>
  );
}
