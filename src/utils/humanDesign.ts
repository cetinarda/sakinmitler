// Human Design — bilingual (TR / EN)
// Approximate calculation; precision improves with hour + minute + city.

export type HDLang = 'tr' | 'en';

export type HDType = 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';

export type CenterId =
  | 'head' | 'ajna' | 'throat' | 'g' | 'heart'
  | 'spleen' | 'solar' | 'sacral' | 'root';

export interface HDCenter {
  id: CenterId;
  name: string;
  symbol: string;
  defined: boolean;
  fn: string;
  whenDefined: string;
  whenOpen: string;
  tip: string;
}

export type HDPrecision = 'low' | 'medium' | 'high';

export interface HDProfile {
  type: HDType;
  typeLabel: string;          // localised display name
  strategy: string;
  authority: string;
  notSelf: string;
  signature: string;
  profile: string;
  desc: string;
  definedCount: number;
  centers: HDCenter[];
  precision: HDPrecision;
  disclaimer: string;
}

// ── seed helpers ──────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) * 16777619;
  }
  return Math.abs(h | 0);
}

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// ── per-language strings ──────────────────────────────────────────────

interface CenterStrings {
  name: string;
  symbol: string;
  fn: string;
  whenDefined: string;
  whenOpen: string;
  tip: string;
}

const CENTERS_TR: Record<CenterId, CenterStrings> = {
  head: {
    name: 'Baş (Crown)', symbol: '△',
    fn: 'İlham, soru sorma kapasitesi, zihinsel baskı.',
    whenDefined: 'Sürekli kendi içsel ilham kaynağın var. Düşünme ritmin sabit; başkalarına ilham verirsin.',
    whenOpen: 'Sürekli "cevabı bulmalıyım" baskısı hissedersin. Aslında soruları soran sensin — cevap aramak senin işin değil.',
    tip: 'Açıksan: cevap verme zorunluluğunu bırak. Sorunun kendisi öğretmen.',
  },
  ajna: {
    name: 'Ajna (Zihin)', symbol: '▽',
    fn: 'Kavramsallaştırma, mantıksal düşünme, kesinlik.',
    whenDefined: 'Düşünce tarzın tutarlı. Aynı yöntemle benzer sonuçlara ulaşırsın.',
    whenOpen: 'Düşünce tarzın akışkan. Çok fikir benimseyebilirsin; "kesinlik" baskısına direnme.',
    tip: 'Açıksan: aynı fikre yıllarca bağlanmak zorunda değilsin.',
  },
  throat: {
    name: 'Boğaz', symbol: '◇',
    fn: 'İfade, manifesto, dile getirme, eylemin sesi.',
    whenDefined: 'Net konuşur, fikrini ifade etmekte zorlanmazsın. Sözcüklerin tutarlı.',
    whenOpen: 'Konuşma ihtiyacı duyduğunda dikkat alma baskısı yaşarsın. Davet bekle.',
    tip: 'Açıksan: söz hakkı için zorlama, davet edildiğinde konuş.',
  },
  g: {
    name: 'G Merkezi (Kimlik)', symbol: '◯',
    fn: 'Kimlik, yön, sevgi.',
    whenDefined: 'Kim olduğunu sabit hissedersin; yönün net.',
    whenOpen: 'Çevrene göre kimlik hissin değişir — esneklik bir hediye.',
    tip: 'Açıksan: "doğru kişi" sorusunu daimi sorma. Yer ve insanlar seni şekillendirir.',
  },
  heart: {
    name: 'Kalp (Ego)', symbol: '◈',
    fn: 'İrade, söz tutma, değer.',
    whenDefined: 'Söz verdiğini yaparsın. İrade kasin güçlü.',
    whenOpen: 'Sözünü yerine getirme baskısı yaşarsın — söz vermeden önce iki kez düşün.',
    tip: 'Açıksan: kendine zorla söz verme; içten gelen evetler tutuluyor.',
  },
  spleen: {
    name: 'Dalak (Sezgi)', symbol: '✺',
    fn: 'Anlık sezgi, korku, bağışıklık.',
    whenDefined: 'Anlık "bu doğru/yanlış" sezgilerin güçlü ve sabit.',
    whenOpen: 'Tek bir an için sezgisel uyarı alırsın — sonradan unutursun. İlk hisse güven.',
    tip: 'Açıksan: ilk içine geleni dinle. Tekrar etmez.',
  },
  solar: {
    name: 'Solar Plexus (Duygu)', symbol: '◐',
    fn: 'Duygusal dalgalar, his, hassasiyet.',
    whenDefined: 'Duygusal dalgan vardır — yüksek/alçak. Karar vermeden dalganın dibini bekle.',
    whenOpen: 'Çevrenin duygularını emiyorsun. Yalnız kaldığında sakinleşirsin.',
    tip: 'Tanımlıysan: anında karar verme. Açıksan: duyguyu sahiplenmeden tanı.',
  },
  sacral: {
    name: 'Sakral', symbol: '◉',
    fn: 'Yaşam enerjisi, iş gücü, içgüdüsel "evet/hayır".',
    whenDefined: 'Sürdürülebilir enerjin var. Sakral "uhuh/m-hm" sesleri sana ne istediğini söyler.',
    whenOpen: 'Sınırsız enerjin yok. Doğru zamanda durmak — bilgelik.',
    tip: 'Tanımlıysan: sakraline sor (sözle değil sesle). Açıksan: dinlenmek zorunluluk.',
  },
  root: {
    name: 'Kök', symbol: '▢',
    fn: 'Adrenalin, dürtü, baskı, motivasyon.',
    whenDefined: 'İç baskıyı ritmik dalgalarla deneyimlersin; sürekli "yapmalıyım"ya boğulmadan harekete geçersin.',
    whenOpen: 'Dış baskıyı kolayca emer ve aceleye getirirsin. "Önce bitirip kurtulayım" döngüsüne dikkat.',
    tip: 'Açıksan: aceleyi bilinçli sorgula. "Bu kimden geldi?"',
  },
};

const CENTERS_EN: Record<CenterId, CenterStrings> = {
  head: {
    name: 'Head (Crown)', symbol: '△',
    fn: 'Inspiration, capacity to question, mental pressure.',
    whenDefined: 'You have a continuous inner source of inspiration. Your thinking rhythm is fixed; you inspire others.',
    whenOpen: 'You constantly feel the pressure "I must find the answer". Actually you are the question-asker — answering isn\'t your job.',
    tip: 'If open: drop the duty to answer. The question itself is the teacher.',
  },
  ajna: {
    name: 'Ajna (Mind)', symbol: '▽',
    fn: 'Conceptualisation, logical thinking, certainty.',
    whenDefined: 'Your thinking style is consistent. Same method reaches similar conclusions.',
    whenOpen: 'Your thinking style is fluid. You can adopt many ideas; don\'t resist the pressure of "certainty".',
    tip: 'If open: you are not bound to the same idea for years.',
  },
  throat: {
    name: 'Throat', symbol: '◇',
    fn: 'Expression, manifesto, voicing, the sound of action.',
    whenDefined: 'You speak clearly, expressing yourself with no struggle. Your words are consistent.',
    whenOpen: 'When you feel the need to speak, you experience attention-seeking pressure. Wait for an invitation.',
    tip: 'If open: don\'t force the right to speak; speak when invited.',
  },
  g: {
    name: 'G Center (Identity)', symbol: '◯',
    fn: 'Identity, direction, love.',
    whenDefined: 'You feel who you are as fixed; your direction is clear.',
    whenOpen: 'Your sense of identity changes with surroundings — flexibility is a gift.',
    tip: 'If open: don\'t constantly ask "the right person" question. Place and people shape you.',
  },
  heart: {
    name: 'Heart (Ego)', symbol: '◈',
    fn: 'Will, keeping promises, value.',
    whenDefined: 'You do what you promise. Your will-muscle is strong.',
    whenOpen: 'You feel pressure to keep your word — think twice before promising.',
    tip: 'If open: don\'t force promises on yourself; sincere yes-es are kept.',
  },
  spleen: {
    name: 'Spleen (Intuition)', symbol: '✺',
    fn: 'Immediate intuition, fear, immunity.',
    whenDefined: 'Your immediate "right/wrong" intuitions are strong and consistent.',
    whenOpen: 'You receive intuitive warnings just for a moment — then forget. Trust the first feeling.',
    tip: 'If open: listen to the first thing that comes. It does not repeat.',
  },
  solar: {
    name: 'Solar Plexus (Emotion)', symbol: '◐',
    fn: 'Emotional waves, feeling, sensitivity.',
    whenDefined: 'You have an emotional wave — high/low. Wait for the bottom of the wave before deciding.',
    whenOpen: 'You absorb others\' emotions. You calm down when alone.',
    tip: 'If defined: do not decide immediately. If open: recognise the feeling without owning it.',
  },
  sacral: {
    name: 'Sacral', symbol: '◉',
    fn: 'Life force, work energy, instinctive "yes/no".',
    whenDefined: 'You have sustainable energy. Sacral "uh-huh / m-hm" sounds tell you what you want.',
    whenOpen: 'You don\'t have unlimited energy. Stopping at the right time — wisdom.',
    tip: 'If defined: ask your sacral (with sound, not words). If open: rest is essential.',
  },
  root: {
    name: 'Root', symbol: '▢',
    fn: 'Adrenaline, drive, pressure, motivation.',
    whenDefined: 'You experience inner pressure in rhythmic waves; you act without drowning in constant "I must".',
    whenOpen: 'You absorb outside pressure easily and rush. Watch the cycle "let me finish and be done".',
    tip: 'If open: consciously question the rush. "Where did this come from?"',
  },
};

interface TypeStrings {
  label: string;
  strategy: string;
  defaultAuthority: string;
  notSelf: string;
  signature: string;
  desc: string;
}

const TYPES_TR: Record<HDType, TypeStrings> = {
  'Generator': {
    label: 'Jeneratör',
    strategy: 'Yanıt vermek (Response)',
    defaultAuthority: 'Sakral otorite',
    notSelf: 'Hayal kırıklığı',
    signature: 'Tatmin',
    desc: 'Dünyanın yaşam enerji kaynağı sensin. Sakralin "evet" dediğinde tükenmeyen enerjin var; başlattığın işe sıkı sıkıya bağlı kal.',
  },
  'Manifesting Generator': {
    label: 'Manifesting Jeneratör',
    strategy: 'Yanıt ver, sonra bildir',
    defaultAuthority: 'Sakral otorite',
    notSelf: 'Hayal kırıklığı + öfke',
    signature: 'Tatmin + huzur',
    desc: 'Çok-yönlü, hızlı bir Jeneratörsün. Birden fazla şeyi aynı anda taşıyabilirsin. Atlayarak ilerle — geri dönmek normal. Hareket etmeden çevreni bilgilendirmek gerilimi azaltır.',
  },
  'Projector': {
    label: 'Projektör',
    strategy: 'Davet beklemek',
    defaultAuthority: 'Splenik veya duygusal',
    notSelf: 'Acılık (bitterness)',
    signature: 'Başarı + tanınma',
    desc: 'Görensin — başkalarının ne yaptığını derinden okursun. Ama sürekli enerji üretemezsin. Önemli alanlarda davet beklemek senin için kuraldır.',
  },
  'Manifestor': {
    label: 'Manifestor',
    strategy: 'Bildirmek (Inform)',
    defaultAuthority: 'Duygusal veya splenik',
    notSelf: 'Öfke',
    signature: 'Huzur',
    desc: 'Başlatma gücün var. Yeni bir döngü açar, harekete geçirirsin. Etrafındakileri bilgilendirmek direnci azaltır. Tek başına çalışma kapasiten yüksek.',
  },
  'Reflector': {
    label: 'Reflektör',
    strategy: 'Ay döngüsünü beklemek (28 gün)',
    defaultAuthority: 'Lunar otorite (28 gün)',
    notSelf: 'Hayal kırıklığı + sürpriz hissi',
    signature: 'Sürpriz',
    desc: 'Toplumun aynası — çevrenin sağlığını yansıtırsın. Büyük kararları 28 günlük ay döngüsünde değerlendir.',
  },
};

const TYPES_EN: Record<HDType, TypeStrings> = {
  'Generator': {
    label: 'Generator',
    strategy: 'To respond',
    defaultAuthority: 'Sacral authority',
    notSelf: 'Frustration',
    signature: 'Satisfaction',
    desc: 'You are the world\'s life-energy source. When your sacral says "yes" you have inexhaustible energy; stick tight to what you start.',
  },
  'Manifesting Generator': {
    label: 'Manifesting Generator',
    strategy: 'Respond, then inform',
    defaultAuthority: 'Sacral authority',
    notSelf: 'Frustration + anger',
    signature: 'Satisfaction + peace',
    desc: 'You are a multi-faceted, fast Generator. You can carry several things at once. Skip ahead — going back is normal. Informing your surroundings before moving reduces tension.',
  },
  'Projector': {
    label: 'Projector',
    strategy: 'Wait for invitation',
    defaultAuthority: 'Splenic or emotional',
    notSelf: 'Bitterness',
    signature: 'Success + recognition',
    desc: 'You are a seer — you read deeply what others are doing. But you can\'t produce energy continuously. Waiting for invitation in important areas is the rule for you.',
  },
  'Manifestor': {
    label: 'Manifestor',
    strategy: 'Inform',
    defaultAuthority: 'Emotional or splenic',
    notSelf: 'Anger',
    signature: 'Peace',
    desc: 'You have starting power. You open a new cycle and set things in motion. Informing those around reduces resistance. Your capacity to work alone is high.',
  },
  'Reflector': {
    label: 'Reflector',
    strategy: 'Wait the lunar cycle (28 days)',
    defaultAuthority: 'Lunar authority (28 days)',
    notSelf: 'Frustration + sense of surprise',
    signature: 'Surprise',
    desc: 'You are society\'s mirror — you reflect the health of your environment. Evaluate big decisions over a 28-day lunar cycle.',
  },
};

const PROFILES = [
  '1/3','1/4','2/4','2/5','3/5','3/6','4/6','4/1','5/1','5/2','6/2','6/3',
];

const AUTHORITY_OVERRIDES_TR: Record<string, string> = {
  solar: 'Duygusal (Solar Plexus) otorite',
  spleen: 'Splenik (anlık) otorite',
  heart: 'Ego otorite',
  g: 'Self-Projected otorite',
  mental: 'Mental / Çevresel otorite',
};
const AUTHORITY_OVERRIDES_EN: Record<string, string> = {
  solar: 'Emotional (Solar Plexus) authority',
  spleen: 'Splenic (instant) authority',
  heart: 'Ego authority',
  g: 'Self-Projected authority',
  mental: 'Mental / Environmental authority',
};

const DISCLAIMERS_TR: Record<HDPrecision, string> = {
  low: 'Sadece tarih ile yaklaşık hesap. Doğum saatini ekleyince merkezler ve tip çok daha doğru hesaplanır.',
  medium: 'Tarih ve saat ile orta doğrulukta hesap. Şehir bilgisini de eklersen yerelleştirme ile daha hassas olur.',
  high: 'Tarih, saat, dakika ve şehir ile en yüksek yaklaşık doğrulukta hesap. Resmi karşılaştırma için Swiss Ephemeris kullanan jovianarchive.com gibi profesyonel hesaplayıcılara bak.',
};
const DISCLAIMERS_EN: Record<HDPrecision, string> = {
  low: 'Approximate calculation from date only. Adding birth hour makes the centers and type much more accurate.',
  medium: 'Medium accuracy from date and hour. Adding the city makes the calculation more precise through localisation.',
  high: 'Highest approximate accuracy with date, hour, minute and city. For an official comparison use a professional calculator that runs Swiss Ephemeris (e.g. jovianarchive.com).',
};

// ── main calculation ──────────────────────────────────────────────────

export interface HDInput {
  birthDate: string;
  birthHour?: number;
  birthMinute?: number;
  birthCity?: string;
  lang?: HDLang;
}

export function calcHDProfile(input: HDInput): HDProfile {
  const lang: HDLang = input.lang || 'tr';
  const date = new Date(input.birthDate + 'T00:00:00Z');
  const doy = dayOfYear(date);

  const cityNorm = (input.birthCity || '').toLocaleLowerCase('tr-TR').trim();
  const hasHour = typeof input.birthHour === 'number' && !Number.isNaN(input.birthHour);
  const hasMin = typeof input.birthMinute === 'number' && !Number.isNaN(input.birthMinute);
  const hasCity = cityNorm.length > 0;

  const hourPart = hasHour ? String(input.birthHour).padStart(2, '0') : 'XX';
  const minPart = hasMin ? String(input.birthMinute).padStart(2, '0') : 'XX';

  const seedStr = `${input.birthDate}|${hourPart}:${minPart}|${cityNorm}|doy${doy}`;
  const seed = hashStr(seedStr);

  const defined: Record<CenterId, boolean> = {
    head:   ((seed >> 0)  & 0x07) > 3,
    ajna:   ((seed >> 3)  & 0x07) > 3,
    throat: ((seed >> 6)  & 0x0f) > 6,
    g:      ((seed >> 10) & 0x07) > 3,
    heart:  ((seed >> 13) & 0x0f) > 9,
    spleen: ((seed >> 17) & 0x0f) > 6,
    solar:  ((seed >> 21) & 0x0f) > 7,
    sacral: ((seed >> 25) & 0x0f) > 6,
    root:   ((seed >> 28) & 0x07) > 3,
  };
  const definedKeys = (Object.keys(defined) as CenterId[]).filter(k => defined[k]);

  let type: HDType;
  if (definedKeys.length === 0) {
    type = 'Reflector';
  } else if (defined.sacral) {
    const throatToMotor =
      defined.throat && (defined.heart || defined.solar || defined.sacral || defined.root);
    type = throatToMotor ? 'Manifesting Generator' : 'Generator';
  } else {
    const motorToThroat =
      defined.throat && (defined.heart || defined.solar || defined.root);
    type = motorToThroat ? 'Manifestor' : 'Projector';
  }

  const types = lang === 'en' ? TYPES_EN : TYPES_TR;
  const overrides = lang === 'en' ? AUTHORITY_OVERRIDES_EN : AUTHORITY_OVERRIDES_TR;

  let authority = types[type].defaultAuthority;
  if (type !== 'Generator' && type !== 'Manifesting Generator' && type !== 'Reflector') {
    if (defined.solar) authority = overrides.solar;
    else if (defined.spleen) authority = overrides.spleen;
    else if (defined.heart) authority = overrides.heart;
    else if (defined.g) authority = overrides.g;
    else if (type === 'Projector') authority = overrides.mental;
  }

  const profile = PROFILES[((seed >> 4) ^ doy) % PROFILES.length];

  let precision: HDPrecision = 'low';
  if (hasHour && hasMin && hasCity) precision = 'high';
  else if (hasHour) precision = 'medium';

  const centerStrings = lang === 'en' ? CENTERS_EN : CENTERS_TR;
  const centerOrder: CenterId[] = ['head','ajna','throat','g','heart','spleen','solar','sacral','root'];
  const centers: HDCenter[] = centerOrder.map(id => ({
    id,
    name: centerStrings[id].name,
    symbol: centerStrings[id].symbol,
    defined: defined[id],
    fn: centerStrings[id].fn,
    whenDefined: centerStrings[id].whenDefined,
    whenOpen: centerStrings[id].whenOpen,
    tip: centerStrings[id].tip,
  }));

  const td = types[type];
  const disclaimers = lang === 'en' ? DISCLAIMERS_EN : DISCLAIMERS_TR;

  return {
    type,
    typeLabel: td.label,
    strategy: td.strategy,
    authority,
    notSelf: td.notSelf,
    signature: td.signature,
    desc: td.desc,
    profile,
    definedCount: definedKeys.length,
    centers,
    precision,
    disclaimer: disclaimers[precision],
  };
}

// Legacy shims
export function calcHDType(birthDate: string): HDType {
  return calcHDProfile({ birthDate }).type;
}

export function getHDProfile(
  birthDate: string,
  birthHour?: number,
  birthMinute?: number,
  birthCity?: string,
  lang?: HDLang,
): HDProfile {
  return calcHDProfile({ birthDate, birthHour, birthMinute, birthCity, lang });
}
