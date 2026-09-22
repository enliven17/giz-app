import { render } from "@testing-library/react-native";
import { AppRoot } from "@/application/AppRoot";
import type { AccessService } from "@/services/access";
export function renderApp(accessService?: AccessService) {
  return render(<AppRoot accessService={accessService} />);
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
