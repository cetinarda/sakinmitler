import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import archetypesData from '../data/archetypes.json';
import mythsData from '../data/myths.json';
import imagesData from '../data/images.json';
import questionsData from '../data/questions.json';
import { useMitlerStore } from '../store/useStore';
import { calcLifePath } from '../utils/numerology';

interface BulScreenProps {
  onShowDetail: (kind: 'archetype' | 'myth' | 'image', id: string) => void;
}

type Mode = 'home' | 'questions' | 'natal' | 'help';

export function BulScreen({ onShowDetail }: BulScreenProps) {
  const [mode, setMode] = useState<Mode>('home');

  return (
    <View style={styles.root}>
      <BulHome onSelect={setMode} />

      <Modal
        visible={mode === 'questions'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMode('home')}
      >
        <QuestionsFlow
          onClose={() => setMode('home')}
          onResult={(id) => {
            setMode('home');
            onShowDetail('archetype', id);
          }}
        />
      </Modal>

      <Modal
        visible={mode === 'natal'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMode('home')}
      >
        <NatalFinder
          onClose={() => setMode('home')}
          onResult={(kind, id) => {
            setMode('home');
            onShowDetail(kind, id);
          }}
        />
      </Modal>

      <Modal
        visible={mode === 'help'}
        animationType="fade"
        transparent
        onRequestClose={() => setMode('home')}
      >
        <HelpOverlay onClose={() => setMode('home')} />
      </Modal>

      <TouchableOpacity
        style={styles.helpFab}
        onPress={() => setMode('help')}
        activeOpacity={0.8}
      >
        <Text style={styles.helpFabText}>?</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Home (the main "Bul" landing) ──────────────────────────────────────────────
function BulHome({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <ScrollView
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centerArea}>
        <Text style={styles.bigSparkle}>✦</Text>

        <Text style={styles.bigTitle}>Rehber Mitini Keşfet</Text>
        <Text style={styles.subtitle}>
          Ruhunla uyumlu arketipi bulmak için iki yol var.
        </Text>

        <Text style={styles.poetic}>
          Sakin Mitler sana bir ayna tutar — içinde zaten var olanı yansıtır
          ve olası olanı fısıldar. Onu kalbinde uyandıracak, hissedip
          özümseyecek olan ise yalnızca sensin.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.ctaCard, { borderColor: Colors.teal }]}
        onPress={() => onSelect('questions')}
        activeOpacity={0.85}
      >
        <View style={styles.ctaIcon}>
          <Text style={[styles.ctaIconText, { color: Colors.tealLight }]}>✦</Text>
        </View>
        <View style={styles.ctaText}>
          <Text style={[styles.ctaTitle, { color: Colors.tealLight }]}>
            Sorularla Keşfet
          </Text>
          <Text style={styles.ctaSub}>7 soru, karakterine göre eşleşir</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.ctaCard, { borderColor: Colors.gold }]}
        onPress={() => onSelect('natal')}
        activeOpacity={0.85}
      >
        <View style={styles.ctaIcon}>
          <Text style={[styles.ctaIconText, { color: Colors.gold }]}>☼</Text>
        </View>
        <View style={styles.ctaText}>
          <Text style={[styles.ctaTitle, { color: Colors.gold }]}>
            Doğum Bilgilerimle Bul
          </Text>
          <Text style={styles.ctaSub}>Tarih ve saate göre natal mit</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── 7-question flow ───────────────────────────────────────────────────────────
function QuestionsFlow({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (archetypeId: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultId, setResultId] = useState<string | null>(null);

  const total = questionsData.length;
  const q = questionsData[step];

  const pickAnswer = (optionIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = { ...scores };
    for (const id of q.options[optionIdx].scores) {
      next[id] = (next[id] || 0) + 1;
    }
    setScores(next);

    if (step === total - 1) {
      const top = Object.entries(next).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (top) {
        setResultId(top);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setScores({});
    setResultId(null);
  };

  if (resultId) {
    const archetype = archetypesData.find(a => a.id === resultId)!;
    return (
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sonuç</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultMedallion, { borderColor: Colors.gold + '60' }]}>
            <Text style={styles.resultEmoji}>{archetype.emoji}</Text>
          </View>
          <Text style={styles.resultLabel}>Sana eşlik eden arketip</Text>
          <Text style={styles.resultName}>{archetype.name}</Text>
          <Text style={styles.resultMeta}>{archetype.tradition} · {archetype.category}</Text>
          <View style={styles.resultDivider} />
          <Text style={styles.resultBody}>{archetype.essence}</Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.gold }]}
            onPress={() => onResult(archetype.id)}
          >
            <Text style={styles.primaryBtnText}>Detayını Aç →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={restart} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Yeniden Başla</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.modalRoot}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Sorularla Keşfet</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step + 1) / total) * 100}%`, backgroundColor: Colors.gold },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {step + 1} / {total}
      </Text>

      <View style={styles.qWrap}>
        <Text style={styles.qText}>{q.text}</Text>

        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={styles.qOption}
            onPress={() => pickAnswer(i)}
            activeOpacity={0.85}
          >
            <View style={styles.qOptionDot}>
              <Text style={styles.qOptionDotText}>{i === 0 ? 'A' : 'B'}</Text>
            </View>
            <Text style={styles.qOptionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Natal finder using birth date ─────────────────────────────────────────────
function NatalFinder({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (kind: 'archetype' | 'myth' | 'image', id: string) => void;
}) {
  const { profile, updateBirthData } = useMitlerStore();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [day, setDay]     = useState(profile?.birthDate ? profile.birthDate.split('-')[2] : '');
  const [month, setMonth] = useState(profile?.birthDate ? profile.birthDate.split('-')[1] : '');
  const [year, setYear]   = useState(profile?.birthDate ? profile.birthDate.split('-')[0] : '');
  const [hour, setHour]   = useState('');

  const valid =
    parseInt(day) >= 1 && parseInt(day) <= 31 &&
    parseInt(month) >= 1 && parseInt(month) <= 12 &&
    parseInt(year) >= 1900 && parseInt(year) <= new Date().getFullYear();

  const result = useMemo(() => {
    if (!valid) return null;
    const dd = day.padStart(2, '0');
    const mm = month.padStart(2, '0');
    const birthDate = `${year}-${mm}-${dd}`;
    const lp = calcLifePath(birthDate);
    const hr = parseInt(hour) || 12;

    const archetypeIdx = (lp + hr) % archetypesData.length;
    const mythIdx      = (lp * 3 + hr) % mythsData.length;
    const imageIdx     = (lp * 5 + Math.floor(hr / 2)) % imagesData.length;

    return {
      lifePath: lp,
      archetype: archetypesData[archetypeIdx],
      myth: mythsData[mythIdx],
      image: imagesData[imageIdx],
    };
  }, [day, month, year, hour, valid]);

  const handleSave = async () => {
    if (!valid) return;
    if (fullName.trim().length > 0) {
      const dd = day.padStart(2, '0');
      const mm = month.padStart(2, '0');
      await updateBirthData(fullName.trim(), `${year}-${mm}-${dd}`);
    }
  };

  return (
    <ScrollView
      style={styles.modalRoot}
      contentContainerStyle={styles.natalContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Doğum Bilgilerimle Bul</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.natalIntro}>
        Doğum tarihinden Hayat Yolu sayını hesaplıyor; sayıya göre sana en yakın
        arketip, mit ve sembolü öneriyoruz. Saat bilgisi vermek, eşleşmeyi inceltir.
      </Text>

      <Text style={styles.natalLabel}>İsim Soyisim (opsiyonel)</Text>
      <TextInput
        style={styles.natalInput}
        value={fullName}
        onChangeText={setFullName}
        placeholder="İsim Soyisim"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="words"
      />

      <Text style={styles.natalLabel}>Doğum Tarihi</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.natalInput, { flex: 1 }]}
          value={day}
          onChangeText={setDay}
          placeholder="Gün"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.natalInput, { flex: 1 }]}
          value={month}
          onChangeText={setMonth}
          placeholder="Ay"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.natalInput, { flex: 2 }]}
          value={year}
          onChangeText={setYear}
          placeholder="Yıl"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      <Text style={styles.natalLabel}>Doğum Saati (opsiyonel)</Text>
      <TextInput
        style={styles.natalInput}
        value={hour}
        onChangeText={setHour}
        placeholder="0 - 23"
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={2}
      />

      {result && (
        <View style={styles.natalResultBox}>
          <Text style={styles.natalResultLabel}>Hayat Yolu Sayın</Text>
          <Text style={styles.natalResultBig}>{result.lifePath}</Text>

          <NatalRow
            label="Arketipin"
            color={Colors.gold}
            emoji={result.archetype.emoji}
            name={result.archetype.name}
            meta={result.archetype.tradition}
            onTap={() => { handleSave(); onResult('archetype', result.archetype.id); }}
          />
          <NatalRow
            label="Mitin"
            color={Colors.purpleLight}
            emoji={result.myth.emoji}
            name={result.myth.name}
            meta={result.myth.culture}
            onTap={() => { handleSave(); onResult('myth', result.myth.id); }}
          />
          <NatalRow
            label="Sembolün"
            color={Colors.tealLight}
            emoji={result.image.emoji}
            name={result.image.name}
            meta={result.image.tradition}
            onTap={() => { handleSave(); onResult('image', result.image.id); }}
          />
        </View>
      )}

      {!valid && (
        <Text style={styles.natalHint}>
          Doğum tarihini eksiksiz gir, sonuç altta belirsin.
        </Text>
      )}
    </ScrollView>
  );
}

function NatalRow({
  label, color, emoji, name, meta, onTap,
}: { label: string; color: string; emoji: string; name: string; meta: string; onTap: () => void }) {
  return (
    <TouchableOpacity style={[styles.natalRow, { borderColor: color + '40' }]} onPress={onTap} activeOpacity={0.85}>
      <Text style={styles.natalEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.natalRowLabel, { color }]}>{label}</Text>
        <Text style={styles.natalRowName}>{name}</Text>
        <Text style={styles.natalRowMeta}>{meta}</Text>
      </View>
      <Text style={[styles.natalArrow, { color }]}>→</Text>
    </TouchableOpacity>
  );
}

// ─── Help overlay ───────────────────────────────────────────────────────────────
function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.helpBackdrop}>
      <View style={styles.helpCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Bul Nasıl Çalışır?</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helpLine}>
          • <Text style={{ color: Colors.tealLight }}>Sorularla Keşfet</Text> 7 kısa
          sorudan oluşur. Verdiğin yanıtlar arketip skorları biriktirir; en yüksek
          puanlı arketip sana eşlik eden olarak önerilir.
        </Text>
        <Text style={styles.helpLine}>
          • <Text style={{ color: Colors.gold }}>Doğum Bilgilerimle Bul</Text> doğum
          tarihinden Hayat Yolu sayını hesaplar; saat verirsen eşleşmeyi inceltir
          ve sana üçlü öneri sunar (arketip + mit + sembol).
        </Text>
        <Text style={styles.helpLine}>
          • Sonuçlar yargılayıcı değil, çağırıcıdır. Bir gün başka bir arketip seni
          çağırabilir; bu doğal bir akıştır.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  homeContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  centerArea: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  bigSparkle: {
    fontSize: 56,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  bigTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
    paddingHorizontal: Spacing.md,
  },
  poetic: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.9,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  ctaIcon: {
    width: 44,
    alignItems: 'center',
  },
  ctaIconText: { fontSize: 28 },
  ctaText: { flex: 1 },
  ctaTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.4,
  },
  ctaSub: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  helpFab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.ember,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  helpFabText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: Typography.weight.bold,
  },

  // Modal common
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
    letterSpacing: 0.4,
  },
  modalClose: { fontSize: 22, color: Colors.textMuted },

  // Question flow
  progressTrack: {
    height: 3,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: BorderRadius.round },
  progressText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  qWrap: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  qText: {
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    lineHeight: Typography.size.lg * 1.5,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.md,
  },
  qOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  qOptionDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qOptionDotText: {
    color: Colors.gold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  qOptionText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },

  // Result
  resultContent: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  resultMedallion: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.goldGlow,
    marginVertical: Spacing.md,
  },
  resultEmoji: { fontSize: 48 },
  resultLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  resultName: {
    fontSize: Typography.size.xxl,
    color: Colors.gold,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  resultMeta: { fontSize: Typography.size.xs, color: Colors.textMuted },
  resultDivider: {
    width: 28, height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.4,
    marginVertical: Spacing.md,
  },
  resultBody: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.8,
    fontWeight: Typography.weight.light,
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.md,
  },
  primaryBtnText: {
    color: '#1A1208',
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.8,
  },
  secondaryBtn: { marginTop: Spacing.sm, padding: Spacing.sm },
  secondaryBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
  },

  // Natal
  natalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  natalIntro: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
    marginBottom: Spacing.lg,
  },
  natalLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  natalInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  natalHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  natalResultBox: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  natalResultLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  natalResultBig: {
    fontSize: 48,
    color: Colors.gold,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  natalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  natalEmoji: { fontSize: 28 },
  natalRowLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  natalRowName: {
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  natalRowMeta: { fontSize: Typography.size.xs, color: Colors.textMuted },
  natalArrow: { fontSize: 20 },

  // Help
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
