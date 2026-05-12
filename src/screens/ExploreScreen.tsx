import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';
import { BulScreen } from './BulScreen';
import { SearchScreen } from './SearchScreen';

type SubTab = 'liste' | 'bul' | 'ara';
type Kind = 'archetype' | 'myth' | 'image';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'liste', label: 'Liste' },
  { key: 'bul',   label: 'Bul' },
  { key: 'ara',   label: 'Ara' },
];

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<SubTab>('bul');
  const [detail, setDetail] = useState<{ kind: Kind; id: string } | null>(null);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>SAKİN · MİTLER</Text>
        <Text style={styles.headerTitle}>
          {tab === 'liste' ? 'Liste' : tab === 'bul' ? 'Bul' : 'Ara'}
        </Text>
      </View>

      <View style={styles.subTabsRow}>
        {SUB_TABS.map(t => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.subTab,
                active && { borderColor: Colors.gold, backgroundColor: Colors.goldGlow },
              ]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.subTabLabel, { color: active ? Colors.gold : Colors.textMuted }]}>
                {t.key === 'bul' ? '✦ ' : ''}{t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {tab === 'liste' && <ListeView onShowDetail={(k, id) => setDetail({ kind: k, id })} />}
        {tab === 'bul' && (
          <BulScreen onShowDetail={(k, id) => setDetail({ kind: k, id })} />
        )}
        {tab === 'ara' && <SearchScreen />}
      </View>

      <Modal
        visible={detail !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetail(null)}
      >
        {detail && <DetailModal kind={detail.kind} id={detail.id} onClose={() => setDetail(null)} />}
      </Modal>
    </View>
  );
}

// ─── Liste sub-tab: filterable browse list ─────────────────────────────────────
function ListeView({ onShowDetail }: { onShowDetail: (kind: Kind, id: string) => void }) {
  const [filter, setFilter] = useState<'all' | Kind>('all');

  const items = useMemo(() => {
    const arch = archetypesData.map(a => ({
      kind: 'archetype' as Kind,
      id: a.id, name: a.name, emoji: a.emoji,
      meta: `${a.tradition} · ${a.category}`,
      preview: a.essence,
    }));
    const myth = mythsData.map(m => ({
      kind: 'myth' as Kind,
      id: m.id, name: m.name, emoji: m.emoji,
      meta: `${m.culture} · ${m.era}`,
      preview: m.summary,
    }));
    const img = imagesData.map(i => ({
      kind: 'image' as Kind,
      id: i.id, name: i.name, emoji: i.emoji,
      meta: `${i.tradition} · ${i.category}`,
      preview: i.essence,
    }));
    const all = [...arch, ...myth, ...img];
    const filtered = filter === 'all' ? all : all.filter(x => x.kind === filter);
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [filter]);

  const FILTERS: { key: 'all' | Kind; label: string; color: string }[] = [
    { key: 'all',       label: 'Tümü',     color: Colors.gold },
    { key: 'archetype', label: 'Arketip',  color: Colors.gold },
    { key: 'myth',      label: 'Mit',      color: Colors.purple },
    { key: 'image',     label: 'İmge',     color: Colors.teal },
  ];

  return (
    <View style={{ flex: 1 }}>
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
      <Text style={styles.countLine}>{items.length} kayıt</Text>
      <FlatList
        data={items}
        keyExtractor={item => `${item.kind}:${item.id}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color =
            item.kind === 'archetype' ? Colors.gold :
            item.kind === 'myth'      ? Colors.purpleLight :
                                        Colors.tealLight;
          const kindLabel =
            item.kind === 'archetype' ? 'Arketip' :
            item.kind === 'myth'      ? 'Mit' : 'İmge';
          return (
            <TouchableOpacity
              style={[styles.itemCard, { borderColor: color + '40' }]}
              onPress={() => onShowDetail(item.kind, item.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.itemName, { color }]} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.kindPill, { borderColor: color }]}>
                    <Text style={[styles.kindPillText, { color }]}>{kindLabel}</Text>
                  </View>
                </View>
                <Text style={styles.itemMeta} numberOfLines={1}>{item.meta}</Text>
                <Text style={styles.itemPreview} numberOfLines={2}>{item.preview}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ─── Detail modal: same shape as cards in HomeScreen ───────────────────────────
function DetailModal({ kind, id, onClose }: { kind: Kind; id: string; onClose: () => void }) {
  const renderBody = () => {
    if (kind === 'archetype') {
      const a = archetypesData.find(x => x.id === id)!;
      return (
        <>
          <DetailHeader emoji={a.emoji} name={a.name} meta={`${a.tradition} · ${a.category}`} color={Colors.gold} />
          <Section label="Öz" color={Colors.gold} body={a.essence} />
          <Section label="Aydınlık Yan" color={Colors.gold} body={a.lightAspect} />
          <Section label="Gölge Yan" color={Colors.gold} body={a.shadowAspect} />
          <Section label="🌙 Rüyada Görülürse" color={Colors.purpleLight} body={a.dreamMeaning} boxed />
          <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} body={a.wakingMeaning} boxed />
          <Section label="Bugünkü Pratik" color={Colors.gold} body={a.advice} />
          <View style={[styles.affirmBox, { borderColor: Colors.gold + '40' }]}>
            <Text style={[styles.affirmText, { color: Colors.goldLight }]}>{a.affirmation}</Text>
          </View>
        </>
      );
    }
    if (kind === 'myth') {
      const m = mythsData.find(x => x.id === id)!;
      return (
        <>
          <DetailHeader emoji={m.emoji} name={m.name} meta={`${m.culture} · ${m.era}`} color={Colors.purpleLight} />
          <Section label="Hikaye" color={Colors.purpleLight} body={m.summary} />
          <Section label="Derin Anlam" color={Colors.purpleLight} body={m.depthMeaning} />
          <Section label="Jung'un Okuması" color={Colors.purpleLight} body={m.jungian} />
          <Section label="🌙 Rüyada" color={Colors.purpleLight} body={m.dreamMeaning} boxed />
          <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} body={m.wakingMeaning} boxed />
          <View style={[styles.affirmBox, { borderColor: Colors.purple + '40' }]}>
            <Text style={[styles.affirmText, { color: Colors.purpleLight }]}>Ders: {m.lesson}</Text>
          </View>
        </>
      );
    }
    const im = imagesData.find(x => x.id === id)!;
    return (
      <>
        <DetailHeader emoji={im.emoji} name={im.name} meta={`${im.tradition} · ${im.category}`} color={Colors.tealLight} />
        <Section label="Öz" color={Colors.tealLight} body={im.essence} />
        <Section label="Sembolizm" color={Colors.tealLight} body={im.symbolism} />
        <Section label="🌙 Rüyada" color={Colors.purpleLight} body={im.dreamMeaning} boxed />
        <Section label="☀ Gerçek Hayatta" color={Colors.tealLight} body={im.wakingMeaning} boxed />
        <Section label="Bugünkü Pratik" color={Colors.tealLight} body={im.advice} />
      </>
    );
  };

  return (
    <View style={styles.modalRoot}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Detay</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalClose}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
        {renderBody()}
      </ScrollView>
    </View>
  );
}

function DetailHeader({ emoji, name, meta, color }: { emoji: string; name: string; meta: string; color: string }) {
  return (
    <View style={styles.detailHeader}>
      <View style={[styles.detailMedallion, { borderColor: color + '50' }]}>
        <Text style={styles.detailEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.detailName, { color }]}>{name}</Text>
      <Text style={styles.detailMeta}>{meta}</Text>
      <View style={[styles.detailDivider, { backgroundColor: color, opacity: 0.5 }]} />
    </View>
  );
}

function Section({ label, color, body, boxed }: { label: string; color: string; body: string; boxed?: boolean }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
      </View>
      <View style={boxed ? [styles.sectionBoxed, { borderColor: color + '30' }] : undefined}>
        <Text style={styles.sectionBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: Typography.size.xxxl,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  subTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  subTabLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.6,
  },

  content: { flex: 1 },

  // Liste
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginTop: Spacing.sm, gap: Spacing.xs },
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
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxxl },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  itemEmoji: { fontSize: 28 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemName: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, flexShrink: 1 },
  kindPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.round, borderWidth: 1 },
  kindPillText: { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', fontWeight: Typography.weight.semibold },
  itemMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  itemPreview: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.7,
    marginTop: Spacing.xs,
    fontWeight: Typography.weight.light,
  },

  // Detail modal
  modalRoot: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  modalClose: { fontSize: 22, color: Colors.textMuted },
  modalContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  detailHeader: { alignItems: 'center', marginBottom: Spacing.md },
  detailMedallion: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  detailEmoji: { fontSize: 36 },
  detailName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  detailMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 4 },
  detailDivider: { width: 28, height: 1, marginTop: Spacing.md },

  section: { marginBottom: Spacing.md },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  sectionDot: { width: 4, height: 4, borderRadius: 2 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.85,
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
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  affirmText: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
  },
});
