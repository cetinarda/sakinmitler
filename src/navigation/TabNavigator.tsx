import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

type Tab = 'home' | 'explore' | 'archive' | 'profile';

const TABS: { key: Tab; label: string; emoji: string; activeColor: string }[] = [
  { key: 'home',    label: 'Bugün',  emoji: '☥',  activeColor: Colors.gold },
  { key: 'explore', label: 'Mitler', emoji: '✦',  activeColor: Colors.gold },
  { key: 'archive', label: 'Arşiv',  emoji: '📜', activeColor: Colors.purple },
  { key: 'profile', label: 'Profil', emoji: '🧭', activeColor: Colors.teal },
];

export function TabNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const insets = useSafeAreaInsets();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'explore':
        return <ExploreScreen />;
      case 'archive':
        return <ArchiveScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{renderScreen()}</View>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4 }]}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIndicator, isActive && { backgroundColor: tab.activeColor }]} />
              <Text style={[styles.tabEmoji, !isActive && styles.tabEmojiInactive]}>
                {tab.emoji}
              </Text>
              <Text style={[
                styles.tabLabel,
                { color: isActive ? tab.activeColor : Colors.textMuted }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    flexShrink: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: -Spacing.sm - 1,
    width: 24,
    height: 2,
    borderRadius: BorderRadius.round,
    backgroundColor: 'transparent',
  },
  tabEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabEmojiInactive: {
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: Typography.size.xs,
    letterSpacing: 0.3,
    fontWeight: Typography.weight.medium,
  },
});
