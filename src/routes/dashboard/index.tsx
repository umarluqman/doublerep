import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '../../../convex/_generated/api';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user, convexClient } = Route.useRouteContext();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialMax, setInitialMax] = useState('');

  // Check if user exists in Convex database
  const { data: convexUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // We'll need to create a query to get user by email
      return null; // Placeholder
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>Please log in to access the dashboard.</p>
        <Button asChild>
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your pull-up progression and build strength
        </p>
      </div>

      {/* Onboarding Section */}
      {!showOnboarding ? (
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-2xl">Get Started</h2>
              <p className="text-muted-foreground mt-2">
                Start your 8-week pull-up progression program
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Program Overview</h3>
                <ul className="mt-2 space-y-2 text-muted-foreground text-sm">
                  <li>• 3 workouts per week (Mon/Wed/Fri)</li>
                  <li>• 8 weeks total duration</li>
                  <li>• 50-100% increase in max pull-ups</li>
                  <li>• Best for 5-12 current max</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Workout Types</h3>
                <ul className="mt-2 space-y-2 text-muted-foreground text-sm">
                  <li>• Day 1: Max Effort Sets</li>
                  <li>• Day 2: Volume Work</li>
                  <li>• Day 3: Ladders</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setShowOnboarding(true)}
              size="lg"
              className="w-full sm:w-auto"
            >
              Start Program
            </Button>
          </div>
        </div>
      ) : (
        <OnboardingForm
          initialMax={initialMax}
          setInitialMax={setInitialMax}
          userId={user.id}
          onComplete={() => {
            setShowOnboarding(false);
            // Refresh data
          }}
        />
      )}

      {/* Quick Start Workouts */}
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="font-semibold text-xl mb-4">Start a Workout</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/dashboard/workout-day1"
            className="rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Day 1</h3>
            <p className="text-muted-foreground text-sm mb-2">Max Effort Sets</p>
            <p className="text-xs">3 sets to failure</p>
          </Link>
          <Link
            to="/dashboard/workout-day2"
            className="rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Day 2</h3>
            <p className="text-muted-foreground text-sm mb-2">Volume Work</p>
            <p className="text-xs">10 sets at target reps</p>
          </Link>
          <Link
            to="/dashboard/workout-day3"
            className="rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Day 3</h3>
            <p className="text-muted-foreground text-sm mb-2">Ladders</p>
            <p className="text-xs">5 ascending ladders</p>
          </Link>
        </div>
      </div>

      {/* Program Info */}
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="font-semibold text-xl mb-4">How It Works</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Day 1: Max Effort Sets</h3>
            <p className="text-muted-foreground text-sm">
              Perform 3 sets to technical failure with 5+ minutes rest between sets.
              This establishes your baseline and tracks progress.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Day 2: Volume Work</h3>
            <p className="text-muted-foreground text-sm">
              Complete 10 sets of 50% of your best Day 1 set with 1 minute rest.
              Build endurance and work capacity.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Day 3: Ladders</h3>
            <p className="text-muted-foreground text-sm">
              5 ladders starting at 1 rep, ascending until failure. 30 seconds rest
              between rungs. Develops strength-endurance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OnboardingFormProps {
  initialMax: string;
  setInitialMax: (value: string) => void;
  userId: string;
  onComplete: () => void;
}

function OnboardingForm({
  initialMax,
  setInitialMax,
  userId,
  onComplete,
}: OnboardingFormProps) {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxPullups = Number.parseInt(initialMax);

    if (!maxPullups || maxPullups < 1) {
      setError('Please enter a valid number');
      return;
    }

    if (maxPullups > 50) {
      setError('Please enter a realistic number (1-50)');
      return;
    }

    // TODO: Create program mutation
    console.log('Starting program with max:', maxPullups);
    onComplete();
  };

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="font-semibold text-2xl">Set Your Starting Point</h2>
          <p className="text-muted-foreground mt-2">
            How many pull-ups can you currently do in one set?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPullups">Current Max Pull-ups</Label>
          <Input
            id="maxPullups"
            type="number"
            min="1"
            max="50"
            value={initialMax}
            onChange={(e) => {
              setInitialMax(e.target.value);
              setError('');
            }}
            placeholder="e.g., 8"
            className="max-w-xs"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-muted-foreground text-sm">
            Enter the maximum number of strict pull-ups you can perform with good form
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="lg">
            Start Program
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onComplete}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
