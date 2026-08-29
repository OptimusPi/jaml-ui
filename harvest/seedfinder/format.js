// Compact display like the old curator: 15.63B / 5.42M / 42.91k
export function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(2).replace(/\.00$/, "") + "k";
  return Math.floor(n).toLocaleString();
}
