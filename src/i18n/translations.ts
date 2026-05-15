export type Lang = 'tr' | 'en';

export type TranslationKey = keyof typeof TR;

export const TR = {
  // Common
  'common.back': '← Geri',
  'common.close': '✕',
  'common.skip': 'Şimdi değil, atla',
  'common.cancel': 'İptal',
  'common.continue': 'Devam Et →',
  'common.next': 'Sıradaki Deste →',
  'common.done': 'Tamamlandı ✦',
  'common.openDetail': 'Detayı Aç →',
  'common.familyTag': 'SAKİN · MİTLER',

  // Tabs
  'tab.home': 'Bugün',
  'tab.mitler': 'Mitler',
  'tab.archive': 'Arşiv',
  'tab.profile': 'Profil',

  // Greetings
  'greeting.night': 'Gece',
  'greeting.morning': 'Günaydın',
  'greeting.day': 'İyi günler',
  'greeting.evening': 'İyi akşamlar',
  'greeting.guest': 'Yolcu',

  // Home / decks
  'home.deck.archetype': 'Arketipler',
  'home.deck.myth': 'Mitler',
  'home.deck.image': 'İmgeler',
  'home.deck.archetypeSub': 'Jung\'un evrensel desenleri',
  'home.deck.mythSub': 'Tarihin derin hikayeleri',
  'home.deck.imageSub': 'Sembolik dilin alfabesi',
  'home.tapHint': 'salla · dokun',
  'home.done.title': 'Bugünkü mit okuman\ntamamlandı',
  'home.done.sub': 'Yarın bambaşka bir hikaye sana eşlik edecek',

  // Mitler hub
  'hub.eyebrow': 'SAKİN · MİTLER',
  'hub.panel.library': 'Mitler',
  'hub.panel.finder': 'Bul',
  'hub.panel.weekly': 'Hafta',

  // Library
  'library.subtitle': 'Jung\'dan Tarot\'a · {n} rehber',
  'library.search.placeholder': 'İsim, sembol veya tema ile ara...',
  'library.filter.all': 'Tümü',
  'library.filter.archetype': 'Arketip',
  'library.filter.myth': 'Mit',
  'library.filter.image': 'İmge',
  'library.filter.tarot': 'Tarot',
  'library.filter.rune': 'Rune',
  'library.filter.iching': 'I Ching',
  'library.empty': 'Arama sonucu yok.',

  // Finder
  'finder.title': 'Rehber Mitini Bul',
  'finder.intro.title': 'Rehber Mitini Keşfet',
  'finder.intro.desc': 'Ruhunla uyumlu arketipi bulmak için iki yol var.',
  'finder.intro.poetic':
    'Sakin sana bir ayna tutar — içinde zaten var olanı yansıtır ve olası olanı fısıldar. Onu kalbinde uyandıracak, hissedip özümseyecek olan ise yalnızca sensin.',
  'finder.mode.quiz.title': 'Sorularla Keşfet',
  'finder.mode.quiz.desc': '7 soru, karakterine göre eşleşir',
  'finder.mode.birth.title': 'Doğum Bilgilerimle Bul',
  'finder.mode.birth.desc': 'Tarih, saat ve şehir ile natal eşleşme',
  'finder.birth.title': 'Doğum Bilgilerini Gir',
  'finder.birth.desc':
    'Doğum anının mevsimi, yılı ve saati — hepsi sana eşlik eden arketipi şekillendiriyor.',
  'finder.birth.date': 'Doğum Tarihi',
  'finder.birth.day': 'Gün',
  'finder.birth.month': 'Ay',
  'finder.birth.year': 'Yıl',
  'finder.birth.city': 'Doğum Şehri',
  'finder.birth.cityPlaceholder': 'Örn. İstanbul, Konya, İzmir...',
  'finder.birth.cityHint': 'Doğduğun yerin enerjisi yorumuna derinlik katar.',
  'finder.birth.hour': 'Doğum Saati',
  'finder.birth.hourPlaceholder': 'Saat (0–23)',
  'finder.birth.hourHint': 'Saat bilmiyorsan boş bırak — yine de güçlü bir eşleşme yapılır.',
  'finder.birth.optional': '(isteğe bağlı)',
  'finder.submit': 'Rehberimi Bul ✦',
  'finder.result.label': 'Sana Eşlik Edenler',
  'finder.result.archetype': 'ARKETİP',
  'finder.result.myth': 'MİT',
  'finder.result.image': 'İMGE',
  'finder.again': 'Yeniden Keşfet ✦',
  'finder.close': 'Kapat ✦',

  // Detail screen
  'detail.section.essence': 'Öz',
  'detail.section.lightAspect': 'Aydınlık Yan',
  'detail.section.shadowAspect': 'Gölge Yan',
  'detail.section.dream': 'Rüyada Görülürse',
  'detail.section.waking': 'Gerçek Hayatta',
  'detail.section.advice': 'Bugünkü Pratik',
  'detail.section.affirmation': 'Olumlama',
  'detail.section.story': 'Hikaye',
  'detail.section.depth': 'Derin Anlamı',
  'detail.section.jungian': 'Jung\'un Okuması',
  'detail.section.lesson': 'Ders',
  'detail.section.symbolism': 'Sembolizm',
  'detail.section.upright': 'Düz (Upright)',
  'detail.section.reversed': 'Ters (Reversed)',
  'detail.section.trigrams': 'Trigramlar',
  'detail.kind.archetype': 'ARKETİP',
  'detail.kind.myth': 'MİT',
  'detail.kind.image': 'İMGE',
  'detail.kind.tarot': 'TAROT',
  'detail.kind.rune': 'RUNE',
  'detail.kind.iching': 'I CHING',

  // Weekly
  'weekly.title': 'Hafta — Dönemsel Rehber',
  'weekly.desc':
    'Tüm arketiplerin seninle doğar, ömür boyu kalır. Haftalık rehber ise belirli bir dönemine eşlik eden geçici figürdür.',
  'weekly.tag.archetype': 'BU HAFTA · EVRENSEL ARKETİP',
  'weekly.tag.myth': 'BU HAFTA · MİT',
  'weekly.tag.image': 'BU HAFTA · İMGE',
  'weekly.tag.personal': 'KİŞİSEL REHBERİM',
  'weekly.label.thisPeriod': 'BU DÖNEMDE',
  'weekly.label.lesson': 'DERS',
  'weekly.label.today': 'BUGÜN',
  'weekly.label.guidance': 'REHBERLİK',
  'weekly.daysLeft': '{n} gün kaldı',
  'weekly.locked.title': 'Kişisel Rehberim',
  'weekly.locked.text':
    'Doğum haritana göre sana özel dönemsel bir arketip belirlemek için profil bilgilerini tamamla.\n\nProfil → Kişisel Harita bölümünden doğum tarihini ekleyebilirsin.',

  // Archive
  'archive.title': 'Arşiv',
  'archive.count': '{n} okuma',
  'archive.map': 'Mit Haritan',
  'archive.empty.title': 'Henüz okuma yok.',
  'archive.empty.sub': 'Ana ekrandan ilk destenı aç.',
  'archive.label.archetype': 'Arketip',
  'archive.label.myth': 'Mit',
  'archive.label.image': 'İmge',
  'archive.label.tradition': 'Gelenek',
  'archive.dream': '🌙 Rüyada',
  'archive.waking': '☀ Gerçekte',

  // Profile / onboarding
  'profile.onboarding.title': 'SAKİN MİTLER',
  'profile.onboarding.subtitle':
    'Jung\'un izinde arketipler, mitler ve imgeler\nRüyada ve gerçek hayatta sana ne söylüyorlar?',
  'profile.onboarding.q1': 'Adın nedir, yolcu?',
  'profile.onboarding.namePlaceholder': 'Adını yaz...',
  'profile.onboarding.q2': 'Hangi unsura yakın hissediyorsun?',
  'profile.onboarding.q3': 'Derin analiz için',
  'profile.onboarding.q3desc':
    'İsim analizi, numaroloji ve haftalık mit haritası için.\nİstersen atlayabilirsin.',
  'profile.onboarding.fullName': 'İsim Soyisim...',
  'profile.onboarding.start': 'Yola Çık ✦',
  'profile.element.fire': 'Ateş',
  'profile.element.water': 'Su',
  'profile.element.earth': 'Toprak',
  'profile.element.air': 'Hava',
  'profile.elementSeparator': 'Unsur seçilmedi',
  'profile.stat.totalReadings': 'Toplam Okuma',
  'profile.stat.streak': 'Gün Silsile',
  'profile.stat.level': 'Seviye',
  'profile.section.levelProgress': 'Seviye İlerlemesi',
  'profile.section.personalMap': 'Kişisel Harita',
  'profile.section.mythMap': 'Mit Haritan',
  'profile.section.howTo': 'Nasıl Kullanılır?',
  'profile.section.badges': 'Rozetler',
  'profile.unlock.title': 'Kişisel Haritanı Aç',
  'profile.unlock.desc':
    'İsim soyisim ve doğum tarihini gir.\nNumaroloji, Human Design ve haftalık analiz.',
  'profile.birth.title': 'İsim ve doğum bilgilerini gir',
  'profile.birth.create': 'Haritamı Oluştur ✦',
  'profile.lifePath': 'Hayat Yolu',
  'profile.numerology.expression': 'İfade',
  'profile.numerology.soulUrge': 'Ruh İsteği',
  'profile.numerology.personality': 'Kişilik',
  'profile.hd.strategy': 'Human Design · Strateji: {s}',
  'profile.hd.notSelf': 'Not-Self Tema',
  'profile.weekly.label': 'Haftalık Rehberlik · {n}. hafta',
  'profile.weekly.personalYear': 'Kişisel yıl: {n}',
  'profile.map.topArchetype': 'Baskın Arketipin',
  'profile.map.topMyth': 'Sana Konuşan Mit',
  'profile.map.topImage': 'Sembolün',
  'profile.map.topTradition': 'Geleneğin',
  'profile.map.timesAccompanied': '{n} kez · {meta}',
  'profile.map.timesCalled': '{n} kez eşlik etti',
  'profile.map.emptyHint': 'İlk destenı aç, mit haritan oluşmaya başlasın.',
  'profile.howTo.line1':
    '• Her gün üç deste açılır: Arketipler, Mitler, İmgeler.',
  'profile.howTo.line2':
    '• Her karttaki 🌙 Rüyada bölümü, sembol rüyanda görünürse ne anlama gelebileceğini açıklar.',
  'profile.howTo.line3':
    '• ☀ Gerçek Hayatta bölümü ise sembolün uyanıkken karşına çıkışında ne söylediğini anlatır.',
  'profile.howTo.line4':
    '• Mitler sekmesinden tüm rehberleri arayabilir, Bul ile karakter analizi veya natal eşleştirme yapabilirsin.',
  'profile.howTo.line5': '• Sallayarak veya dokunarak kart açabilirsin.',
  'profile.language': 'Dil',
  'profile.language.tr': 'Türkçe',
  'profile.language.en': 'English',
  'profile.contentLangNote':
    'Arayüz İngilizce gösterilir; içerik (arketipler, mitler, imgeler) şu an Türkçe yayındadır.',

  // Help / glossary
  'help.howWorks': 'Nasıl Kullanılır?',
  'help.allTerms': '← Tüm Terimler',
  'help.intro':
    'Sakin Mitler\'de geçen kavramların kısa açıklamaları. Bir terime tıkla, detayını oku.',
  'help.modalTitle': 'Terimler Sözlüğü',
} as const;

export const EN: Record<keyof typeof TR, string> = {
  // Common
  'common.back': '← Back',
  'common.close': '✕',
  'common.skip': 'Not now, skip',
  'common.cancel': 'Cancel',
  'common.continue': 'Continue →',
  'common.next': 'Next Deck →',
  'common.done': 'Done ✦',
  'common.openDetail': 'Open Detail →',
  'common.familyTag': 'SAKIN · MYTHS',

  // Tabs
  'tab.home': 'Today',
  'tab.mitler': 'Myths',
  'tab.archive': 'Archive',
  'tab.profile': 'Profile',

  // Greetings
  'greeting.night': 'Night',
  'greeting.morning': 'Good morning',
  'greeting.day': 'Good day',
  'greeting.evening': 'Good evening',
  'greeting.guest': 'Traveler',

  // Home / decks
  'home.deck.archetype': 'Archetypes',
  'home.deck.myth': 'Myths',
  'home.deck.image': 'Symbols',
  'home.deck.archetypeSub': 'Jung\'s universal patterns',
  'home.deck.mythSub': 'Deep stories of history',
  'home.deck.imageSub': 'Alphabet of symbolic language',
  'home.tapHint': 'shake · tap',
  'home.done.title': 'Today\'s myth reading\nis complete',
  'home.done.sub': 'A different story will be with you tomorrow',

  // Mitler hub
  'hub.eyebrow': 'SAKIN · MYTHS',
  'hub.panel.library': 'Myths',
  'hub.panel.finder': 'Find',
  'hub.panel.weekly': 'Week',

  // Library
  'library.subtitle': 'From Jung to Tarot · {n} guides',
  'library.search.placeholder': 'Search by name, symbol or theme...',
  'library.filter.all': 'All',
  'library.filter.archetype': 'Archetype',
  'library.filter.myth': 'Myth',
  'library.filter.image': 'Symbol',
  'library.filter.tarot': 'Tarot',
  'library.filter.rune': 'Rune',
  'library.filter.iching': 'I Ching',
  'library.empty': 'No results.',

  // Finder
  'finder.title': 'Find Your Guide Myth',
  'finder.intro.title': 'Discover Your Guide Myth',
  'finder.intro.desc': 'Two paths to find the archetype that resonates with your soul.',
  'finder.intro.poetic':
    'Sakin holds up a mirror — it reflects what is already within and whispers what may be. The one who can awaken, feel and integrate it is you alone.',
  'finder.mode.quiz.title': 'Discover with Questions',
  'finder.mode.quiz.desc': '7 questions, matched to your character',
  'finder.mode.birth.title': 'Find with Birth Data',
  'finder.mode.birth.desc': 'Natal match by date, time and city',
  'finder.birth.title': 'Enter Birth Details',
  'finder.birth.desc':
    'The season, year and hour of your birth — each shapes the archetype that walks beside you.',
  'finder.birth.date': 'Birth Date',
  'finder.birth.day': 'Day',
  'finder.birth.month': 'Month',
  'finder.birth.year': 'Year',
  'finder.birth.city': 'Birth City',
  'finder.birth.cityPlaceholder': 'e.g. Istanbul, Konya, Izmir...',
  'finder.birth.cityHint': 'Your birthplace deepens the reading.',
  'finder.birth.hour': 'Birth Hour',
  'finder.birth.hourPlaceholder': 'Hour (0–23)',
  'finder.birth.hourHint': 'Leave blank if you don\'t know — a strong match is still made.',
  'finder.birth.optional': '(optional)',
  'finder.submit': 'Find My Guide ✦',
  'finder.result.label': 'Walking Beside You',
  'finder.result.archetype': 'ARCHETYPE',
  'finder.result.myth': 'MYTH',
  'finder.result.image': 'SYMBOL',
  'finder.again': 'Discover Again ✦',
  'finder.close': 'Close ✦',

  // Detail screen
  'detail.section.essence': 'Essence',
  'detail.section.lightAspect': 'Light Aspect',
  'detail.section.shadowAspect': 'Shadow Aspect',
  'detail.section.dream': 'If Seen in a Dream',
  'detail.section.waking': 'In Waking Life',
  'detail.section.advice': 'Today\'s Practice',
  'detail.section.affirmation': 'Affirmation',
  'detail.section.story': 'The Story',
  'detail.section.depth': 'Deeper Meaning',
  'detail.section.jungian': 'Jung\'s Reading',
  'detail.section.lesson': 'Lesson',
  'detail.section.symbolism': 'Symbolism',
  'detail.section.upright': 'Upright',
  'detail.section.reversed': 'Reversed',
  'detail.section.trigrams': 'Trigrams',
  'detail.kind.archetype': 'ARCHETYPE',
  'detail.kind.myth': 'MYTH',
  'detail.kind.image': 'SYMBOL',
  'detail.kind.tarot': 'TAROT',
  'detail.kind.rune': 'RUNE',
  'detail.kind.iching': 'I CHING',

  // Weekly
  'weekly.title': 'Week — Periodic Guide',
  'weekly.desc':
    'All archetypes are born with you and stay for life. The weekly guide is a temporary figure that walks beside you for a specific period.',
  'weekly.tag.archetype': 'THIS WEEK · UNIVERSAL ARCHETYPE',
  'weekly.tag.myth': 'THIS WEEK · MYTH',
  'weekly.tag.image': 'THIS WEEK · SYMBOL',
  'weekly.tag.personal': 'MY PERSONAL GUIDE',
  'weekly.label.thisPeriod': 'IN THIS PERIOD',
  'weekly.label.lesson': 'LESSON',
  'weekly.label.today': 'TODAY',
  'weekly.label.guidance': 'GUIDANCE',
  'weekly.daysLeft': '{n} days left',
  'weekly.locked.title': 'My Personal Guide',
  'weekly.locked.text':
    'Complete your profile to receive a periodic archetype based on your birth chart.\n\nProfile → Personal Map section lets you add your birth date.',

  // Archive
  'archive.title': 'Archive',
  'archive.count': '{n} readings',
  'archive.map': 'Your Myth Map',
  'archive.empty.title': 'No readings yet.',
  'archive.empty.sub': 'Open your first deck from the home screen.',
  'archive.label.archetype': 'Archetype',
  'archive.label.myth': 'Myth',
  'archive.label.image': 'Symbol',
  'archive.label.tradition': 'Tradition',
  'archive.dream': '🌙 In Dream',
  'archive.waking': '☀ In Waking',

  // Profile / onboarding
  'profile.onboarding.title': 'SAKIN MYTHS',
  'profile.onboarding.subtitle':
    'Archetypes, myths and symbols in Jung\'s footsteps\nWhat are they telling you in dreams and waking life?',
  'profile.onboarding.q1': 'What is your name, traveler?',
  'profile.onboarding.namePlaceholder': 'Write your name...',
  'profile.onboarding.q2': 'Which element do you feel close to?',
  'profile.onboarding.q3': 'For deep analysis',
  'profile.onboarding.q3desc':
    'For name analysis, numerology and weekly myth map.\nYou can skip if you wish.',
  'profile.onboarding.fullName': 'Full Name...',
  'profile.onboarding.start': 'Begin ✦',
  'profile.element.fire': 'Fire',
  'profile.element.water': 'Water',
  'profile.element.earth': 'Earth',
  'profile.element.air': 'Air',
  'profile.elementSeparator': 'No element chosen',
  'profile.stat.totalReadings': 'Total Readings',
  'profile.stat.streak': 'Day Streak',
  'profile.stat.level': 'Level',
  'profile.section.levelProgress': 'Level Progress',
  'profile.section.personalMap': 'Personal Map',
  'profile.section.mythMap': 'Your Myth Map',
  'profile.section.howTo': 'How to Use?',
  'profile.section.badges': 'Badges',
  'profile.unlock.title': 'Unlock Your Personal Map',
  'profile.unlock.desc':
    'Enter your full name and birth date.\nNumerology, Human Design and weekly analysis.',
  'profile.birth.title': 'Enter your name and birth details',
  'profile.birth.create': 'Create My Map ✦',
  'profile.lifePath': 'Life Path',
  'profile.numerology.expression': 'Expression',
  'profile.numerology.soulUrge': 'Soul Urge',
  'profile.numerology.personality': 'Personality',
  'profile.hd.strategy': 'Human Design · Strategy: {s}',
  'profile.hd.notSelf': 'Not-Self Theme',
  'profile.weekly.label': 'Weekly Guidance · Week {n}',
  'profile.weekly.personalYear': 'Personal year: {n}',
  'profile.map.topArchetype': 'Your Dominant Archetype',
  'profile.map.topMyth': 'The Myth That Speaks to You',
  'profile.map.topImage': 'Your Symbol',
  'profile.map.topTradition': 'Your Tradition',
  'profile.map.timesAccompanied': '{n} times · {meta}',
  'profile.map.timesCalled': 'accompanied {n} times',
  'profile.map.emptyHint': 'Open your first deck — your myth map will start to form.',
  'profile.howTo.line1':
    '• Three decks open each day: Archetypes, Myths, Symbols.',
  'profile.howTo.line2':
    '• Each card\'s 🌙 In Dream section explains what the symbol may mean if it appears in your dream.',
  'profile.howTo.line3':
    '• The ☀ In Waking section explains what the symbol means when it shows up in real life.',
  'profile.howTo.line4':
    '• Browse all guides under the Myths tab, or use Find for a character analysis or natal match.',
  'profile.howTo.line5': '• Shake or tap to open a card.',
  'profile.language': 'Language',
  'profile.language.tr': 'Türkçe',
  'profile.language.en': 'English',
  'profile.contentLangNote':
    'The interface is shown in English; content (archetypes, myths, symbols) is currently published in Turkish.',

  // Help / glossary
  'help.howWorks': 'How does it work?',
  'help.allTerms': '← All Terms',
  'help.intro':
    'Short descriptions of the concepts in Sakin Myths. Tap a term to read its details.',
  'help.modalTitle': 'Glossary',
};

export const DICTIONARY: Record<Lang, Record<string, string>> = {
  tr: TR,
  en: EN,
};
