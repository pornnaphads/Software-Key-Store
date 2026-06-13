"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface AdminSearchProps {
  defaultValue: string;
  label: string;
  placeholder: string;
}

export function AdminSearch({
  defaultValue,
  label,
  placeholder,
}: AdminSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState({
    baseline: defaultValue,
    value: defaultValue,
  });
  const value = draft.baseline === defaultValue ? draft.value : defaultValue;

  useEffect(() => {
    if (value === defaultValue) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = value.trim();

      if (normalized) {
        params.set("search", normalized);
      } else {
        params.delete("search");
      }
      params.set("page", "1");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [defaultValue, pathname, router, searchParams, value]);

  return (
    <label className="admin-search">
      <span className="admin-search__label">{label}</span>
      <span className="admin-search__field">
        <span aria-hidden="true" className="material-symbols-outlined">
          search
        </span>
        <input
          aria-label={label}
          onChange={(event) =>
            setDraft({
              baseline: defaultValue,
              value: event.target.value,
            })
          }
          placeholder={placeholder}
          type="search"
          value={value}
        />
      </span>
    </label>
  );
}
