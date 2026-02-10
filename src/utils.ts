import type { DurationCounts } from './types';

export const DURATION_LABELS: Record<string, string> = {
  '120': '2 hours',
  '90': '1.5 hours',
  '60': '1 hour',
  '30': '30 min',
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const getTrafficLight = (available: number, total: number) => {
  if (available === 0) return 'full';
  const percentage = (available / total) * 100;
  if (percentage <= 25) return 'critical';
  if (percentage <= 50) return 'low';
  return 'high';
};

export const calculateTotalAvailable = (counts: DurationCounts) => {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
};

// Open Instagram profile: prefer app deep-link on mobile, fallback to web
export const openInstagram = (username: string) => {
  if (!username) return;
  const iosUrl = `instagram://user?username=${username}`;
  const androidIntent = `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end`;
  const webUrl = `https://instagram.com/${username}`;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';

  try {
    if (/android/i.test(ua)) {
      window.location.href = androidIntent;
      setTimeout(() => { window.location.href = webUrl; }, 1200);
      return;
    }

    if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) {
      window.location.href = iosUrl;
      setTimeout(() => { window.location.href = webUrl; }, 1200);
      return;
    }

    // Desktop / unknown: open web in new tab
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  } catch (err) {
    // Fallback to web
    try { window.open(webUrl, '_blank', 'noopener,noreferrer'); } catch {}
  }
};
