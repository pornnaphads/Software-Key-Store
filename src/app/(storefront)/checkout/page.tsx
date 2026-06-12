import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <header className="checkout-page__heading">
        <span>Secure checkout</span>
        <h1>Checkout</h1>
        <p>ยืนยันข้อมูลและเลือกช่องทางชำระเงินสำหรับสิทธิ์ดิจิทัลของคุณ</p>
      </header>
      <CheckoutForm />
    </main>
  );
}
