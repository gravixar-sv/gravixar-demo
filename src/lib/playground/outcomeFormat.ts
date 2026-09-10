// Number formatting for the outcome tiles, and for the workspace tiles
// that quote the same figures. Every scene does its arithmetic on
// numbers and formats here, at the edge: nothing takes a formatted
// value like "£412k" apart to add to it.
//
// Deliberately locale-free. These strings are rendered on the server
// and again on the client, so anything that reads the runtime's locale
// would risk a hydration mismatch.

/** 1285 -> "1,285". Same grouping CountUp animates with. */
export function formatCount(n: number): string {
  return group(n);
}

/** Compact money for the big tiles: 412000 -> "£412k", 20100 -> "£20.1k". */
export function formatMoney(symbol: string, amount: number): string {
  if (Math.abs(amount) < 1000) return `${symbol}${group(amount)}`;
  // One decimal, dropped when the figure lands on a whole thousand.
  const k = (Math.round(amount / 100) / 10).toFixed(1).replace(/\.0$/, "");
  return `${symbol}${k}k`;
}

/** Exact money for a line item: 84200 -> "$84,200". */
export function formatAmount(symbol: string, amount: number): string {
  return `${symbol}${group(amount)}`;
}

function group(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  return (
    sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}
