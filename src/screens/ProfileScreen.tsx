import React, { useState, useMemo } from 'react';
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
import { useLanguage } from '../i18n/useLanguage';
import { calcNumerology, LIFE_PATH_MEANINGS } from '../utils/numerology';
import { getHDProfile } from '../utils/humanDesign';
import { getWeeklyReading } from '../utils/weeklyReading';

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
  const { profile, isNewUser, createProfile, updateBirthData, stats, getTopStat, getLevelTitle } = useMitlerStore();
  const { lang, t, setLanguage } = useLanguage();

  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [name, setName] = useState('');
  const [element, setElement] = useState<typeof ELEMENTS[number]>('ateş');
  const [step, setStep] = useState(1);

  // step 3 birth data
  const [fullName, setFullName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // inline birth data edit (when already profiled but no birth data)
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDay, setEditDay] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');

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

  const analysis = useMemo(() => {
    if (!profile?.fullName || !profile?.birthDate) return null;
    try {
      const nums   = calcNumerology(profile.fullName, profile.birthDate);
      const hd     = getHDProfile(profile.birthDate);
      const weekly = getWeeklyReading(nums);
      const lp     = LIFE_PATH_MEANINGS[nums.lifePath];
      return { nums, hd, weekly, lp };
    } catch {
      return null;
    }
  }, [profile?.fullName, profile?.birthDate]);

  const formatBirthDate = (d: string, m: string, y: string) => {
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const birthDataValid = (d: string, m: string, y: string) =>
    parseInt(d) >= 1 && parseInt(d) <= 31 &&
    parseInt(m) >= 1 && parseInt(m) <= 12 &&
    parseInt(y) >= 1900 && parseInt(y) <= new Date().getFullYear();

  const handleOnboarding = async () => {
    if (step === 1 && name.trim().length > 0) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const bd = birthDataValid(birthDay, birthMonth, birthYear)
        ? formatBirthDate(birthDay, birthMonth, birthYear)
        : undefined;
      await createProfile(name.trim(), element, bd, fullName.trim() || undefined);
      setShowOnboarding(false);
    }
  };

  const handleSkipBirth = async () => {
    await createProfile(name.trim(), element);
    setShowOnboarding(false);
  };

  const handleSaveBirthData = async () => {
    if (!birthDataValid(editDay, editMonth, editYear)) return;
    const bd = formatBirthDate(editDay, editMonth, editYear);
    await updateBirthData(editFullName.trim(), bd);
    setShowBirthForm(false);
  };

  if (showOnboarding || isNewUser) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.onboarding, { paddingTop: insets.top + Spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.onboardingEmoji}>☥</Text>
        <Text style={styles.onboardingTitle}>{t('profile.onboarding.title')}</Text>
        <Text style={styles.onboardingSubtitle}>{t('profile.onboarding.subtitle')}</Text>

        {step === 1 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q1')}</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.onboarding.namePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q2')}</Text>
            <View style={styles.elementsGrid}>
              {ELEMENTS.map(el => {
                const elKey =
                  el === 'ateş'   ? 'profile.element.fire'  :
                  el === 'su'     ? 'profile.element.water' :
                  el === 'toprak' ? 'profile.element.earth' :
                                    'profile.element.air';
                return (
                  <TouchableOpacity
                    key={el}
                    style={[styles.elementBtn, element === el && styles.elementBtnActive]}
                    onPress={() => setElement(el)}
                  >
                    <Text style={styles.elementEmoji}>{ELEMENT_EMOJIS[el]}</Text>
                    <Text style={[styles.elementName, { color: element === el ? Colors.gold : Colors.textSecondary }]}>
                      {t(elKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q3')}</Text>
            <Text style={styles.onboardingHint}>{t('profile.onboarding.q3desc')}</Text>
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.onboarding.fullName')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={birthDay}
                onChangeText={setBirthDay}
                placeholder={t('finder.birth.day')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={birthMonth}
                onChangeText={setBirthMonth}
                placeholder={t('finder.birth.month')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 2 }]}
                value={birthYear}
                onChangeText={setBirthYear}
                placeholder={t('finder.birth.year')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.onboardingBtn, { opacity: step === 1 && name.trim().length === 0 ? 0.4 : 1 }]}
          onPress={handleOnboarding}
          disabled={step === 1 && name.trim().length === 0}
        >
          <Text style={styles.onboardingBtnText}>
            {step < 3 ? t('common.continue') : t('profile.onboarding.start')}
          </Text>
        </TouchableOpacity>

        {step === 3 && (
          <TouchableOpacity onPress={handleSkipBirth} style={styles.skipBtn}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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

      {/* Kişisel Harita */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişisel Harita</Text>

        {analysis ? (
          <>
            {/* Life Path */}
            <View style={[styles.analysisCard, { borderColor: Colors.gold + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.goldGlow }]}>
                  <Text style={[styles.analysisBadgeNum, { color: Colors.gold }]}>
                    {analysis.nums.lifePath}
                  </Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisTitle, { color: Colors.gold }]}>
                    {analysis.lp.title}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    Hayat Yolu · {analysis.lp.keyword}
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.lp.desc}</Text>
              <View style={styles.subNums}>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.expression}</Text>
                  <Text style={styles.subNumLabel}>İfade</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.soulUrge}</Text>
                  <Text style={styles.subNumLabel}>Ruh İsteği</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.personality}</Text>
                  <Text style={styles.subNumLabel}>Kişilik</Text>
                </View>
              </View>
            </View>

            {/* Human Design */}
            <View style={[styles.analysisCard, { borderColor: Colors.purple + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.purple + '20' }]}>
                  <Text style={{ fontSize: 18 }}>◈</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisTitle, { color: Colors.purpleLight }]}>
                    {analysis.hd.type}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    Human Design · Strateji: {analysis.hd.strategy}
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.hd.desc}</Text>
              <View style={[styles.notSelfBox, { borderColor: Colors.purple + '30' }]}>
                <Text style={[styles.notSelfLabel, { color: Colors.purple }]}>Not-Self Tema</Text>
                <Text style={styles.notSelfText}>{analysis.hd.notSelf}</Text>
              </View>
            </View>

            {/* Weekly Reading */}
            <View style={[styles.analysisCard, { borderColor: Colors.teal + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.teal + '20' }]}>
                  <Text style={{ fontSize: 18 }}>◎</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisTitle, { color: Colors.tealLight }]}>
                    {analysis.weekly.theme}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    Haftalık Rehberlik · {analysis.weekly.weekNumber}. hafta
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.weekly.message}</Text>
              <Text style={[styles.analysisMeta, { marginTop: Spacing.xs }]}>
                Kişisel yıl: {analysis.weekly.personalYear}
              </Text>
            </View>
          </>
        ) : showBirthForm ? (
          <View style={styles.birthForm}>
            <Text style={styles.birthFormTitle}>İsim ve doğum bilgilerini gir</Text>
            <TextInput
              style={styles.nameInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="İsim Soyisim..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editDay}
                onChangeText={setEditDay}
                placeholder="Gün"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editMonth}
                onChangeText={setEditMonth}
                placeholder="Ay"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 2 }]}
                value={editYear}
                onChangeText={setEditYear}
                placeholder="Yıl"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <TouchableOpacity
              style={[styles.onboardingBtn, {
                opacity: editFullName.trim().length > 0 && birthDataValid(editDay, editMonth, editYear) ? 1 : 0.4
              }]}
              onPress={handleSaveBirthData}
              disabled={editFullName.trim().length === 0 || !birthDataValid(editDay, editMonth, editYear)}
            >
              <Text style={styles.onboardingBtnText}>Haritamı Oluştur ✦</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBirthForm(false)} style={styles.skipBtn}>
              <Text style={styles.skipText}>İptal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => {
              setEditFullName('');
              setEditDay(''); setEditMonth(''); setEditYear('');
              setShowBirthForm(true);
            }}
          >
            <Text style={styles.unlockIcon}>✦</Text>
            <Text style={styles.unlockTitle}>Kişisel Haritanı Aç</Text>
            <Text style={styles.unlockDesc}>
              İsim soyisim ve doğum tarihini gir.{'\n'}
              Numaroloji, Human Design ve haftalık analiz.
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mit Haritan */}
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
          <Text style={styles.howLine}>• <Text style={{ color: Colors.gold }}>Ara</Text> sekmesinden istediğin mit, arketip veya imgeyi aratabilirsin.</Text>
          <Text style={styles.howLine}>• Sallayarak veya dokunarak kart açabilirsin.</Text>
        </View>
      </View>

      {/* Dil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <View style={styles.langRow}>
          {(['tr', 'en'] as const).map(code => {
            const active = lang === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.langBtn, active && styles.langBtnActive]}
                onPress={() => setLanguage(code)}
                activeOpacity={0.85}
              >
                <Text style={[styles.langLabel, { color: active ? Colors.gold : Colors.textMuted }]}>
                  {t(code === 'tr' ? 'profile.language.tr' : 'profile.language.en')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {lang === 'en' && (
          <Text style={styles.langNote}>{t('profile.contentLangNote')}</Text>
        )}
      </View>

      {/* Rozetler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.section.badges')}</Text>
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
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
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
  onboardingHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
    marginBottom: Spacing.xs,
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
    maxWidth: 380,
    textAlign: 'center',
    alignSelf: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    minWidth: 0,
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
  skipBtn: { paddingVertical: Spacing.sm },
  skipText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
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

  // Analysis cards
  analysisCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  analysisBadge: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  analysisBadgeNum: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  analysisHeaderText: { flex: 1 },
  analysisTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  analysisMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  analysisDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.8,
    fontWeight: Typography.weight.light,
  },
  subNums: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  subNum: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
  },
  subNumVal: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  subNumLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notSelfBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  notSelfLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  notSelfText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
  },

  unlockBtn: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unlockIcon: { fontSize: 28, color: Colors.gold, opacity: 0.7 },
  unlockTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  unlockDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
  },

  birthForm: { gap: Spacing.sm },
  birthFormTitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

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

  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
  },
  langBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  langLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  langNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    lineHeight: Typography.size.xs * 1.6,
  },
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
