import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import App from '../App';
import NativeWallet from '../specs/NativeWallet';

jest.mock('../specs/NativeWallet', () => ({
  __esModule: true,
  default: {
    getWalletStatus: jest.fn(),
    getPublicAccounts: jest.fn(),
    listOperations: jest.fn(),
    createTestWallet: jest.fn(),
    prepareTestOperation: jest.fn(),
    authorizeOperation: jest.fn(),
    runOperation: jest.fn(),
    getOperation: jest.fn(),
    cancelOperation: jest.fn(),
    exportRedactedEvidence: jest.fn(),
  },
}));

const wallet = NativeWallet as jest.Mocked<typeof NativeWallet>;

beforeEach(() => {
  jest.clearAllMocks();
  wallet.getWalletStatus.mockResolvedValue('absent');
  wallet.getPublicAccounts.mockResolvedValue([]);
  wallet.listOperations.mockResolvedValue([]);
});

test('offers test wallet setup when absent', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.root.findByProps({testID: 'create-wallet'})).toBeTruthy();
  await act(async () => renderer.unmount());
});

test('starts native execution without another user action after authorization', async () => {
  wallet.getWalletStatus.mockResolvedValue('ready');
  wallet.getPublicAccounts.mockResolvedValue([
    {index: 1, address: '0x0000000000000000000000000000000000000001'},
  ]);
  const prepared = {
    id: 'operation-1', revision: 1, status: 'prepared' as const,
    steps: [], nextAction: 'approve' as const,
  };
  const running = {
    ...prepared, revision: 2, status: 'running' as const,
    nextAction: 'wait' as const,
  };
  wallet.prepareTestOperation.mockResolvedValue(prepared);
  wallet.authorizeOperation.mockResolvedValue(running);
  wallet.runOperation.mockResolvedValue(running);
  wallet.getOperation.mockResolvedValue(running);

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await act(async () => {
    await renderer.root.findByProps({testID: 'prepare-operation'}).props.onPress();
  });
  await act(async () => {
    await renderer.root.findByProps({testID: 'authorize-operation'}).props.onPress();
  });
  expect(wallet.authorizeOperation).toHaveBeenCalledWith('operation-1');
  expect(wallet.runOperation).toHaveBeenCalledWith('operation-1');
  expect(renderer.root.findAllByProps({testID: 'sign-step'})).toHaveLength(0);
  await act(async () => renderer.unmount());
});
