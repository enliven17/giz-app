import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import NativeWallet, {
  type OperationView,
  type PublicAccount,
  type WalletStatus,
} from './specs/NativeWallet';

export default function App() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [accounts, setAccounts] = useState<PublicAccount[]>([]);
  const [operation, setOperation] = useState<OperationView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const status = await NativeWallet.getWalletStatus();
    setWalletStatus(status);
    if (status === 'ready') {
      const [publicAccounts, operations] = await Promise.all([
        NativeWallet.getPublicAccounts(),
        NativeWallet.listOperations(),
      ]);
      setAccounts(publicAccounts);
      setOperation(operations[0] ?? null);
    } else {
      setAccounts([]);
      setOperation(null);
    }
  }, []);

  useEffect(() => {
    load().catch(e => setError(String(e)));
  }, [load]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        load().catch(e => setError(String(e)));
      }
    });
    return () => subscription.remove();
  }, [load]);

  useEffect(() => {
    if (!operation || !['running', 'waiting', 'needs_review'].includes(operation.status)) {
      return;
    }
    const timer = setInterval(() => {
      NativeWallet.getOperation(operation.id)
        .then(setOperation)
        .catch(e => setError(String(e)));
    }, 1000);
    return () => clearInterval(timer);
  }, [operation?.id, operation?.status]);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  function createWallet() {
    return perform(async () => {
      const created = await NativeWallet.createTestWallet();
      setAccounts(created);
      setWalletStatus('ready');
    });
  }

  function openRecovery() {
    return perform(async () => {
      await NativeWallet.openRecoveryScreen();
    });
  }

  function prepareOperation() {
    return perform(async () => {
      setOperation(await NativeWallet.prepareTestOperation());
    });
  }

  function authorizeAndRun() {
    if (!operation) {
      return Promise.resolve();
    }
    return perform(async () => {
      const approved = await NativeWallet.authorizeOperation(operation.id);
      setOperation(approved);
      if (approved.status === 'running' || approved.status === 'waiting') {
        setOperation(await NativeWallet.runOperation(operation.id));
      }
    });
  }

  const confirmed = operation?.steps.filter(step =>
    step.status === 'confirmed' || step.status === 'finalized',
  ).length ?? 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ANDROID DEVICE PROTOTYPE</Text>
        <Text style={styles.title}>One unlock. Twelve signatures.</Text>
        <Text style={styles.subtitle}>
          Test keys and local-chain transfers only. The native wallet controls
          confirmation, passkey authorization, signing and encrypted recovery.
        </Text>

        {walletStatus === null && <ActivityIndicator />}
        {walletStatus === 'absent' && (
          <>
            <ActionButton
              testID="create-wallet"
              label="Create test wallet and passkey"
              disabled={busy}
              onPress={createWallet}
            />
            <ActionButton
              testID="restore-wallet"
              label="Restore encrypted backup"
              disabled={busy}
              onPress={openRecovery}
            />
          </>
        )}
        {walletStatus === 'recovery_required' && (
          <>
            <Text style={styles.warning}>This wallet needs its encrypted backup.</Text>
            <ActionButton
              testID="restore-wallet"
              label="Restore encrypted backup"
              disabled={busy}
              onPress={openRecovery}
            />
          </>
        )}
        {walletStatus === 'ready' && (
          <>
            <Text style={styles.section}>Six derived accounts</Text>
            {accounts.map(account => (
              <Text key={account.index} style={styles.account}>
                {account.index} · {account.address}
              </Text>
            ))}
            {(!operation || ['completed', 'cancelled', 'failed'].includes(operation.status)) && (
              <ActionButton
                testID="backup-wallet"
                label="Back up wallet"
                disabled={busy}
                onPress={openRecovery}
              />
            )}
            {(!operation || ['completed', 'cancelled', 'failed'].includes(operation.status)) && (
              <ActionButton
                testID="prepare-operation"
                label={operation ? 'Prepare another 12-transfer test' : 'Prepare 12-transfer test'}
                disabled={busy}
                onPress={prepareOperation}
              />
            )}
          </>
        )}

        {operation && (
          <View style={styles.panel}>
            <Text style={styles.section}>Operation</Text>
            <Text style={styles.status}>{operation.status.replace('_', ' ')}</Text>
            <Text style={styles.detail}>
              {confirmed} / {operation.steps.length} transactions confirmed
            </Text>
            {(operation.nextAction === 'approve' || operation.nextAction === 'unlock') && (
              <ActionButton
                testID="authorize-operation"
                label={operation.nextAction === 'approve' ? 'Confirm intent' : 'Unlock to continue'}
                disabled={busy}
                onPress={authorizeAndRun}
              />
            )}
            {operation.steps.map(step => (
              <Text key={step.id} style={styles.step}>
                {step.id} · account {step.accountIndex} · {step.status}
              </Text>
            ))}
          </View>
        )}

        {busy && <ActivityIndicator style={styles.spinner} />}
        {error && <Text style={styles.warning}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

function ActionButton({
  testID, label, disabled, onPress,
}: {
  testID: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#f7f8fb'},
  content: {padding: 24, paddingTop: 36, paddingBottom: 48},
  eyebrow: {fontSize: 12, fontWeight: '700', color: '#52647b', letterSpacing: 1.2},
  title: {fontSize: 30, fontWeight: '800', color: '#102033', marginTop: 10},
  subtitle: {fontSize: 15, lineHeight: 22, color: '#42546a', marginTop: 10, marginBottom: 20},
  section: {fontSize: 18, fontWeight: '700', color: '#102033', marginBottom: 12},
  account: {fontSize: 12, color: '#33465b', marginBottom: 8},
  panel: {marginTop: 24, padding: 18, backgroundColor: '#ffffff', borderRadius: 16},
  status: {fontSize: 20, fontWeight: '700', color: '#1460a6'},
  detail: {fontSize: 14, color: '#42546a', marginTop: 4, marginBottom: 14},
  step: {fontSize: 12, color: '#42546a', marginBottom: 6},
  button: {backgroundColor: '#175d9c', padding: 15, borderRadius: 12, marginTop: 18},
  buttonDisabled: {opacity: 0.5},
  buttonText: {fontWeight: '700', color: '#ffffff', textAlign: 'center'},
  warning: {color: '#a33824', marginTop: 16},
  spinner: {marginTop: 18},
});
