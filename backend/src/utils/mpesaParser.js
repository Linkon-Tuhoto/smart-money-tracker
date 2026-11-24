
const AMOUNT_PATTERN =
  /(?:Ksh|KES|Kenya Shillings?)\s*([\d,]+(?:\.\d{1,2})?)/i;

const CODE_PATTERN = /\b([A-Z0-9]{8,12})\s+Confirmed\b/i;

export function parseMpesaMessage(message) {
  if (typeof message !== "string" || !message.trim()) {
    return { error: "Please provide an M-Pesa message." };
  }

  if (message.length > 5000) {
    return { error: "The message is too long." };
  }

  const normalized = message.trim();
  const amountMatch = normalized.match(AMOUNT_PATTERN);
  const codeMatch = normalized.match(CODE_PATTERN);

  if (!amountMatch || !codeMatch) {
    return {
      error:
        "We could not recognize this message format. You can enter the transaction manually.",
    };
  }

  const amount = Number(amountMatch[1].replaceAll(",", ""));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "The message contains an invalid amount." };
  }

  const amountMinor = Math.round(amount * 100);

  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return { error: "The transaction amount is invalid." };
  }

  // Detect common incoming and outgoing transaction wording.
  const receivedPattern = /\b(received|you have received)\b/i;

  const outgoingPattern =
    /\b(sent to|paid to|bought|pay bill|buy goods|fuliza)\b/i;

  let type;

  if (receivedPattern.test(normalized)) {
    type = "income";
  } else if (outgoingPattern.test(normalized)) {
    type = "expense";
  } else {
    return {
      error:
        "We could not determine whether this was money received or spent. Please enter it manually.",
    };
  }

  // Recognize dates such as 28/10/2026 at 1:35 PM.
  const dateMatch = normalized.match(
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!dateMatch) {
    return {
      error:
        "We found the amount and code, but could not recognize the transaction date. Please enter it manually.",
    };
  }

  const [
    ,
    dayText,
    monthText,
    yearText,
    hourText,
    minuteText,
    meridiemText,
  ] = dateMatch;

  const day = Number(dayText);
  const month = Number(monthText);
  const rawYear = Number(yearText);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  const originalHour = Number(hourText);
  const minute = Number(minuteText);
  const meridiem = meridiemText?.toUpperCase();

  let hour = originalHour;

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const validTime =
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    (!meridiem || (originalHour >= 1 && originalHour <= 12));

  const check = new Date(Date.UTC(year, month - 1, day));

  const validDate =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day;

  if (!validDate || !validTime) {
    return {
      error: "The message contains an invalid transaction date or time.",
    };
  }

  // Convert East Africa Time (UTC+3) to UTC.
  const transactionDate = new Date(
    Date.UTC(year, month - 1, day, hour - 3, minute)
  ).toISOString();

  return {
    value: {
      amountMinor,
      type,
      category: "Uncategorized",
      description: "Imported M-Pesa transaction",
      transactionDate,
      source: "mpesa",
      paymentMethod: "mpesa",
      currency: "KES",
      transactionCode: codeMatch[1].toUpperCase(),
      originalMessage: normalized,
    },
  };
}
