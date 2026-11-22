"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { describe, it } = require("node:test");
const { settle } = require("../src/ledger");

describe("settle", () => {
  it("returns no balances when there are no expenses", () => {
    assert.deepEqual(settle([]), { expenses: [], balances: {}, transfers: [] });
  });

  it("splits a shared bill and keeps the group at zero", () => {
    const result = settle([
      { description: "Dinner", payer: "Ava", amount: 30, participants: ["Ava", "Ben", "Cho"] },
    ]);

    assert.deepEqual(result.balances, { Ava: 2000, Ben: -1000, Cho: -1000 });
    assert.deepEqual(result.transfers, [
      { from: "Ben", to: "Ava", cents: 1000 },
      { from: "Cho", to: "Ava", cents: 1000 },
    ]);
    assert.equal(sum(result.balances), 0);
  });

  it("lets someone pay for a group they are not part of", () => {
    const result = settle([
      { payer: "Ava", amount: 40, participants: ["Ben", "Cho"] },
    ]);

    assert.deepEqual(result.balances, { Ava: 4000, Ben: -2000, Cho: -2000 });
  });

  it("settles a weekend with uneven bills", () => {
    const result = settle([
      { payer: "Ava", amount: 240, participants: ["Ava", "Ben", "Cho"] },
      { payer: "Ben", amount: 86.4, participants: ["Ava", "Ben", "Cho"] },
      { payer: "Cho", amount: 45, participants: ["Ava", "Ben"] },
    ]);

    assert.deepEqual(result.balances, { Ava: 10870, Ben: -4490, Cho: -6380 });
    assert.deepEqual(result.transfers, [
      { from: "Cho", to: "Ava", cents: 6380 },
      { from: "Ben", to: "Ava", cents: 4490 },
    ]);
  });

  it("reports an already even group as settled", () => {
    const result = settle([
      { payer: "Ava", amount: 10, participants: ["Ben"] },
      { payer: "Ben", amount: 10, participants: ["Ava"] },
    ]);

    assert.deepEqual(result.balances, { Ava: 0, Ben: 0 });
    assert.deepEqual(result.transfers, []);
  });

  it("settles the weekend trip example file", () => {
    const examplePath = path.join(__dirname, "..", "examples", "weekend-trip.json");
    const example = JSON.parse(fs.readFileSync(examplePath, "utf8"));
    const result = settle(example.expenses);

    assert.deepEqual(result.balances, { Ava: 10870, Ben: -4490, Cho: -6380 });
    assert.equal(sum(result.balances), 0);
  });

  it("rejects duplicate participants and bad input", () => {
    assert.throws(
      () => settle([{ payer: "Ava", amount: 10, participants: ["Ben", "Ben"] }]),
      /more than once/,
    );
    assert.throws(() => settle([{ payer: " ", amount: 10, participants: ["Ben"] }]), TypeError);
    assert.throws(() => settle("nope"), TypeError);
  });
});

function sum(balances) {
  return Object.values(balances).reduce((total, cents) => total + cents, 0);
}
