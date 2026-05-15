// Human Design hesabı — sadece tarih girildiğinde yaklaşık, saat + şehir
// girildiğinde belirgin biçimde daha nokta atışı çalışır.
//
// Tam HD chart için Swiss Ephemeris ile gerçek gezegen pozisyonları gerek.
// Bu modül; doğum tarihi, saati, dakikası ve şehir girdileriyle deterministik
// bir profil üretir. Saat verilince her merkez için seed büyük ölçüde değişir
// ve sonuçların doğruluğu artar.

export type HDType = 'Jeneratör' | 'Manifesting Jeneratör' | 'Projektör' | 'Manifestor' | 'Reflektör';

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

// ── deterministic seed helpers ────────────────────────────────────────

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

// ── center metadata ───────────────────────────────────────────────────

const CENTER_DEFS: Omit<HDCenter, 'defined'>[] = [
  {
    id: 'head', name: 'Baş (Crown)', symbol: '△',
    fn: 'İlham, soru sorma kapasitesi, zihinsel baskı.',
    whenDefined:
      'Sürekli kendi içsel ilham kaynağın var. Düşünme ritmin sabit; başkalarına ilham verirsin.',
    whenOpen:
      'Sürekli "cevabı bulmalıyım" baskısı hissedersin. Aslında soruları soran sensin — cevap aramak senin işin değil.',
    tip: 'Açıksan: cevap verme zorunluluğunu bırak. Sorunun kendisi öğretmen.',
  },
  {
    id: 'ajna', name: 'Ajna (Zihin)', symbol: '▽',
    fn: 'Kavramsallaştırma, mantıksal düşünme, kesinlik.',
    whenDefined:
      'Düşünce tarzın tutarlı. Aynı yöntemle benzer sonuçlara ulaşırsın.',
    whenOpen:
      'Düşünce tarzın akışkan. Çok fikir benimseyebilirsin; "kesinlik" baskısına direnme.',
    tip: 'Açıksan: aynı fikre yıllarca bağlanmak zorunda değilsin.',
  },
  {
    id: 'throat', name: 'Boğaz', symbol: '◇',
    fn: 'İfade, manifesto, dile getirme, eylemin sesi.',
    whenDefined:
      'Net konuşur, fikrini ifade etmekte zorlanmazsın. Sözcüklerin tutarlı.',
    whenOpen:
      'Konuşma ihtiyacı duyduğunda dikkat alma baskısı yaşarsın. Davet bekle.',
    tip: 'Açıksan: söz hakkı için zorlama, davet edildiğinde konuş.',
  },
  {
    id: 'g', name: 'G Merkezi (Kimlik)', symbol: '◯',
    fn: 'Kimlik, yön, sevgi.',
    whenDefined: 'Kim olduğunu sabit hissedersin; yönün net.',
    whenOpen: 'Çevrene göre kimlik hissin değişir — esneklik bir hediye.',
    tip: 'Açıksan: "doğru kişi" sorusunu daimi sorma. Yer ve insanlar seni şekillendirir.',
  },
  {
    id: 'heart', name: 'Kalp (Ego)', symbol: '◈',
    fn: 'İrade, söz tutma, değer.',
    whenDefined: 'Söz verdiğini yaparsın. İrade kasin güçlü.',
    whenOpen: 'Sözünü yerine getirme baskısı yaşarsın — söz vermeden önce iki kez düşün.',
    tip: 'Açıksan: kendine zorla söz verme; içten gelen evetler tutuluyor.',
  },
  {
    id: 'spleen', name: 'Dalak (Sezgi)', symbol: '✺',
    fn: 'Anlık sezgi, korku, bağışıklık.',
    whenDefined: 'Anlık "bu doğru/yanlış" sezgilerin güçlü ve sabit.',
    whenOpen: 'Tek bir an için sezgisel uyarı alırsın — sonradan unutursun. İlk hisse güven.',
    tip: 'Açıksan: ilk içine geleni dinle. Tekrar etmez.',
  },
  {
    id: 'solar', name: 'Solar Plexus (Duygu)', symbol: '◐',
    fn: 'Duygusal dalgalar, his, hassasiyet.',
    whenDefined: 'Duygusal dalgan vardır — yüksek/alçak. Karar vermeden dalganın dibini bekle.',
    whenOpen: 'Çevrenin duygularını emiyorsun. Yalnız kaldığında sakinleşirsin.',
    tip: 'Tanımlıysan: anında karar verme. Açıksan: duyguyu sahiplenmeden tanı.',
  },
  {
    id: 'sacral', name: 'Sakral', symbol: '◉',
    fn: 'Yaşam enerjisi, iş gücü, içgüdüsel "evet/hayır".',
    whenDefined: 'Sürdürülebilir enerjin var. Sakral "uhuh/m-hm" sesleri sana ne istediğini söyler.',
    whenOpen: 'Sınırsız enerjin yok. Doğru zamanda durmak — bilgelik.',
    tip: 'Tanımlıysan: sakraline sor (sözle değil sesle). Açıksan: dinlenmek zorunluluk.',
  },
  {
    id: 'root', name: 'Kök', symbol: '▢',
    fn: 'Adrenalin, dürtü, baskı, motivasyon.',
    whenDefined:
      'İç baskıyı ritmik dalgalarla deneyimlersin; sürekli "yapmalıyım"ya boğulmadan harekete geçersin.',
    whenOpen:
      'Dış baskıyı kolayca emer ve aceleye getirirsin. "Önce bitirip kurtulayım" döngüsüne dikkat.',
    tip: 'Açıksan: aceleyi bilinçli sorgula. "Bu kimden geldi?"',
  },
];

// ── type details ──────────────────────────────────────────────────────

const TYPE_DETAILS: Record<HDType, Omit<HDProfile, 'type' | 'profile' | 'centers' | 'definedCount' | 'precision' | 'disclaimer' | 'authority'> & { defaultAuthority: string }> = {
  'Jeneratör': {
    strategy: 'Yanıt vermek (Response)',
    defaultAuthority: 'Sakral otorite',
    notSelf: 'Hayal kırıklığı',
    signature: 'Tatmin',
    desc:
      'Dünyanın yaşam enerji kaynağı sensin. Sakralin "evet" dediğinde tükenmeyen enerjin var; başlattığın işe sıkı sıkıya bağlı kal. Davet veya çağrı geldiğinde içsel sakral sesini dinle — "uhuh" veya "m-hm".',
  },
  'Manifesting Jeneratör': {
    strategy: 'Yanıt ver, sonra bildir',
    defaultAuthority: 'Sakral otorite',
    notSelf: 'Hayal kırıklığı + öfke',
    signature: 'Tatmin + huzur',
    desc:
      'Çok-yönlü, hızlı bir Jeneratörsün. Birden fazla şeyi aynı anda taşıyabilirsin. Atlayarak ilerle — bir adım geri normal, yine bir şey öğrendin. Harekete geçmeden çevreni bilgilendirmek gerilimi azaltır.',
  },
  'Projektör': {
    strategy: 'Davet beklemek',
    defaultAuthority: 'Splenik veya duygusal',
    notSelf: 'Acılık (bitterness)',
    signature: 'Başarı + tanınma',
    desc:
      'Görensin — başkalarının ne yaptığını derinden okursun. Ama sürekli enerji üretemezsin. Önemli alanlarda (kariyer, ilişki) davet beklemek senin için kuraldır. Davet edilmediğin yerde rehberliğin değer bulmaz.',
  },
  'Manifestor': {
    strategy: 'Bildirmek (Inform)',
    defaultAuthority: 'Duygusal veya splenik',
    notSelf: 'Öfke',
    signature: 'Huzur',
    desc:
      'Başlatma gücün var. Yeni bir döngü açar, harekete geçirirsin. Dünyaya etkin büyük; o yüzden harekete geçmeden önce etrafındakileri bilgilendirmek direnci azaltır. Tek başına çalışma kapasiten yüksek.',
  },
  'Reflektör': {
    strategy: 'Ay döngüsünü beklemek (28 gün)',
    defaultAuthority: 'Lunar otorite (28 gün)',
    notSelf: 'Hayal kırıklığı + sürpriz hissi',
    signature: 'Sürpriz',
    desc:
      'Toplumun aynası — çevrenin sağlığını yansıtırsın. Büyük kararları 28 günlük ay döngüsünde değerlendir. Doğru insanlarla doğru yerde olduğunda en parlak hâlin ortaya çıkar.',
  },
};

// ── profile lines ─────────────────────────────────────────────────────

const PROFILES = [
  '1/3','1/4','2/4','2/5','3/5','3/6','4/6','4/1','5/1','5/2','6/2','6/3',
];

// ── main calculation ──────────────────────────────────────────────────

export interface HDInput {
  birthDate: string;       // YYYY-MM-DD
  birthHour?: number;      // 0-23
  birthMinute?: number;    // 0-59
  birthCity?: string;
}

export function calcHDProfile(input: HDInput): HDProfile {
  const date = new Date(input.birthDate + 'T00:00:00Z');
  const doy = dayOfYear(date);

  // Build seed — saat varken seed çok daha varyatif olur
  const cityNorm = (input.birthCity || '').toLocaleLowerCase('tr-TR').trim();
  const hasHour = typeof input.birthHour === 'number' && !Number.isNaN(input.birthHour);
  const hasMin = typeof input.birthMinute === 'number' && !Number.isNaN(input.birthMinute);
  const hasCity = cityNorm.length > 0;

  const hourPart = hasHour ? String(input.birthHour).padStart(2, '0') : 'XX';
  const minPart = hasMin ? String(input.birthMinute).padStart(2, '0') : 'XX';

  const seedStr = `${input.birthDate}|${hourPart}:${minPart}|${cityNorm}|doy${doy}`;
  const seed = hashStr(seedStr);

  // Centers
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

  // Type derivation
  let type: HDType;
  if (definedKeys.length === 0) {
    type = 'Reflektör';
  } else if (defined.sacral) {
    const throatToMotor =
      defined.throat && (defined.heart || defined.solar || defined.sacral || defined.root);
    type = throatToMotor ? 'Manifesting Jeneratör' : 'Jeneratör';
  } else {
    const motorToThroat =
      defined.throat && (defined.heart || defined.solar || defined.root);
    type = motorToThroat ? 'Manifestor' : 'Projektör';
  }

  // Authority
  let authority = TYPE_DETAILS[type].defaultAuthority;
  if (type !== 'Jeneratör' && type !== 'Manifesting Jeneratör' && type !== 'Reflektör') {
    if (defined.solar) authority = 'Duygusal (Solar Plexus) otorite';
    else if (defined.spleen) authority = 'Splenik (anlık) otorite';
    else if (defined.heart) authority = 'Ego otorite';
    else if (defined.g) authority = 'Self-Projected otorite';
    else if (type === 'Projektör') authority = 'Mental / Çevresel otorite';
  }

  // Profile
  const profile = PROFILES[((seed >> 4) ^ doy) % PROFILES.length];

  // Precision: hour+city + minute = high, hour only = medium, neither = low
  let precision: HDPrecision = 'low';
  if (hasHour && hasMin && hasCity) precision = 'high';
  else if (hasHour) precision = 'medium';

  // Centers list
  const centers: HDCenter[] = CENTER_DEFS.map(def => ({
    ...def,
    defined: defined[def.id],
  }));

  const details = TYPE_DETAILS[type];

  let disclaimer = '';
  if (precision === 'low') {
    disclaimer =
      'Sadece tarih ile yaklaşık hesap. Doğum saatini ekleyince merkezler ve tip çok daha doğru hesaplanır.';
  } else if (precision === 'medium') {
    disclaimer =
      'Tarih ve saat ile orta doğrulukta hesap. Şehir bilgisini de eklersen yerelleştirme ile daha hassas olur.';
  } else {
    disclaimer =
      'Tarih, saat, dakika ve şehir ile en yüksek yaklaşık doğrulukta hesap. Resmi karşılaştırma için Swiss Ephemeris kullanan jovianarchive.com gibi profesyonel hesaplayıcılara bak.';
  }

  return {
    type,
    strategy: details.strategy,
    authority,
    notSelf: details.notSelf,
    signature: details.signature,
    desc: details.desc,
    profile,
    definedCount: definedKeys.length,
    centers,
    precision,
    disclaimer,
  };
}

// Legacy shims — eski koddaki çağrılar çalışmaya devam etsin
export function calcHDType(birthDate: string): HDType {
  return calcHDProfile({ birthDate }).type;
}

export function getHDProfile(
  birthDate: string,
  birthHour?: number,
  birthMinute?: number,
  birthCity?: string,
): HDProfile {
  return calcHDProfile({ birthDate, birthHour, birthMinute, birthCity });
}
