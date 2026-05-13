import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';
import { MitlerDetailScreen, MitlerEntry, Kind } from './MitlerDetailScreen';

interface Props {
  onClose: () => void;
  embedded?: boolean;
}

type Filter = 'all' | Kind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Tümü' },
  { key: 'archetype', label: 'Arketip' },
  { key: 'myth',      label: 'Mit' },
  { key: 'image',     label: 'İmge' },
];

const TOTAL =
  archetypesData.length + mythsData.length + imagesData.length;

function archetypeEntry(a: typeof archetypesData[0]): MitlerEntry {
  return {
    kind: 'archetype',
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    tagline: (a.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `${a.tradition} · ${a.category}`,
    searchBlob: [
      a.name, a.tradition, a.category, a.essence,
      ...(a.keywords || []),
    ].join(' '),
    data: a,
  };
}
function mythEntry(m: typeof mythsData[0]): MitlerEntry {
  return {
    kind: 'myth',
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    tagline: `${m.culture} · ${m.category}`,
    detailMeta: `${m.culture} · ${m.era}`,
    searchBlob: [m.name, m.culture, m.era, m.category, m.summary].join(' '),
    data: m,
  };
}
function imageEntry(i: typeof imagesData[0]): MitlerEntry {
  return {
    kind: 'image',
    id: i.id,
    name: i.name,
    emoji: i.emoji,
    tagline: (i.keywords || []).slice(0, 2).join(' · '),
    detailMeta: `${i.tradition} · ${i.category}`,
    searchBlob: [i.name, i.tradition, i.category, i.essence, ...(i.keywords || [])].join(' '),
    data: i,
  };
}

function buildEntries(): MitlerEntry[] {
  return [
    ...archetypesData.map(archetypeEntry),
    ...mythsData.map(mythEntry),
    ...imagesData.map(imageEntry),
  ];
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function MitlerLibraryScreen({ onClose, embedded }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<MitlerEntry | null>(null);

  const all = useMemo(() => buildEntries(), []);

  const filtered = useMemo(() => {
    const pool = filter === 'all' ? all : all.filter(e => e.kind === filter);
    const q = normalize(query);
    if (!q) {
      return [...pool].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }
    const terms = q.split(/\s+/).filter(Boolean);
    return pool
      .filter(e => {
        const blob = normalize(e.searchBlob);
        return terms.every(t => blob.includes(t));
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [filter, query, all]);

  const groups = useMemo(() => {
    const map = new Map<string, MitlerEntry[]>();
    for (const e of filtered) {
      const letter = e.name[0].toLocaleUpperCase('tr');
      const list = map.get(letter) || [];
      list.push(e);
      map.set(letter, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (selected) {
    return <MitlerDetailScreen entry={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <View style={styles.root}>
      {!embedded && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.familyTag}>SAKİN · MİTLER</Text>
        </View>
      )}

      <View style={[styles.header, embedded && styles.headerCompact]}>
        <Text style={styles.subtitle}>
          Jung'dan kadim mitlere · {TOTAL} rehber
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>✦</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="İsim, sembol veya tema ile ara..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={12}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, active && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, { color: active ? Colors.tealLight : Colors.textMuted }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 && (
          <Text style={styles.empty}>Arama sonucu yok.</Text>
        )}
        {groups.map(([letter, items]) => (
          <View key={letter} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={styles.groupDot} />
              <Text style={styles.groupLetter}>{letter}</Text>
              <View style={styles.groupLine} />
            </View>
            {items.map(entry => (
              <EntryRow
                key={`${entry.kind}:${entry.id}`}
                entry={entry}
                onPress={() => setSelected(entry)}
              />
            ))}
          </View>
        ))}
        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

function EntryRow({ entry, onPress }: { entry: MitlerEntry; onPress: () => void }) {
  const accent =
    entry.kind === 'archetype' ? Colors.gold :
    entry.kind === 'myth'      ? Colors.purpleLight :
                                 Colors.tealLight;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowImgWrap, { borderColor: accent + '40' }]}>
        <Text style={styles.rowEmoji}>{entry.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{entry.name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {entry.kind === 'archetype' ? 'Arketip' : entry.kind === 'myth' ? 'Mit' : 'İmge'}
          {entry.tagline ? ` · ${entry.tagline}` : ''}
        </Text>
      </View>
      <Text style={styles.rowArrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  back: {
    fontSize: Typography.size.sm,
    color: Colors.tealLight,
    letterSpacing: 0.5,
  },
  familyTag: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerCompact: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
    color: Colors.gold,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + '15',
  },
  filterLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: Typography.weight.medium,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  empty: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
  group: { marginBottom: Spacing.lg },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  groupDot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tealLight,
  },
  groupLetter: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.tealLight,
    letterSpacing: 2,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowImgWrap: {
    width: 44, height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  rowEmoji: { fontSize: 22 },
  rowName: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  rowMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowArrow: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
