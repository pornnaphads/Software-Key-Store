"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  // Generate page numbers
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Pagination logic with ellipsis
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push("...");
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    
    pages.push(totalPages);
  }

  return (
    <nav className="catalog-pagination" aria-label="การนำทางหน้า">
      <ul className="catalog-pagination__list">
        <li>
          <button
            className="catalog-pagination__item catalog-pagination__item--nav"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="หน้าก่อนหน้า"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_left
            </span>
          </button>
        </li>
        
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="catalog-pagination__ellipsis">...</span>
              </li>
            );
          }
          
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <button
                className={`catalog-pagination__item ${isCurrent ? "catalog-pagination__item--active" : ""}`}
                onClick={() => onPageChange(page as number)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`หน้า ${page}`}
              >
                {page}
              </button>
            </li>
          );
        })}
        
        <li>
          <button
            className="catalog-pagination__item catalog-pagination__item--nav"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="หน้าถัดไป"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_right
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
