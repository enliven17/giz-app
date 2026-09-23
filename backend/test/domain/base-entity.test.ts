import assert from "node:assert/strict";
import { test } from "node:test";
import { BaseEntity } from "../../src/domain/entities/base-entity.ts";

class ProbeEntity extends BaseEntity {
  declare label: string;
}

test("create assigns an id and createdAt", () => {
  const probe = ProbeEntity.create({ label: "alpha" });
  assert.equal(probe.label, "alpha");
  assert.match(
    probe.id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.ok(probe.createdAt instanceof Date);
});
