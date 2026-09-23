import { createMeraProbeService } from "@/services/meraProbe";
import { probeBoundaries, testProbeWallet } from "../support/probe";
import { deferred } from "../support/renderApp";

test("create/recover/sign uses fresh ceremonies, pins metadata and stores no secrets", async () => {
  const deps = probeBoundaries();
  const service = createMeraProbeService(deps);
  expect((await service.run("create")).wallet).toEqual(testProbeWallet);
  expect((await service.run("recover")).recovered).toBe(true);
  expect((await service.run("sign")).proof?.verified).toBe(true);
  expect(deps.ceremonies.create).toHaveBeenCalledTimes(1);
  expect(deps.ceremonies.get).toHaveBeenNthCalledWith(1, testProbeWallet.credentialId);
  expect(deps.ceremonies.get).toHaveBeenCalledTimes(2);
  expect(deps.storage.write).toHaveBeenLastCalledWith(testProbeWallet);
  await expect(service.run("create")).rejects.toThrow("Forget");
});

test("unavailable/missing records do not call native APIs; discovery never creates", async () => {
  const deps = probeBoundaries();
  await expect(
    createMeraProbeService({ ...deps, availability: () => "Not configured" }).run("create"),
  ).rejects.toThrow("Not configured");
  const service = createMeraProbeService(deps);
  await expect(service.run("sign")).rejects.toThrow("first");
  expect(deps.ceremonies.create).not.toHaveBeenCalled();
  await service.run("open");
  expect(deps.ceremonies.get).toHaveBeenCalledWith(undefined);
  expect(deps.ceremonies.create).not.toHaveBeenCalled();
});

test("abandoned native prompts stay serialized and late PRF output is cleared", async () => {
  const deps = probeBoundaries();
  const pending = deferred<{ credentialId: string; prfOutput: Uint8Array }>();
  deps.ceremonies.create.mockReturnValueOnce(pending.promise);
  const service = createMeraProbeService(deps);
  const first = service.run("create");
  const rejected = expect(first).rejects.toThrow("abandoned");
  await Promise.resolve();
  service.abandon();
  await expect(service.run("create")).rejects.toThrow("progress");
  await expect(service.forget()).rejects.toThrow("Wait");
  const bytes = new Uint8Array(32).fill(7);
  pending.resolve({ credentialId: testProbeWallet.credentialId, prfOutput: bytes });
  await rejected;
  expect(bytes.every((byte) => byte === 0)).toBe(true);
  expect(deps.storage.write).not.toHaveBeenCalled();
  await expect(service.run("open")).resolves.toHaveProperty("wallet", testProbeWallet);
});

test("storage failure permits recovery via existing passkey without repeating create", async () => {
  const deps = probeBoundaries();
  deps.storage.write.mockRejectedValueOnce(new Error("storage unavailable"));
  const service = createMeraProbeService(deps);
  await expect(service.run("create")).rejects.toThrow("storage unavailable");
  expect(deps.buffers[0]?.every((byte) => byte === 0)).toBe(true);
  await service.run("open");
  expect(deps.ceremonies.create).toHaveBeenCalledTimes(1);
  await service.forget();
  expect(await service.read()).toBeNull();
});

test("wrong address or credential never overwrites the known record or returns a proof", async () => {
  const deps = probeBoundaries(testProbeWallet);
  const bytes = new Uint8Array(32).fill(7);
  deps.ceremonies.get.mockResolvedValueOnce({
    credentialId: testProbeWallet.credentialId,
    prfOutput: bytes,
  });
  const service = createMeraProbeService(deps);
  await expect(service.run("sign")).rejects.toThrow("does not match");
  expect(deps.storage.write).not.toHaveBeenCalled();
  expect(bytes.every((byte) => byte === 0)).toBe(true);
});

test("background and foreground wait failure dispose returned secrets", async () => {
  const deps = probeBoundaries();
  let active = true;
  const bytes = new Uint8Array(32).fill(7);
  deps.ceremonies.create.mockImplementationOnce(async () => {
    active = false;
    return { credentialId: testProbeWallet.credentialId, prfOutput: bytes };
  });
  const service = createMeraProbeService({ ...deps, isActive: () => active });
  await expect(service.run("create")).rejects.toThrow("abandoned");
  expect(bytes.every((byte) => byte === 0)).toBe(true);
  expect(deps.storage.write).not.toHaveBeenCalled();
});
