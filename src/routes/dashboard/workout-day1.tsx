import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export const Route = createFileRoute('/dashboard/workout-day1')({
  component: WorkoutDay1,
});

interface SetData {
  reps: number;
  restSeconds?: number;
}

function WorkoutDay1() {
  const { user } = Route.useRouteContext();
  const [sets, setSets] = useState<SetData[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(300); // 5 minutes in seconds
  const [notes, setNotes] = useState('');

  const addSet = () => {
    const reps = Number.parseInt(currentReps);
    if (!reps || reps < 1) return;

    setSets([...sets, { reps }]);
    setCurrentReps('');

    if (currentSet < 3) {
      setCurrentSet(currentSet + 1);
      setIsResting(true);
      setRestTimer(300);
      startRestTimer();
    }
  };

  const startRestTimer = () => {
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    // TODO: Save workout to Convex
    console.log('Workout completed:', { sets, notes });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="font-bold text-3xl mt-2">Day 1: Max Effort Sets</h1>
        <p className="text-muted-foreground mt-1">
          Perform 3 sets to technical failure with 5+ minutes rest
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>• Perform as many pull-ups as possible with strict form</li>
          <li>• Stop when your technique starts to break down</li>
          <li>• Rest at least 5 minutes between sets</li>
          <li>• Complete 3 sets total</li>
        </ul>
      </div>

      {/* Completed Sets */}
      {sets.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Completed Sets:</h3>
          <div className="space-y-2">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">Set {idx + 1}</span>
                <span className="text-2xl font-bold">{set.reps} reps</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Set Input */}
      {sets.length < 3 && !isResting && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h3 className="font-semibold text-xl mb-4">
            Set {currentSet} of 3
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reps">Reps Completed</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)}
                placeholder="Enter reps"
                className="max-w-xs mt-1"
              />
            </div>
            <Button onClick={addSet} size="lg" disabled={!currentReps}>
              Record Set
            </Button>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {isResting && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground text-center">
          <h3 className="font-semibold text-xl mb-2">Rest Period</h3>
          <div className="font-mono text-6xl font-bold my-4">
            {formatTime(restTimer)}
          </div>
          <p className="text-muted-foreground">
            Take at least 5 minutes rest before your next set
          </p>
          <Button
            onClick={() => {
              setIsResting(false);
              setRestTimer(300);
            }}
            variant="outline"
            className="mt-4"
          >
            Skip Rest
          </Button>
        </div>
      )}

      {/* Complete Workout */}
      {sets.length === 3 && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <div>
            <h3 className="font-semibold text-xl">Workout Complete!</h3>
            <p className="text-muted-foreground mt-1">
              Great job! Your best set: {Math.max(...sets.map((s) => s.reps))} reps
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel?"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleComplete} size="lg">
              Save Workout
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
