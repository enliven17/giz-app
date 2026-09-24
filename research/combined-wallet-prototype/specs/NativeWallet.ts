import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export type WalletStatus = 'absent' | 'ready' | 'recovery_required';
export type OperationStatus =
  | 'prepared' | 'running' | 'waiting' | 'needs_unlock'
  | 'needs_review' | 'completed' | 'cancelled' | 'failed';
export type StepStatus =
  | 'planned' | 'signed' | 'submitted' | 'confirmed'
  | 'finalized' | 'unknown' | 'failed';
export type PublicAccount = {index: number; address: string};
export type StepView = {
  id: string;
  accountIndex: number;
  status: StepStatus;
  txHash: string | null;
  errorCode: string | null;
};
export type OperationView = {
  id: string;
  revision: number;
  status: OperationStatus;
  steps: StepView[];
  nextAction: 'approve' | 'unlock' | 'wait' | 'review' | 'none';
};

export interface Spec extends TurboModule {
  getWalletStatus(): Promise<WalletStatus>;
  createTestWallet(): Promise<PublicAccount[]>;
  openRecoveryScreen(): Promise<void>;
  getPublicAccounts(): Promise<PublicAccount[]>;
  prepareTestOperation(): Promise<OperationView>;
  authorizeOperation(operationId: string): Promise<OperationView>;
  runOperation(operationId: string): Promise<OperationView>;
  getOperation(operationId: string): Promise<OperationView>;
  listOperations(): Promise<OperationView[]>;
  cancelOperation(operationId: string): Promise<OperationView>;
  exportRedactedEvidence(operationId: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeWallet');
