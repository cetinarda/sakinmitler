import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HelpButton } from '../components/HelpButton';
import { MitlerLibraryScreen } from './MitlerLibraryScreen';
import { MitlerFinderScreen } from './MitlerFinderScreen';
import { WeeklyScreen } from './WeeklyScreen';
import { useMitlerStore } from '../store/useStore';

type Panel = 'library' | 'finder' | 'weekly';

const PANELS = [
  { key: 'library' as Panel, title: 'Mitler', symbol: '⊕', color: Colors.tealLight,    helpKey: 'arketip' },
  { key: 'finder'  as Panel, title: 'Bul',    symbol: '✦', color: Colors.gold,         helpKey: 'bul' },
  { key: 'weekly'  as Panel, title: 'Hafta',  symbol: '◈', color: Colors.sakinLavender, helpKey: 'hafta' },
];

export function MitlerHubScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useMitlerStore();
  const [panel, setPanel] = useState<Panel>('library');

  const active = PANELS.find(p => p.key === panel)!;
  const noClose = () => {};

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.headerBar}>
        <Text style={styles.eyebrow}>SAKİN · MİTLER</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{active.title}</Text>
          <HelpButton termKey={active.helpKey} />
        </View>
      </View>

      <View style={styles.chipWrap}>
        {PANELS.map(p => {
          const isActive = p.key === panel;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.chip,
                isActive && { borderColor: p.color, backgroundColor: p.color + '18' },
              ]}
              onPress={() => setPanel(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipSymbol, { color: isActive ? p.color : Colors.textMuted }]}>
                {p.symbol}
              </Text>
              <Text style={[
                styles.chipLabel,
                { color: isActive ? p.color : Colors.textMuted },
                isActive && { fontWeight: Typography.weight.semibold },
              ]}>
                {p.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {panel === 'library' && <MitlerLibraryScreen onClose={noClose} embedded />}
        {panel === 'finder'  && <MitlerFinderScreen  onClose={noClose} embedded prefillBirthDate={profile?.birthDate} />}
        {panel === 'weekly'  && <WeeklyScreen        onClose={noClose} embedded />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  headerBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  eyebrow: {
    fontSize: 9,
    color: Colors.sakinLavender,
    letterSpacing: 3,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 3,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.light,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },

  chipWrap: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
  },
  chipSymbol: { fontSize: 12 },
  chipLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
  },

  divider: { height: 1, backgroundColor: Colors.divider, opacity: 0.4 },
  body: { flex: 1 },
});
