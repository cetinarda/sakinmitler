import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';

type Kind = 'archetype' | 'myth' | 'image';
type Filter = 'all' | Kind;

interface Hit {
  id: string;
  kind: Kind;
  name: string;
  emoji: string;
  meta: string;
  preview: string;
  score: number;
}

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: 'all',       label: 'Tümü',     color: Colors.gold },
  { key: 'archetype', label: 'Arketip',  color: Colors.gold },
  { key: 'myth',      label: 'Mit',      color: Colors.purple },
  { key: 'image',     label: 'İmge',     color: Colors.teal },
];

const KIND_COLOR: Record<Kind, string> = {
  archetype: Colors.gold,
  myth: Colors.purpleLight,
  image: Colors.tealLight,
};

const KIND_LABEL: Record<Kind, string> = {
  archetype: 'Arketip',
  myth: 'Mit',
  image: 'İmge',
};

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

function buildIndex(): Hit[] {
  const hits: Hit[] = [];

  for (const a of archetypesData) {
    hits.push({
      id: a.id,
      kind: 'archetype',
      name: a.name,
      emoji: a.emoji,
      meta: `${a.tradition} · ${a.category}`,
      preview: a.essence,
      score: 0,
    });
  }
  for (const m of mythsData) {
    hits.push({
      id: m.id,
      kind: 'myth',
      name: m.name,
      emoji: m.emoji,
      meta: `${m.culture} · ${m.era}`,
      preview: m.summary,
      score: 0,
    });
  }
  for (const i of imagesData) {
    hits.push({
      id: i.id,
      kind: 'image',
      name: i.name,
      emoji: i.emoji,
      meta: `${i.tradition} · ${i.category}`,
      preview: i.essence,
      score: 0,
    });
  }
  return hits;
}

function searchableText(h: Hit): string {
  if (h.kind === 'archetype') {
    const a = archetypesData.find(x => x.id === h.id)!;
    return [
      a.name, a.tradition, a.category, a.essence,
      a.lightAspect, a.shadowAspect, a.dreamMeaning, a.wakingMeaning,
      a.advice, a.affirmation,
      ...(a.keywords || []),
    ].join(' ');
  }
  if (h.kind === 'myth') {
    const m = mythsData.find(x => x.id === h.id)!;
    return [
      m.name, m.culture, m.era, m.category, m.summary,
      m.depthMeaning, m.jungian, m.dreamMeaning, m.wakingMeaning, m.lesson,
    ].join(' ');
  }
  const im = imagesData.find(x => x.id === h.id)!;
  return [
    im.name, im.tradition, im.category, im.essence,
    im.symbolism, im.dreamMeaning, im.wakingMeaning, im.advice,
    ...(im.keywords || []),
  ].join(' ');
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allHits = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const q = normalize(query);
    let pool = filter === 'all' ? allHits : allHits.filter(h => h.kind === filter);

    if (q.length === 0) {
      return [...pool].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    const terms = q.split(/\s+/).filter(Boolean);

    const scored: Hit[] = [];
    for (const h of pool) {
      const nameN = normalize(h.name);
      const fullN = normalize(searchableText(h));
      let score = 0;
      let allFound = true;
      for (const t of terms) {
        if (nameN.startsWith(t)) score += 100;
        else if (nameN.includes(t)) score += 50;
        else if (fullN.includes(t)) score += 10;
        else { allFound = false; break; }
      }
      if (allFound) scored.push({ ...h, score });
    }
    return scored.sort((a, b) => b.score - a.score);
  }, [query, filter, allHits]);

  const renderItem = ({ item }: { item: Hit }) => {
    const color = KIND_COLOR[item.kind];
    const isOpen = expandedId === `${item.kind}:${item.id}`;
    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: color + '40' }]}
        onPress={() => setExpandedId(isOpen ? null : `${item.kind}:${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <View style={styles.cardHeaderText}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardName, { color }]} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.kindPill, { borderColor: color }]}>
                <Text style={[styles.kindPillText, { color }]}>{KIND_LABEL[item.kind]}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta} numberOfLines={1}>{item.meta}</Text>
          </View>
          <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
        </View>
        {!isOpen && (
          <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
        )}
        {isOpen && <DetailBlock kind={item.kind} id={item.id} color={color} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Ara... (ör: gölge, prometheus, ay, yılan)"
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && { borderColor: f.color }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, { color: filter === f.key ? f.color : Colors.textMuted }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.countLine}>
        {results.length} sonuç{filter !== 'all' ? ` · ${FILTERS.find(f => f.key === filter)?.label}` : ''}
      </Text>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
          <Text style={styles.emptySubtext}>Farklı bir kelime dene — ör. "rüya", "anne", "ölüm".</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => `${item.kind}:${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

function DetailBlock({ kind, id, color }: { kind: Kind; id: string; color: string }) {
  if (kind === 'archetype') {
    const a = archetypesData.find(x => x.id === id)!;
    return (
      <ScrollView style={styles.detail} nestedScrollEnabled>
        <Section label="Öz" color={color}>{a.essence}</Section>
        <Section label="Aydınlık Yan" color={color}>{a.lightAspect}</Section>
        <Section label="Gölge Yan" color={color}>{a.shadowAspect}</Section>
        <Section label="🌙 Rüyada" color={Colors.purpleLight} boxed>{a.dreamMeaning}</Section>
        <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} boxed>{a.wakingMeaning}</Section>
        <Section label="Bugünkü Pratik" color={color}>{a.advice}</Section>
        <View style={[styles.affirmBox, { borderColor: color + '40' }]}>
          <Text style={[styles.affirmText, { color }]}>{a.affirmation}</Text>
        </View>
      </ScrollView>
    );
  }
  if (kind === 'myth') {
    const m = mythsData.find(x => x.id === id)!;
    return (
      <ScrollView style={styles.detail} nestedScrollEnabled>
        <Section label="Hikaye" color={color}>{m.summary}</Section>
        <Section label="Derin Anlam" color={color}>{m.depthMeaning}</Section>
        <Section label="Jung'un Okuması" color={color}>{m.jungian}</Section>
        <Section label="🌙 Rüyada" color={Colors.purpleLight} boxed>{m.dreamMeaning}</Section>
        <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} boxed>{m.wakingMeaning}</Section>
        <View style={[styles.affirmBox, { borderColor: color + '40' }]}>
          <Text style={[styles.affirmText, { color }]}>Ders: {m.lesson}</Text>
        </View>
      </ScrollView>
    );
  }
  const im = imagesData.find(x => x.id === id)!;
  return (
    <ScrollView style={styles.detail} nestedScrollEnabled>
      <Section label="Öz" color={color}>{im.essence}</Section>
      <Section label="Sembolizm" color={color}>{im.symbolism}</Section>
      <Section label="🌙 Rüyada" color={Colors.purpleLight} boxed>{im.dreamMeaning}</Section>
      <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} boxed>{im.wakingMeaning}</Section>
      <Section label="Bugünkü Pratik" color={color}>{im.advice}</Section>
    </ScrollView>
  );
}

function Section({ label, color, children, boxed }: { label: string; color: string; children: string; boxed?: boolean }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
      </View>
      <View style={boxed ? [styles.sectionBoxed, { borderColor: color + '30' }] : undefined}>
        <Text style={styles.sectionBody}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: Typography.size.xxxl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: { fontSize: 18, color: Colors.gold, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, color: Colors.textMuted },

  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.xs },
  filterBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary, alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  filterLabel: { fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },

  countLine: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxxl },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardEmoji: { fontSize: 28 },
  cardHeaderText: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    flexShrink: 1,
  },
  kindPill: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  kindPillText: { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', fontWeight: Typography.weight.semibold },
  cardMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 10, color: Colors.textMuted, marginLeft: 4 },
  cardPreview: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.7,
    marginTop: Spacing.sm,
    fontWeight: Typography.weight.light,
  },

  detail: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    maxHeight: 420,
  },
  section: { marginBottom: Spacing.sm },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionDot: { width: 4, height: 4, borderRadius: 2 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.85,
    fontWeight: Typography.weight.light,
  },
  sectionBoxed: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  affirmBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  affirmText: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
    fontWeight: Typography.weight.light,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyText: { fontSize: Typography.size.lg, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  emptySubtext: { fontSize: Typography.size.sm, color: Colors.textMuted, textAlign: 'center' },
});
