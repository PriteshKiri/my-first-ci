"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { formatCents, splitEvenly, toCents } = require("../src/money");

describe("toCents", () => {
  it("converts dollars to cents", () => {
    assert.equal(toCents(12.34), 1234);
    assert.equal(toCents(0), 0);
  });

  it("rounds to the nearest cent after scaling", () => {
    assert.equal(toCents(86.4), 8640);
    assert.equal(toCents(19.99), 1999);
    assert.equal(toCents(0.1 + 0.2), 30);
  });

  it("rejects negative and non-numeric amounts", () => {
    assert.throws(() => toCents(-1), RangeError);
    assert.throws(() => toCents("10"), TypeError);
    assert.throws(() => toCents(Number.NaN), TypeError);
  });
});

describe("formatCents", () => {
  it("prints a dollar amount", () => {
    assert.equal(formatCents(10870), "$108.70");
    assert.equal(formatCents(5), "$0.05");
    assert.equal(formatCents(0), "$0.00");
    assert.equal(formatCents(-4490), "-$44.90");
  });

  it("rejects a fractional cent", () => {
    assert.throws(() => formatCents(10.5), TypeError);
  });
});

describe("splitEvenly", () => {
  it("returns the whole amount when there is one person", () => {
    assert.deepEqual(splitEvenly(2500, 1), [2500]);
    assert.deepEqual(splitEvenly(0, 1), [0]);
  });

  it("gives leftover cents to the earliest shares", () => {
    assert.deepEqual(splitEvenly(100, 3), [34, 33, 33]);
    assert.deepEqual(splitEvenly(1, 3), [1, 0, 0]);
  });

  it("keeps the shares equal to the original total", () => {
    const shares = splitEvenly(8640, 3);
    assert.equal(shares.reduce((sum, share) => sum + share, 0), 8640);
  });

  it("rejects an empty group", () => {
    assert.throws(() => splitEvenly(100, 0), RangeError);
  });
});
