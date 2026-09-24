import {
  parseNativeStatus,
  transferProposal,
} from "@/development/native-transfers/useNativeTransferController";
const recipient = "0x" + "1".repeat(40);
test.each(["-1", "01", "1e-3", "0", "0.100000000000000001", "0.0000000000000000001", "NaN"])(
  "rejects ambiguous or excessive MON amount %s",
  (amount) => {
    expect(() => transferProposal("0", recipient, amount)).toThrow();
  },
);
test("retains one-wei precision without floating point and bounds accounts", () => {
  expect(
    JSON.parse(transferProposal("15", recipient, "0.000000000000000001")).transfers[0].valueWei,
  ).toBe("1");
  expect(() => transferProposal("16", recipient, "0.1")).toThrow();
  expect(() => transferProposal("0", "bad", "0.1")).toThrow();
});
test.each(["{}", '[{"status":"confirmed","transactionHash":"0x123"}]', "null"])(
  "rejects malformed public status %s",
  (input) => {
    expect(() => parseNativeStatus(input)).toThrow();
  },
);

test.each(["0", "17", "01", "-1", "1.5", ""])("rejects invalid batch count %s", (count) => {
  expect(() => transferProposal("0", recipient, "0.001", count)).toThrow();
});
test("bounds aggregate value independently of per-transfer value", () => {
  expect(() => transferProposal("0", recipient, "0.1", "11")).toThrow();
  expect(JSON.parse(transferProposal("0", recipient, "0.1", "10")).transfers).toHaveLength(10);
});
