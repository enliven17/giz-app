export function formatMon(wei: string): string {
  if (!/^(?:0|[1-9][0-9]{0,77})$/.test(wei)) throw new Error("Invalid balance");
  const padded = wei.padStart(19, "0");
  const whole = padded.slice(0, -18);
  const fraction = padded.slice(-18).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
