"use strict";

const { toCents, splitEvenly } = require("./money");

function personName(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function recordExpense(balances, expense) {
  if (!expense || typeof expense !== "object") {
    throw new TypeError("expense must be an object");
  }

  const payer = personName(expense.payer, "payer");
  const description = expense.description == null ? "" : String(expense.description);
  const label = description || payer;

  if (!Array.isArray(expense.participants) || expense.participants.length === 0) {
    throw new TypeError(`expense "${label}" needs at least one participant`);
  }

  const participants = expense.participants.map((name, index) =>
    personName(name, `participant ${index + 1}`),
  );
  if (new Set(participants).size !== participants.length) {
    throw new Error(`expense "${label}" lists a participant more than once`);
  }

  const totalCents = toCents(expense.amount);
  const shares = splitEvenly(totalCents, participants.length);

  balances.set(payer, (balances.get(payer) || 0) + totalCents);
  participants.forEach((name, index) => {
    balances.set(name, (balances.get(name) || 0) - shares[index]);
  });

  return {
    description,
    payer,
    totalCents,
    shares: participants.map((name, index) => ({ name, cents: shares[index] })),
  };
}

function settle(expenses) {
  if (!Array.isArray(expenses)) {
    throw new TypeError("expenses must be an array");
  }

  const balances = new Map();
  const recorded = expenses.map((expense) => recordExpense(balances, expense));
  const balanceObject = Object.fromEntries(balances);

  return {
    expenses: recorded,
    balances: balanceObject,
    transfers: suggestTransfers(balanceObject),
  };
}

function suggestTransfers(balances) {
  const creditors = [];
  const debtors = [];

  for (const [name, cents] of Object.entries(balances)) {
    if (cents > 0) creditors.push({ name, cents });
    else if (cents < 0) debtors.push({ name, cents: -cents });
  }

  const byAmountThenName = (left, right) =>
    right.cents - left.cents || left.name.localeCompare(right.name);
  creditors.sort(byAmountThenName);
  debtors.sort(byAmountThenName);

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const amount = Math.min(debtors[debtorIndex].cents, creditors[creditorIndex].cents);
    if (amount > 0) {
      transfers.push({
        from: debtors[debtorIndex].name,
        to: creditors[creditorIndex].name,
        cents: amount,
      });
    }
    debtors[debtorIndex].cents -= amount;
    creditors[creditorIndex].cents -= amount;
    if (debtors[debtorIndex].cents === 0) debtorIndex += 1;
    if (creditors[creditorIndex].cents === 0) creditorIndex += 1;
  }

  return transfers;
}

module.exports = { settle, suggestTransfers };
