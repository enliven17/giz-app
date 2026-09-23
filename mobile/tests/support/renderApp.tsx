import type { TransactionService } from "@/services/transactions";
import type { EarlyAccessService } from "@/services/earlyAccess";
import type { InvestmentService } from "@/services/investments";
import { render } from "@testing-library/react-native";
import { AppRoot } from "@/application/AppRoot";
import type { AccessService } from "@/services/access";
export function renderApp(
  accessService?: AccessService,
  investmentService?: InvestmentService,
  earlyAccessService?: EarlyAccessService,
  transactionService?: TransactionService,
) {
  return render(
    <AppRoot
      transactionService={transactionService}
      accessService={accessService}
      investmentService={investmentService}
      earlyAccessService={earlyAccessService}
    />,
  );
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
