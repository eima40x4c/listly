/**
 * Budget & Spending History Screen
 *
 * Wireframe §11: Budget overview with date range selector,
 * spending summary, monthly budget, category breakdown.
 * Uses mock data until backend API routes are built.
 */

'use client';

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores';

// --- Mock Data ---
const DATE_RANGES = [
  'This Week',
  'This Month',
  'Last Month',
  'Custom',
] as const;

interface CategorySpend {
  name: string;
  emoji: string;
  spent: number;
  budget: number;
  color: string;
}

interface Transaction {
  id: string;
  store: string;
  date: string;
  total: number;
  items: number;
}

const mockSummary = {
  totalSpent: 342.58,
  monthlyBudget: 500,
  avgPerTrip: 57.1,
  tripsThisMonth: 6,
  vsLastMonth: -12.3,
};

const mockCategories: CategorySpend[] = [
  {
    name: 'Produce',
    emoji: '🥬',
    spent: 89.5,
    budget: 120,
    color: 'bg-green-500',
  },
  {
    name: 'Dairy',
    emoji: '🧀',
    spent: 52.0,
    budget: 60,
    color: 'bg-yellow-500',
  },
  { name: 'Meat', emoji: '🥩', spent: 78.2, budget: 80, color: 'bg-red-500' },
  {
    name: 'Pantry',
    emoji: '🥫',
    spent: 45.3,
    budget: 100,
    color: 'bg-orange-500',
  },
  {
    name: 'Snacks',
    emoji: '🍿',
    spent: 31.5,
    budget: 40,
    color: 'bg-purple-500',
  },
  {
    name: 'Beverages',
    emoji: '🥤',
    spent: 46.08,
    budget: 50,
    color: 'bg-blue-500',
  },
];

const mockTransactions: Transaction[] = [
  { id: '1', store: 'Whole Foods', date: 'Feb 10', total: 72.45, items: 12 },
  { id: '2', store: 'Costco', date: 'Feb 8', total: 124.3, items: 18 },
  { id: '3', store: "Trader Joe's", date: 'Feb 5', total: 58.2, items: 9 },
  { id: '4', store: 'Target', date: 'Feb 3', total: 35.8, items: 5 },
  { id: '5', store: 'Aldi', date: 'Feb 1', total: 51.83, items: 14 },
];

function ProgressBar({
  value,
  max,
  colorClass,
}: {
  value: number;
  max: number;
  colorClass: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          isOver ? 'animate-pulse-warning bg-destructive' : colorClass
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function BudgetPage() {
  const [dateRange, setDateRange] = useState<string>('This Month');
  const { currency } = useSettingsStore();

  const currencySymbol = getCurrencySymbol(currency);
  const budgetPercentage =
    (mockSummary.totalSpent / mockSummary.monthlyBudget) * 100;

  return (
    <AppShell>
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Budget</h1>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CustomSelect
              options={DATE_RANGES.map((r) => ({ value: r, label: r }))}
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              className="w-40"
            />
          </div>
        </div>

        {/* Spending Summary Card */}
        <Card className="mb-6 p-5">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {currencySymbol}
                {mockSummary.totalSpent.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {currencySymbol}
                {mockSummary.monthlyBudget}
              </span>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mb-3">
            <ProgressBar
              value={mockSummary.totalSpent}
              max={mockSummary.monthlyBudget}
              colorClass="bg-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{budgetPercentage.toFixed(0)}% used</span>
              <span>
                {currencySymbol}
                {(mockSummary.monthlyBudget - mockSummary.totalSpent).toFixed(
                  2
                )}{' '}
                remaining
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {currencySymbol}
                {mockSummary.avgPerTrip.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Avg per trip</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {mockSummary.tripsThisMonth}
              </p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {mockSummary.vsLastMonth < 0 ? (
                  <ArrowDown className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-red-500" />
                )}
                <p
                  className={cn(
                    'text-lg font-semibold',
                    mockSummary.vsLastMonth < 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                >
                  {Math.abs(mockSummary.vsLastMonth)}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              By Category
            </h2>
          </div>
          <div className="space-y-4">
            {mockCategories.map((cat) => (
              <div key={cat.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {currencySymbol}
                    {cat.spent.toFixed(2)} / {currencySymbol}
                    {cat.budget}
                  </span>
                </div>
                <ProgressBar
                  value={cat.spent}
                  max={cat.budget}
                  colorClass={cat.color}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Trips
            </h2>
          </div>
          <div className="space-y-2">
            {mockTransactions.map((tx) => (
              <Card
                key={tx.id}
                className="flex items-center justify-between p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{tx.store}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.date} · {tx.items} items
                  </p>
                </div>
                <span className="font-semibold">
                  {currencySymbol}
                  {tx.total.toFixed(2)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
