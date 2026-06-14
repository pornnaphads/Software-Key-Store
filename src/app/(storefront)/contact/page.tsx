import styles from "./contact.module.css";

const contactMethods = [
  {
    icon: "mail",
    title: "อีเมล",
    detail: "afphultl09@gmail.com",
  },
  {
    icon: "call",
    title: "เบอร์โทรศัพท์",
    detail: "0653296340",
  },
  {
    icon: "schedule",
    title: "เวลาทำการ",
    detail: "เปิดให้บริการ 24 ชั่วโมง ทุกวัน (24/7 Support)",
  },
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>ติดต่อเรา</h1>
        <p>
          หากคุณมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ
          หรือต้องการความช่วยเหลือด้านเทคนิค ทีมงานของเราพร้อม
          <br />
          ดูแลคุณทุกช่วงเวลา
        </p>
      </header>

      <section aria-label="ข้อมูลการติดต่อ" className={styles.contactGrid}>
        {contactMethods.map((method) => (
          <article className={styles.contactCard} key={method.title}>
            <div className={styles.icon}>
              <span aria-hidden="true" className="material-symbols-outlined">
                {method.icon}
              </span>
            </div>
            <div>
              <h2>{method.title}</h2>
              <p>{method.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
