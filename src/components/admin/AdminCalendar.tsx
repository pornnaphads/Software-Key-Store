"use client";

import { useEffect, useRef, useState } from "react";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_SHORT_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function AdminCalendar({ initialDate }: { initialDate?: Date }) {
  const today = initialDate ?? new Date();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const calendarRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOutside = (event: PointerEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  const firstWeekday = visibleMonth.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarDays = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div className="admin-calendar" ref={calendarRef}>
      <button
        aria-controls="admin-calendar-dialog"
        aria-expanded={open}
        aria-label="เปิดปฏิทิน"
        className="admin-header-date"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          calendar_month
        </span>
        <span>
          {today.getDate()} {THAI_SHORT_MONTHS[today.getMonth()]}{" "}
          {today.getFullYear()}
        </span>
      </button>

      {open ? (
        <div
          aria-label="ปฏิทิน"
          className="admin-calendar-popover"
          id="admin-calendar-dialog"
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <div className="admin-calendar-header">
            <button
              aria-label="เดือนก่อนหน้า"
              className="admin-calendar-nav"
              onClick={() => moveMonth(-1)}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
            <strong>
              {THAI_MONTHS[visibleMonth.getMonth()]}{" "}
              {visibleMonth.getFullYear()}
            </strong>
            <button
              aria-label="เดือนถัดไป"
              className="admin-calendar-nav"
              onClick={() => moveMonth(1)}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>

          <div className="admin-calendar-grid" aria-hidden="true">
            {WEEKDAYS.map((weekday) => (
              <span className="admin-calendar-weekday" key={weekday}>
                {weekday}
              </span>
            ))}
            {calendarDays.map((day, index) => {
              const date = day
                ? new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth(),
                    day,
                  )
                : null;
              return (
                <span
                  className={
                    date && sameDay(date, today)
                      ? "admin-calendar-day is-today"
                      : "admin-calendar-day"
                  }
                  key={`${day ?? "blank"}-${index}`}
                >
                  {day}
                </span>
              );
            })}
          </div>
          <p className="admin-calendar-note">ปฏิทินสำหรับดูวันที่เท่านั้น</p>
        </div>
      ) : null}
    </div>
  );
}
