import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useMitlerStore } from '../store/useStore';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';

const ELEMENTS = ['ateş', 'su', 'toprak', 'hava'] as const;
const ELEMENT_EMOJIS: Record<string, string> = {
  ateş: '🔥', su: '💧', toprak: '🌿', hava: '🌬️'
};

const BADGES = [
  { id: 'b001', title: 'Yol Başlangıcı', desc: 'İlk 7 okuma',   emoji: '🌙', required: 7 },
  { id: 'b002', title: 'Mit Yolcusu',    desc: '21 gün silsile', emoji: '📜', required: 21 },
  { id: 'b003', title: 'Arketip Bilen',  desc: '30 okuma',       emoji: '🎭', required: 30 },
  { id: 'b004', title: 'Sembol Ustası',  desc: '50 okuma',       emoji: '☥', required: 50 },
  { id: 'b005', title: 'Hak Dostu',      desc: '100 okuma',      emoji: '✦', required: 100 },
  { id: 'b006', title: 'Ezel Anlatıcı',  desc: '365 okuma',      emoji: '☀️', required: 365 },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isNewUser, createProfile, stats, getTopStat, getLevelTitle } = useMitlerStore();

  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [name, setName] = useState('');
  const [element, setElement] = useState<typeof ELEMENTS[number]>('ateş');
  const [step, setStep] = useState(1);

  const topArchetypeId = getTopStat(stats.archetypeCounts);
  const topMythId      = getTopStat(stats.mythCounts);
  const topImageId     = getTopStat(stats.imageCounts);
  const topTradition   = getTopStat(stats.traditionCounts);

  const topArchetype = topArchetypeId ? archetypesData.find(a => a.id === topArchetypeId) : null;
  const topMyth      = topMythId      ? mythsData.find(m => m.id === topMythId)           : null;
  const topImage     = topImageId     ? imagesData.find(i => i.id === topImageId)         : null;

  const totalReadings = profile?.totalReadings || 0;
  const streak        = profile?.streak || 0;
  const level         = profile?.level || 1;
  const levelTitle    = getLevelTitle(level);

  const levelProgress = () => {
    const nextAt    = level * 7;
    const currentAt = (level - 1) * 7;
    return Math.min(Math.max((totalReadings - currentAt) / (nextAt - currentAt), 0), 1);
  };

  const handleOnboarding = async () => {
    if (step === 1 && name.trim().length > 0) {
      setStep(2);
    } else if (step === 2) {
      await createProfile(name.trim(), element);
      setShowOnboarding(false);
    }
  };

  if (showOnboarding || isNewUser) {
    return (
      <View style={[styles.container, styles.onboarding, { paddingTop: insets.top }]}>
        <Text style={styles.onboardingEmoji}>☥</Text>
        <Text style={styles.onboardingTitle}>SAKİN MİTLER</Text>
        <Text style={styles.onboardingSubtitle}>
          Jung'un izinde arketipler, mitler ve imgeler{'\n'}
          Rüyada ve gerçek hayatta sana ne söylüyorlar?
        </Text>

        {step === 1 && (
          <>
            <Text style={styles.onboardingQuestion}>Adın nedir, yolcu?</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Adını yaz..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.onboardingQuestion}>Hangi unsura yakın hissediyorsun?</Text>
            <View style={styles.elementsGrid}>
              {ELEMENTS.map(el => (
                <TouchableOpacity
                  key={el}
                  style={[styles.elementBtn, element === el && styles.elementBtnActive]}
                  onPress={() => setElement(el)}
                >
                  <Text style={styles.elementEmoji}>{ELEMENT_EMOJIS[el]}</Text>
                  <Text style={[styles.elementName, { color: element === el ? Colors.gold : Colors.textSecondary }]}>
                    {el.charAt(0).toUpperCase() + el.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.onboardingBtn, { opacity: step === 1 && name.trim().length === 0 ? 0.4 : 1 }]}
          onPress={handleOnboarding}
          disabled={step === 1 && name.trim().length === 0}
        >
          <Text style={styles.onboardingBtnText}>
            {step === 1 ? 'Devam Et →' : 'Yola Çık ✦'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{ELEMENT_EMOJIS[profile.element || 'ateş']}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <Text style={styles.heroLevel}>{levelTitle}</Text>
        <Text style={styles.heroElement}>
          {ELEMENT_EMOJIS[profile.element || 'ateş']} {profile.element || 'Unsur seçilmedi'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalReadings}</Text>
          <Text style={styles.statLabel}>Toplam Okuma</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxCenter]}>
          <Text style={[styles.statValue, { color: Colors.ember }]}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>Gün Silsile</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>Seviye</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seviye İlerlemesi</Text>
          <Text style={styles.sectionMeta}>{levelTitle} → {getLevelTitle(level + 1)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${levelProgress() * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{totalReadings} / {level * 7} okuma</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mit Haritan</Text>

        {topArchetype && (
          <View style={[styles.spiritCard, { borderColor: Colors.gold }]}>
            <Text style={styles.spiritEmoji}>{topArchetype.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>Baskın Arketipin</Text>
              <Text style={[styles.spiritValue, { color: Colors.gold }]}>{topArchetype.name}</Text>
              <Text style={styles.spiritCount}>{stats.archetypeCounts[topArchetype.id] || 0} kez · {topArchetype.tradition}</Text>
            </View>
          </View>
        )}
        {topMyth && (
          <View style={[styles.spiritCard, { borderColor: Colors.purple }]}>
            <Text style={styles.spiritEmoji}>{topMyth.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>Sana Konuşan Mit</Text>
              <Text style={[styles.spiritValue, { color: Colors.purpleLight }]}>{topMyth.name}</Text>
              <Text style={styles.spiritCount}>{stats.mythCounts[topMyth.id] || 0} kez · {topMyth.culture}</Text>
            </View>
          </View>
        )}
        {topImage && (
          <View style={[styles.spiritCard, { borderColor: Colors.teal }]}>
            <Text style={styles.spiritEmoji}>{topImage.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>Sembolün</Text>
              <Text style={[styles.spiritValue, { color: Colors.tealLight }]}>{topImage.name}</Text>
              <Text style={styles.spiritCount}>{stats.imageCounts[topImage.id] || 0} kez · {topImage.tradition}</Text>
            </View>
          </View>
        )}
        {topTradition && (
          <View style={[styles.spiritCard, { borderColor: Colors.ember }]}>
            <Text style={styles.spiritEmoji}>📜</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>Geleneğin</Text>
              <Text style={[styles.spiritValue, { color: Colors.emberLight }]}>{topTradition}</Text>
              <Text style={styles.spiritCount}>{stats.traditionCounts[topTradition] || 0} kez eşlik etti</Text>
            </View>
          </View>
        )}
        {totalReadings === 0 && (
          <Text style={styles.emptyHint}>İlk destenı aç, mit haritan oluşmaya başlasın.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nasıl Kullanılır?</Text>
        <View style={styles.howCard}>
          <Text style={styles.howLine}>• Her gün üç deste açılır: <Text style={{ color: Colors.gold }}>Arketipler</Text>, <Text style={{ color: Colors.purpleLight }}>Mitler</Text>, <Text style={{ color: Colors.tealLight }}>İmgeler</Text>.</Text>
          <Text style={styles.howLine}>• Her karttaki <Text style={{ color: Colors.purpleLight }}>🌙 Rüyada</Text> bölümü, sembol rüyanda görünürse ne anlama gelebileceğini açıklar.</Text>
          <Text style={styles.howLine}>• <Text style={{ color: Colors.tealLight }}>☀ Gerçek Hayatta</Text> bölümü ise sembolün uyanıkken karşına çıkışında ne söylediğini anlatır.</Text>
          <Text style={styles.howLine}>• Açıklamalar Jung, Campbell, Pearson ve halk gelenekleri ışığında hazırlandı — psikolojik rehberlik niyetiyle.</Text>
          <Text style={styles.howLine}>• Sallayarak veya dokunarak kart açabilirsin.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rozetler</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map(badge => {
            const earned = totalReadings >= badge.required || streak >= badge.required;
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  earned ? { borderColor: Colors.gold, backgroundColor: Colors.goldGlow } : styles.badgeLocked
                ]}
              >
                <Text style={[styles.badgeEmoji, !earned && { opacity: 0.4 }]}>
                  {earned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeTitle, { color: earned ? Colors.gold : Colors.textMuted }]}>
                  {badge.title}
                </Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxxl },
  onboarding: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  onboardingEmoji: { fontSize: 56, marginBottom: Spacing.sm, color: Colors.gold },
  onboardingTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  onboardingSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
  onboardingQuestion: {
    fontSize: Typography.size.lg,
    color: Colors.gold,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    width: '100%',
    textAlign: 'center',
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  elementBtn: {
    width: 130,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.xs,
  },
  elementBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  elementEmoji: { fontSize: 28 },
  elementName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    letterSpacing: 1,
  },
  onboardingBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  onboardingBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 1,
  },

  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.goldGlow,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  heroName: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  heroLevel: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    letterSpacing: 3,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  heroElement: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statBoxCenter: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.divider,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  sectionMeta: { fontSize: Typography.size.xs, color: Colors.textMuted },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: BorderRadius.round },
  progressText: { fontSize: Typography.size.xs, color: Colors.textMuted },

  spiritCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  spiritEmoji: { fontSize: 32 },
  spiritInfo: { flex: 1 },
  spiritLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  spiritValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginVertical: 2,
  },
  spiritCount: { fontSize: Typography.size.xs, color: Colors.textMuted },
  emptyHint: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },

  howCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  howLine: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
  },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: {
    width: '30%', flex: 1, minWidth: 90,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 4,
  },
  badgeLocked: { opacity: 0.5 },
  badgeEmoji: { fontSize: 24 },
  badgeTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  badgeDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
});
