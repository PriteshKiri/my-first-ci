"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, it } = require("node:test");

const cli = path.join(__dirname, "..", "src", "cli.js");
const example = path.join(__dirname, "..", "examples", "weekend-trip.json");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

describe("cli", () => {
  it("prints balances and the payments that settle the trip", () => {
    const result = run([example]);
    assert.equal(result.status, 0);
    assert.equal(
      result.stdout,
      [
        "Total spent $371.40",
        "",
        "Balances",
        "  Ava is owed $108.70",
        "  Ben owes $44.90",
        "  Cho owes $63.80",
        "",
        "Transfers",
        "  Cho pays Ava $63.80",
        "  Ben pays Ava $44.90",
        "",
      ].join("\n"),
    );
  });

  it("explains how to run the command", () => {
    const result = run([]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage: node src\/cli\.js/);
  });

  it("fails when the file is not an expense list", () => {
    const result = run([path.join(__dirname, "money.test.js")]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /expenses array|JSON/);
  });
});
