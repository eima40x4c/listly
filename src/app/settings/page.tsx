/**
 * Settings Screen
 *
 * Wireframe §12: Settings with Account, App Settings
 * (including Dark Mode toggle, Haptic Feedback, Currency with EGP),
 * Data & Privacy, About sections.
 * Wired to Zustand useSettingsStore for persistent preferences.
 */

'use client';

import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  MapPin,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useComingSoon } from '@/hooks/useComingSoon';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores';
import type { Currency } from '@/stores/useSettingsStore';

function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  destructive = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  action?: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      className={cn(
        'flex w-full items-center justify-between px-4 py-3 text-left',
        onClick && 'transition-colors hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            'h-5 w-5',
            destructive ? 'text-destructive' : 'text-muted-foreground'
          )}
        />
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              destructive && 'text-destructive'
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </Wrapper>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: '$ USD — US Dollar' },
  { value: 'EUR', label: '€ EUR — Euro' },
  { value: 'GBP', label: '£ GBP — British Pound' },
  { value: 'CAD', label: '$ CAD — Canadian Dollar' },
  { value: 'AUD', label: '$ AUD — Australian Dollar' },
  { value: 'EGP', label: 'E£ EGP — Egyptian Pound' },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { showComingSoon } = useComingSoon();

  const {
    currency,
    setCurrency,
    notificationsEnabled,
    setNotificationsEnabled,
    locationEnabled,
    setLocationEnabled,
    hapticEnabled,
    setHapticEnabled,
  } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  const handleLocationToggle = (enabled: boolean) => {
    if (enabled) {
      showComingSoon('Store Locations');
    } else {
      setLocationEnabled(false);
    }
  };

  return (
    <AppShell>
      <Container className="py-6">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>

        {/* Account Section */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b px-4 py-4">
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || 'User'}
                size="md"
              />
              <div className="flex-1">
                <p className="font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <SettingRow icon={User} label="Edit Profile" />
            <SettingRow
              icon={Shield}
              label="Linked Accounts"
              description="Google"
            />
          </Card>
        </div>

        {/* App Settings */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            App Settings
          </h2>
          <Card>
            {/* Dark Mode */}
            <SettingRow
              icon={isDark ? Moon : Sun}
              label="Dark Mode"
              description={mounted ? (isDark ? 'On' : 'Off') : 'Loading...'}
              action={
                <ToggleSwitch
                  checked={isDark}
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  label="Toggle dark mode"
                />
              }
            />

            {/* Notifications */}
            <SettingRow
              icon={Bell}
              label="Notifications"
              description={notificationsEnabled ? 'Enabled' : 'Disabled'}
              action={
                <ToggleSwitch
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                  label="Toggle notifications"
                />
              }
            />

            {/* Haptic Feedback */}
            <SettingRow
              icon={Smartphone}
              label="Haptic Feedback"
              description="Vibration on actions (mobile)"
              action={
                <ToggleSwitch
                  checked={hapticEnabled}
                  onChange={setHapticEnabled}
                  label="Toggle haptic feedback"
                />
              }
            />

            {/* Location Services */}
            <SettingRow
              icon={MapPin}
              label="Store Locations"
              description={locationEnabled ? 'Enabled' : 'Disabled'}
              action={
                <ToggleSwitch
                  checked={locationEnabled}
                  onChange={handleLocationToggle}
                  label="Toggle location services"
                />
              }
            />

            {/* Currency — using CustomSelect */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <CustomSelect
                    label="Currency"
                    options={CURRENCY_OPTIONS}
                    value={currency}
                    onChange={(val) => setCurrency(val as Currency)}
                    id="currency-select"
                  />
                </div>
              </div>
            </div>

            <SettingRow
              icon={Palette}
              label="Appearance"
              description="System default"
            />
          </Card>
        </div>

        {/* Data & Privacy */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data & Privacy
          </h2>
          <Card className="overflow-hidden">
            <SettingRow icon={Shield} label="Privacy Policy" />
            <SettingRow icon={Globe} label="Terms of Service" />
            <SettingRow
              icon={Globe}
              label="Export Data"
              onClick={() => showComingSoon('Data Export')}
            />
            <SettingRow icon={Trash2} label="Delete Account" destructive />
          </Card>
        </div>

        {/* About */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <Card className="overflow-hidden">
            <SettingRow icon={HelpCircle} label="Help & Support" />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm text-muted-foreground">0.1.0</span>
            </div>
          </Card>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </Container>
    </AppShell>
  );
}
