"use strict";

function toCents(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new TypeError("amount must be a finite number");
  }
  if (amount < 0) {
    throw new RangeError("amount cannot be negative");
  }
  // Scale first, then round. Values such as 86.4 * 100 are not exact integers.
  return Math.round(amount * 100);
}

function formatCents(cents) {
  if (!Number.isInteger(cents)) {
    throw new TypeError("cents must be an integer");
  }
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = String(absolute % 100).padStart(2, "0");
  return `${sign}$${dollars}.${remainder}`;
}

function splitEvenly(totalCents, count) {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new RangeError("totalCents must be a non-negative integer");
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("count must be an integer greater than 0");
  }

  const base = Math.floor(totalCents / count);
  return Array.from({ length: count }, () => base);
}

module.exports = { toCents, formatCents, splitEvenly };
