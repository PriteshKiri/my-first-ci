#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { formatCents } = require("./money");
const { settle } = require("./ledger");

function readExpenses(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!data || !Array.isArray(data.expenses)) {
    throw new Error("input must be an object with an expenses array");
  }
  return data.expenses;
}

function render(result) {
  const totalCents = result.expenses.reduce((sum, expense) => sum + expense.totalCents, 0);
  const count = result.expenses.length;
  const expenseLabel = count === 1 ? "expense" : "expenses";
  const lines = [`${count} ${expenseLabel}, total spent ${formatCents(totalCents)}`, "", "Balances"];
  const names = Object.keys(result.balances).sort();

  if (names.length === 0) {
    lines.push("  No expenses.");
  } else {
    for (const name of names) {
      const cents = result.balances[name];
      const status = cents > 0 ? "is owed" : cents < 0 ? "owes" : "is settled";
      lines.push(`  ${name} ${status} ${formatCents(Math.abs(cents))}`);
    }
  }

  lines.push("", "Transfers");
  if (result.transfers.length === 0) {
    lines.push("  Everyone is settled.");
  } else {
    for (const transfer of result.transfers) {
      lines.push(`  ${transfer.from} pays ${transfer.to} ${formatCents(transfer.cents)}`);
    }
  }

  return lines.join("\n");
}

function main(argv) {
  const filePath = argv[2];
  if (!filePath) {
    console.error("Usage: node src/cli.js <expenses.json>");
    return 1;
  }

  try {
    console.log(render(settle(readExpenses(filePath))));
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { readExpenses, render, main };
