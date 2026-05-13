import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TabNavigator } from './src/navigation/TabNavigator';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const setup = () => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    if (root) {
      root.style.height = '100%';
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
    }
  };
  if (document.readyState !== 'loading') setup();
  else document.addEventListener('DOMContentLoaded', setup);
}

const rootStyle: any =
  Platform.OS === 'web' ? { flex: 1, height: '100vh', overflow: 'hidden' } : { flex: 1 };

export default function App() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <TabNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
