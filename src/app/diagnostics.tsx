import { Redirect } from 'expo-router';

import { featureFlags } from '@/config/featureFlags';
import { DiagnosticsScreen } from '@/screens/diagnostics/DiagnosticsScreen';

export default function DiagnosticsRoute() {
  return featureFlags.diagnostics ? <DiagnosticsScreen /> : <Redirect href="/" />;
}
