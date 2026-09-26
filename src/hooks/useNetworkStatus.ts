import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

function selectState(state: NetInfoState): NetworkStatus {
  return { isConnected: state.isConnected, isInternetReachable: state.isInternetReachable };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
  });
  useEffect(() => NetInfo.addEventListener((state) => setStatus(selectState(state))), []);
  return status;
}
