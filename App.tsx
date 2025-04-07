import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator.tsx';
import { TaskProvider } from './src/contexts/TaskContext.tsx';
import { COLORS } from './src/constants/theme.ts';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <TaskProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </TaskProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 