# SOP-304: Progressive Web App (PWA) Setup

## Purpose

Configure a Next.js application as an installable Progressive Web App with offline capabilities, push notifications, and mobile-optimized UX. This SOP ensures mobile users get a native-like experience while maintaining a single codebase.

> **Note:** This SOP is **optional**. Skip if your project doesn't require mobile/PWA functionality.

## Scope

- **Covers:** Service workers, web manifest, offline strategies, install prompts, push notifications, mobile UI patterns, native API access, mobile performance
- **Does not cover:** React Native or Capacitor native builds (separate toolchain)

## Prerequisites

- [ ] SOP-003 (Project Structure) — base project exists
- [ ] SOP-300 (Component Architecture) — component system in place
- [ ] SOP-301 (Styling Standards) — responsive foundation ready

## Procedure

### 1. Install PWA Dependencies

```bash
# Using Serwist (modern next-pwa alternative)
pnpm add @serwist/next

# Or using next-pwa (legacy but stable)
pnpm add next-pwa
```

### 2. Configure Next.js for PWA

Create or update `next.config.ts`:

```typescript
// next.config.ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // your existing config
};

export default withSerwist(nextConfig);
```

### 3. Create Service Worker

```typescript
// src/sw.ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

### 4. Create Web App Manifest

```json
// public/manifest.json
{
  "name": "Your App Name",
  "short_name": "AppName",
  "description": "Your app description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["productivity", "utilities"],
  "shortcuts": [
    {
      "name": "Quick Action",
      "url": "/quick-action",
      "icons": [{ "src": "/icons/shortcut.png", "sizes": "96x96" }]
    }
  ]
}
```

### 5. Add Manifest to Layout

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Your App Name",
  },
  formatDetection: {
    telephone: false,
  },
};
```

### 6. Create PWA Install Prompt Hook

```typescript
// src/hooks/use-pwa-install.ts
"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = 
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setInstallPrompt(null);
    return outcome === "accepted";
  };

  return { isInstallable, isInstalled, install };
}
```

### 7. Offline Caching Strategies

```typescript
// src/lib/cache-strategies.ts
import type { RuntimeCaching } from "serwist";

export const cacheStrategies: RuntimeCaching[] = [
  // API calls - Network first, fall back to cache
  {
    urlPattern: /^https:\/\/api\./,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
      networkTimeoutSeconds: 10,
    },
  },
  // Images - Cache first
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: "CacheFirst",
    options: {
      cacheName: "image-cache",
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
    },
  },
  // Static assets - Stale while revalidate
  {
    urlPattern: /\.(?:js|css|woff2?)$/,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-cache",
    },
  },
  // Pages - Network first with offline fallback
  {
    urlPattern: ({ request }) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-cache",
      networkTimeoutSeconds: 5,
    },
  },
];
```

### 8. Offline Fallback Page

```tsx
// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">📡</div>
        <h1 className="mb-2 text-2xl font-bold">You're Offline</h1>
        <p className="mb-4 text-muted-foreground">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

### 9. Mobile UI Patterns

#### Bottom Navigation

```tsx
// src/components/navigation/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/add", icon: PlusCircle, label: "Add" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="flex h-16 items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                "min-w-[64px] min-h-[48px]", // Touch target size
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

#### Pull-to-Refresh

```tsx
// src/hooks/use-pull-to-refresh.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const diff = endY - startY.current;

      if (diff > 100 && container.scrollTop === 0) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);

  return { isRefreshing, containerRef };
}
```

#### Swipe Actions

```tsx
// src/components/ui/swipeable-row.tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    setOffset(Math.max(-threshold, Math.min(threshold, diff)));
  };

  const handleTouchEnd = () => {
    if (offset > threshold / 2 && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -threshold / 2 && onSwipeLeft) {
      onSwipeLeft();
    }
    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      <div className="absolute inset-0 flex justify-between">
        <div className="flex items-center bg-green-500 px-4">
          {rightAction}
        </div>
        <div className="flex items-center bg-red-500 px-4">
          {leftAction}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative bg-background transition-transform",
          offset === 0 && "duration-200"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
```

### 10. Native API Access

#### Geolocation

```typescript
// src/hooks/use-geolocation.ts
"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((s) => ({
          ...s,
          error: error.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, getLocation };
}
```

#### Camera/Barcode Scanner

```typescript
// src/hooks/use-camera.ts
"use client";

import { useRef, useCallback, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facingMode: "user" | "environment" = "environment") => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL("image/jpeg");
  }, []);

  return { videoRef, startCamera, stopCamera, capturePhoto, error };
}
```

#### Share API

```typescript
// src/lib/share.ts
export async function shareContent(data: {
  title: string;
  text?: string;
  url?: string;
}) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard
  const shareText = `${data.title}\n${data.text || ""}\n${data.url || ""}`;
  await navigator.clipboard.writeText(shareText.trim());
  return true;
}
```

### 11. Push Notifications

```typescript
// src/lib/notifications.ts
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  // Send subscription to your server
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  return subscription;
}
```

### 12. Mobile Performance Checklist

```typescript
// Add to next.config.ts for bundle analysis
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
```

**Performance targets for mobile:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total bundle size: < 200KB (gzipped)

---

## Review Checklist

### Manifest & Installation
- [ ] `manifest.json` with all required fields
- [ ] App icons (192x192 and 512x512 minimum)
- [ ] Maskable icons for Android
- [ ] Apple touch icons for iOS
- [ ] Install prompt handled gracefully

### Service Worker
- [ ] Service worker registered
- [ ] Precaching for critical assets
- [ ] Runtime caching strategies defined
- [ ] Offline fallback page exists

### Mobile UX
- [ ] Touch targets ≥ 48x48px
- [ ] Bottom navigation for primary actions
- [ ] Safe area insets handled (`pb-safe`, `pt-safe`)
- [ ] No horizontal scroll
- [ ] Pull-to-refresh where appropriate
- [ ] Swipe gestures for common actions

### Performance
- [ ] Bundle size analyzed
- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] Lighthouse PWA score ≥ 90

### Native Features
- [ ] Geolocation permission handling
- [ ] Camera access with fallbacks
- [ ] Share API with clipboard fallback
- [ ] Push notification opt-in flow

---

## AI Agent Prompt Template

```markdown
Execute SOP-304 (Progressive Web App Setup):

**Project Context:**
- App name: {name}
- Primary mobile features needed: {list features like offline, camera, location, push}
- Target platforms: {iOS Safari, Android Chrome, both}

**Requirements:**
1. Configure Serwist/next-pwa for service worker
2. Create manifest.json with proper icons
3. Set up offline caching strategy for: {API calls, images, pages}
4. Implement mobile UI patterns: {bottom nav, pull-to-refresh, swipe actions}
5. Add native API hooks for: {geolocation, camera, share}
6. Create install prompt component
7. Set up push notification infrastructure (if needed)

**Deliverables:**
- [ ] next.config.ts with PWA configuration
- [ ] public/manifest.json
- [ ] src/sw.ts service worker
- [ ] src/app/offline/page.tsx
- [ ] src/hooks/use-pwa-install.ts
- [ ] src/components/navigation/bottom-nav.tsx
- [ ] Native API hooks as needed
- [ ] Lighthouse PWA audit passing
```

---

## Outputs

After completing this SOP, you should have:

1. **PWA Configuration** — Service worker, manifest, icons
2. **Offline Support** — Caching strategies, fallback page
3. **Mobile Components** — Bottom nav, swipe actions, pull-to-refresh
4. **Native Hooks** — Geolocation, camera, share, notifications
5. **Install Flow** — Prompt handling, iOS instructions

---

## Related SOPs

- **SOP-300:** Component Architecture (component patterns)
- **SOP-301:** Styling Standards (responsive design)
- **SOP-302:** API Integration (offline data sync)
- **SOP-602:** Monitoring (PWA-specific metrics)
