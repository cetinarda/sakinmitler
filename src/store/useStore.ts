import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReadingType = 'archetype' | 'myth' | 'image';

export interface DailyReading {
  date: string;
  archetypeId: string;
  mythId: string;
  imageId: string;
  archetypeSaved: boolean;
  mythSaved: boolean;
  imageSaved: boolean;
}

export interface UserProfile {
  name: string;
  fullName?: string;
  birthDate?: string;
  birthHour?: number;
  birthMinute?: number;
  birthCity?: string;
  element?: 'ateş' | 'su' | 'toprak' | 'hava';
  createdAt: string;
  streak: number;
  lastOpenDate?: string;
  totalReadings: number;
  level: number;
}

export interface ArchiveEntry {
  date: string;
  archetypeId: string;
  mythId: string;
  imageId: string;
}

export interface Stats {
  archetypeCounts: Record<string, number>;
  mythCounts: Record<string, number>;
  imageCounts: Record<string, number>;
  traditionCounts: Record<string, number>;
}

const STORAGE_KEYS = {
  PROFILE: '@mitler_profile',
  DAILY: '@mitler_daily',
  ARCHIVE: '@mitler_archive',
  STATS: '@mitler_stats',
};

const todayStr = () => new Date().toISOString().split('T')[0];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useMitlerStore() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    archetypeCounts: {},
    mythCounts: {},
    imageCounts: {},
    traditionCounts: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [profileRaw, dailyRaw, archiveRaw, statsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY),
        AsyncStorage.getItem(STORAGE_KEYS.ARCHIVE),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
      ]);

      if (!profileRaw) {
        setIsNewUser(true);
      } else {
        setProfile(JSON.parse(profileRaw));
      }

      if (dailyRaw) {
        const parsed: DailyReading = JSON.parse(dailyRaw);
        if (parsed.date === todayStr()) {
          setDailyReading(parsed);
        }
      }

      if (archiveRaw) setArchive(JSON.parse(archiveRaw));
      if (statsRaw) {
        const s = JSON.parse(statsRaw);
        setStats({
          archetypeCounts: {},
          mythCounts: {},
          imageCounts: {},
          traditionCounts: {},
          ...s,
        });
      }
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  }, []);

  const createProfile = useCallback(async (
    name: string,
    element: UserProfile['element'],
    birthDate?: string,
    fullName?: string,
  ) => {
    const p: UserProfile = {
      name,
      element,
      birthDate,
      fullName,
      createdAt: new Date().toISOString(),
      streak: 0,
      totalReadings: 0,
      level: 1,
    };
    await saveProfile(p);
    setIsNewUser(false);
  }, [saveProfile]);

  const updateBirthData = useCallback(async (
    fullName: string,
    birthDate: string,
    extras?: { birthHour?: number; birthMinute?: number; birthCity?: string },
  ) => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      fullName,
      birthDate,
      birthHour: extras?.birthHour,
      birthMinute: extras?.birthMinute,
      birthCity: extras?.birthCity,
    });
  }, [profile, saveProfile]);

  const generateDailyReading = useCallback(async (
    archetypeIds: string[],
    mythIds: string[],
    imageIds: string[],
  ) => {
    const today = todayStr();
    const reading: DailyReading = {
      date: today,
      archetypeId: pickRandom(archetypeIds),
      mythId: pickRandom(mythIds),
      imageId: pickRandom(imageIds),
      archetypeSaved: false,
      mythSaved: false,
      imageSaved: false,
    };

    setDailyReading(reading);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(reading));

    const entry: ArchiveEntry = {
      date: today,
      archetypeId: reading.archetypeId,
      mythId: reading.mythId,
      imageId: reading.imageId,
    };
    const newArchive = [entry, ...archive.filter(a => a.date !== today)];
    setArchive(newArchive);
    await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(newArchive));

    if (profile) {
      const last = profile.lastOpenDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = last === yesterdayStr ? profile.streak + 1 : 1;
      const updated: UserProfile = {
        ...profile,
        streak: newStreak,
        lastOpenDate: today,
        totalReadings: profile.totalReadings + 1,
        level: Math.floor((profile.totalReadings + 1) / 7) + 1,
      };
      await saveProfile(updated);
    }

    return reading;
  }, [archive, profile, saveProfile]);

  const updateStats = useCallback(async (
    archetypeId: string,
    mythId: string,
    imageId: string,
    tradition: string,
  ) => {
    const newStats: Stats = {
      archetypeCounts: { ...stats.archetypeCounts, [archetypeId]: (stats.archetypeCounts[archetypeId] || 0) + 1 },
      mythCounts: { ...stats.mythCounts, [mythId]: (stats.mythCounts[mythId] || 0) + 1 },
      imageCounts: { ...stats.imageCounts, [imageId]: (stats.imageCounts[imageId] || 0) + 1 },
      traditionCounts: { ...stats.traditionCounts, [tradition]: (stats.traditionCounts[tradition] || 0) + 1 },
    };
    setStats(newStats);
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  }, [stats]);

  const getTopStat = useCallback((counts: Record<string, number>): string | null => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, []);

  const getLevelTitle = useCallback((level: number): string => {
    const titles = ['Yolcu', 'Çırak', 'Arayıcı', 'Yorumcu', 'Mit Bilgesi', 'Arketip Ustası', 'Sembol Pîri'];
    return titles[Math.min(level - 1, titles.length - 1)];
  }, []);

  return {
    profile,
    dailyReading,
    archive,
    stats,
    isLoading,
    isNewUser,
    createProfile,
    saveProfile,
    updateBirthData,
    generateDailyReading,
    updateStats,
    getTopStat,
    getLevelTitle,
    todayStr,
  };
}
