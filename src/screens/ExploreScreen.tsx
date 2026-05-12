import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';
import { BulScreen } from './BulScreen';

type SubTab = 'liste' | 'bul';
type Kind = 'archetype' | 'myth' | 'image';

const SUB_TABS: { key: SubTab; label: string; icon: string }[] = [
  { key: 'liste', label: 'Liste', icon: '⊕' },
  { key: 'bul',   label: 'Bul',   icon: '✦' },
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

const TOTAL_COUNT =
  archetypesData.length + mythsData.length + imagesData.length;

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<SubTab>('liste');
  const [detail, setDetail] = useState<{ kind: Kind; id: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const onShowDetail = (kind: Kind, id: string) => setDetail({ kind, id });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>SAKİN · MİTLER</Text>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>
            {tab === 'liste' ? 'Liste' : 'Bul'}
          </Text>
          <TouchableOpacity
            style={styles.helpBadge}
            onPress={() => setShowHelp(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.helpBadgeText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subTabsRow}>
        {SUB_TABS.map(t => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.subTab,
                active && { borderColor: Colors.teal, backgroundColor: Colors.teal + '10' },
              ]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.subTabLabel, { color: active ? Colors.tealLight : Colors.textMuted }]}>
                {t.icon}  {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {tab === 'liste' && <ListeView onShowDetail={onShowDetail} />}
        {tab === 'bul'   && <BulScreen onShowDetail={onShowDetail} />}
      </View>

      <Modal
        visible={detail !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetail(null)}
      >
        {detail && <DetailModal kind={detail.kind} id={detail.id} onClose={() => setDetail(null)} />}
      </Modal>

      <Modal
        visible={showHelp}
        animationType="fade"
        transparent
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.helpBackdrop}>
          <View style={styles.helpCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nasıl Kullanılır?</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpLine}>
              • <Text style={{ color: Colors.tealLight }}>Liste</Text> sekmesinde tüm
              arketip, mit ve imgeleri alfabetik göz atabilir; üstteki kutucuktan isim,
              sembol veya tema ile arayabilirsin.
            </Text>
            <Text style={styles.helpLine}>
              • <Text style={{ color: Colors.gold }}>Bul</Text> sekmesinde sana eşlik
              eden mitini iki yolla bulabilirsin: 7 soruluk karakter analizi veya
              doğum tarihi/saati üzerinden natal eşleştirme.
            </Text>
            <Text style={styles.helpLine}>
              • Her karta dokun → o sembolün özü, gölgesi, 🌙 rüyada ve ☀ gerçek
              hayatta karşılığı açılır.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Liste sub-tab ─────────────────────────────────────────────────────────────
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

interface ListItem {
  kind: Kind;
  id: string;
  name: string;
  emoji: string;
  tags: string;
  fullText: string;
}

function buildListItems(): ListItem[] {
  const arch: ListItem[] = archetypesData.map(a => ({
    kind: 'archetype',
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    tags: (a.keywords || []).slice(0, 3).join(' · '),
    fullText: [
      a.name, a.tradition, a.category, a.essence,
      a.lightAspect, a.shadowAspect, a.dreamMeaning, a.wakingMeaning,
      a.advice, a.affirmation, ...(a.keywords || []),
    ].join(' '),
  }));
  const myth: ListItem[] = mythsData.map(m => ({
    kind: 'myth',
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    tags: [m.culture, m.element, m.category].filter(Boolean).join(' · '),
    fullText: [
      m.name, m.culture, m.era, m.category, m.summary,
      m.depthMeaning, m.jungian, m.dreamMeaning, m.wakingMeaning, m.lesson,
    ].join(' '),
  }));
  const img: ListItem[] = imagesData.map(i => ({
    kind: 'image',
    id: i.id,
    name: i.name,
    emoji: i.emoji,
    tags: (i.keywords || []).slice(0, 3).join(' · '),
    fullText: [
      i.name, i.tradition, i.category, i.essence,
      i.symbolism, i.dreamMeaning, i.wakingMeaning, i.advice,
      ...(i.keywords || []),
    ].join(' '),
  }));
  return [...arch, ...myth, ...img];
}

function firstLetter(name: string): string {
  const first = name.trim().charAt(0).toLocaleUpperCase('tr-TR');
  if (first === 'İ') return 'İ';
  if (first === 'I') return 'I';
  return first;
}

function ListeView({ onShowDetail }: { onShowDetail: (kind: Kind, id: string) => void }) {
  const [filter, setFilter] = useState<'all' | Kind>('all');
  const [query, setQuery] = useState('');
  const allItems = useMemo(() => buildListItems(), []);

  const filtered = useMemo(() => {
    const pool = filter === 'all' ? allItems : allItems.filter(x => x.kind === filter);
    const q = normalize(query);
    if (q.length === 0) return pool;

    const terms = q.split(/\s+/).filter(Boolean);
    return pool.filter(it => {
      const nameN = normalize(it.name);
      const fullN = normalize(it.fullText);
      return terms.every(t => nameN.includes(t) || fullN.includes(t));
    });
  }, [filter, query, allItems]);

  const sections = useMemo(() => {
    const groups: Record<string, ListItem[]> = {};
    for (const it of filtered) {
      const k = firstLetter(it.name);
      (groups[k] = groups[k] || []).push(it);
    }
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, 'tr'))
      .map(letter => ({
        title: letter,
        data: groups[letter].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
      }));
  }, [filtered]);

  const FILTERS: { key: 'all' | Kind; label: string; color: string }[] = [
    { key: 'all',       label: 'Tümü',     color: Colors.gold },
    { key: 'archetype', label: 'Arketip',  color: Colors.gold },
    { key: 'myth',      label: 'Mit',      color: Colors.purple },
    { key: 'image',     label: 'İmge',     color: Colors.teal },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => `${item.kind}:${item.id}`}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={ls.headerWrap}>
          <Text style={ls.caption}>
            Jung'dan kadim mitlere · {TOTAL_COUNT} kayıt
          </Text>

          <View style={ls.searchBox}>
            <Text style={ls.searchIcon}>✦</Text>
            <TextInput
              style={ls.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="İsim, sembol veya unsur ile ara..."
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={ls.clearBtn}>
                <Text style={ls.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={ls.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[ls.filterBtn, filter === f.key && { borderColor: f.color }]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[ls.filterLabel, { color: filter === f.key ? f.color : Colors.textMuted }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={ls.sectionHeader}>
          <View style={ls.sectionDot} />
          <Text style={ls.sectionTitle}>{section.title}</Text>
          <View style={ls.sectionLine} />
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const color = KIND_COLOR[item.kind];
        const isLast = index === section.data.length - 1;
        return (
          <TouchableOpacity
            style={[ls.row, !isLast && ls.rowDivider]}
            onPress={() => onShowDetail(item.kind, item.id)}
            activeOpacity={0.7}
          >
            <View style={[ls.avatar, { borderColor: color + '40' }]}>
              <Text style={ls.avatarEmoji}>{item.emoji}</Text>
            </View>
            <View style={ls.rowText}>
              <View style={ls.rowNameLine}>
                <Text style={ls.rowName} numberOfLines={1}>{item.name}</Text>
                <View style={[ls.kindChip, { borderColor: color + '50' }]}>
                  <Text style={[ls.kindChipText, { color }]}>{KIND_LABEL[item.kind]}</Text>
                </View>
              </View>
              {!!item.tags && (
                <Text style={ls.rowTags} numberOfLines={1}>{item.tags}</Text>
              )}
            </View>
            <Text style={ls.rowArrow}>→</Text>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={ls.empty}>
          <Text style={ls.emptyText}>Sonuç bulunamadı.</Text>
          <Text style={ls.emptySubtext}>Farklı bir kelime dene.</Text>
        </View>
      }
      contentContainerStyle={ls.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────────
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
    paddingBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: Typography.size.xxxl,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  helpBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.ember,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  helpBadgeText: {
    color: '#FFF',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
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
    textAlign: 'center',
  },
  detailMeta: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
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

  // Help overlay
  helpBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  helpCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingBottom: Spacing.lg,
  },
  helpLine: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});

// Liste-specific styles
const ls = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  caption: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    fontSize: 14,
    color: Colors.gold,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md - 2,
  },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: Colors.textMuted },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  sectionDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.tealLight,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    color: Colors.tealLight,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  rowText: { flex: 1, gap: 2 },
  rowNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowName: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  kindChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  kindChipText: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
  },
  rowTags: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  rowArrow: {
    fontSize: 18,
    color: Colors.textMuted,
  },

  empty: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  emptySubtext: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
