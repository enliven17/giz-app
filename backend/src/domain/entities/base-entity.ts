import { randomBytes } from "node:crypto";

export type EntityIdentity = {
  id: string;
  createdAt: Date;
};

function uuidv7(): string {
  const bytes = randomBytes(16);
  const ms = BigInt(Date.now());
  bytes[0] = Number((ms >> 40n) & 0xffn);
  bytes[1] = Number((ms >> 32n) & 0xffn);
  bytes[2] = Number((ms >> 24n) & 0xffn);
  bytes[3] = Number((ms >> 16n) & 0xffn);
  bytes[4] = Number((ms >> 8n) & 0xffn);
  bytes[5] = Number(ms & 0xffn);
  const timeHi = bytes[6];
  const clock = bytes[8];
  if (timeHi === undefined || clock === undefined) {
    throw new Error("uuid bytes missing");
  }
  bytes[6] = (timeHi & 0x0f) | 0x70;
  bytes[8] = (clock & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;

  constructor(identity: EntityIdentity) {
    this.id = identity.id;
    this.createdAt = identity.createdAt;
  }

  static create<T extends BaseEntity, P extends object>(
    this: new (identity: EntityIdentity) => T,
    props: P,
  ): T {
    return Object.assign(new this({ id: uuidv7(), createdAt: new Date() }), props);
  }
}
