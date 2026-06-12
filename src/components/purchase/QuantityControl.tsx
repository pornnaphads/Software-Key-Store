interface QuantityControlProps {
  name: string;
  quantity: number;
  stock: number;
  onChange: (quantity: number) => void;
}

export function QuantityControl({
  name,
  onChange,
  quantity,
  stock,
}: QuantityControlProps) {
  const unavailable = stock <= 0;
  const minimum = quantity <= 1 || unavailable;
  const maximum = quantity >= stock || unavailable;

  return (
    <div className="quantity-control">
      <button
        aria-label={`ลดจำนวน ${name}`}
        disabled={minimum}
        onClick={() => {
          if (!minimum) {
            onChange(quantity - 1);
          }
        }}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          remove
        </span>
      </button>
      <input
        aria-label={`จำนวน ${name}`}
        disabled={unavailable}
        max={stock}
        min={unavailable ? 0 : 1}
        readOnly
        type="number"
        value={quantity}
      />
      <button
        aria-label={`เพิ่มจำนวน ${name}`}
        disabled={maximum}
        onClick={() => {
          if (!maximum) {
            onChange(quantity + 1);
          }
        }}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          add
        </span>
      </button>
    </div>
  );
}
