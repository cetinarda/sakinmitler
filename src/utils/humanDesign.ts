export type HDType = 'Jeneratör' | 'Manifesting Jeneratör' | 'Projektör' | 'Manifestor' | 'Reflektör';

export interface HDProfile {
  type: HDType;
  strategy: string;
  authority: string;
  desc: string;
  notSelf: string;
}

const HD_PROFILES: Record<HDType, Omit<HDProfile, 'type'>> = {
  'Jeneratör': {
    strategy: 'Yanıt vermek',
    authority: 'Sakral',
    desc: 'Yaşam enerjisinin kaynağısın. Güçlü içgüdüsel yanıtlarınla doğru kararlar alırsın. Sevdiğin işe tam enerji verirsin.',
    notSelf: 'Hayal kırıklığı hissediyorsan, yanlış şeylere evet diyorsunuzdur.',
  },
  'Manifesting Jeneratör': {
    strategy: 'Yanıt ver, sonra harekete geç',
    authority: 'Sakral',
    desc: 'Çok boyutlu hızlı bir enerjin var. Birden fazla şeyi aynı anda yapabilirsin. Verimliliğin ve esnekliğin eşsizdir.',
    notSelf: 'Sinirleniyorsan ya da hayal kırıklığı yaşıyorsan, yanlış yöndesindir.',
  },
  'Projektör': {
    strategy: 'Davetleri beklemek',
    authority: 'Kişisel yetki',
    desc: 'Sistemleri ve insanları derinlemesine görme yeteneğin var. Rehberlik etmek ve yönetmek için doğdun. Davet edildiğinde en iyi çıkarsın.',
    notSelf: 'Acı ve kızgınlık, davetin gelmediğine işarettir.',
  },
  'Manifestor': {
    strategy: 'Bildirmek',
    authority: 'Duygusal ya da içsel',
    desc: 'Bağımsız başlatma enerjisine sahipsin. Harekete geçirme ve yeni döngüler açma gücündürsün. Özgürlük senin için hayatidir.',
    notSelf: 'Öfke hissediyorsan, kontrol kaybı yaşıyorsundur.',
  },
  'Reflektör': {
    strategy: '28 gün beklemek',
    authority: 'Lunar yetki',
    desc: 'Toplumun aynasısın. Çevrenin enerjisini yansıtır, toplulukların sağlığını gösterirsin. Ay döngüsüyle kararlar alırsın.',
    notSelf: 'Hayal kırıklığı yaşıyorsan, ortamın doğru değildir.',
  },
};

// Simplified offline calculation — real HD requires planetary ephemeris.
// This assigns a consistent type from the birth date hash with natural distribution.
export function calcHDType(birthDate: string): HDType {
  const parts = birthDate.split('-').map(Number);
  const [year, month, day] = parts;
  const hash = ((year * 13) + (month * 7) + (day * 3)) % 100;

  if (hash < 37) return 'Jeneratör';
  if (hash < 70) return 'Manifesting Jeneratör';
  if (hash < 90) return 'Projektör';
  if (hash < 99) return 'Manifestor';
  return 'Reflektör';
}

export function getHDProfile(birthDate: string): HDProfile {
  const type = calcHDType(birthDate);
  return { type, ...HD_PROFILES[type] };
}
