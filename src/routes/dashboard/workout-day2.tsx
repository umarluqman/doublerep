import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export const Route = createFileRoute('/dashboard/workout-day2')({
  component: WorkoutDay2,
});

interface SetData {
  reps: number;
  completed: boolean;
}

function WorkoutDay2() {
  const { user } = Route.useRouteContext();
  // TODO: Get target reps from last Day 1 workout
  const targetReps = 4; // Placeholder
  const [sets, setSets] = useState<SetData[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60); // 1 minute
  const [notes, setNotes] = useState('');

  const addSet = () => {
    const reps = Number.parseInt(currentReps);
    if (!reps || reps < 1) return;

    const completed = reps >= targetReps;
    setSets([...sets, { reps, completed }]);
    setCurrentReps('');

    if (currentSet < 10) {
      setCurrentSet(currentSet + 1);
      setIsResting(true);
      setRestTimer(60);
      startRestTimer();
    }
  };

  const startRestTimer = () => {
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          return 60;
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

  const allSetsCompleted = sets.length === 10 && sets.every((s) => s.completed);
  const completedCount = sets.filter((s) => s.completed).length;

  const handleComplete = async () => {
    // TODO: Save workout to Convex
    console.log('Workout completed:', { sets, targetReps, notes });
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
        <h1 className="font-bold text-3xl mt-2">Day 2: Volume Work</h1>
        <p className="text-muted-foreground mt-1">
          10 sets of {targetReps} reps with 1 minute rest
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>• Perform 10 sets of {targetReps} reps</li>
          <li>• Rest exactly 1 minute between sets</li>
          <li>• Maintain strict form throughout</li>
          <li>• When you complete all 10 sets, increase by 1 rep next time</li>
        </ul>
      </div>

      {/* Progress Overview */}
      {sets.length > 0 && (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Progress</h3>
            <span className="text-muted-foreground text-sm">
              {completedCount}/10 sets at target
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, idx) => {
              const set = sets[idx];
              return (
                <div
                  key={idx}
                  className={`h-8 rounded ${
                    !set
                      ? 'bg-muted'
                      : set.completed
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                  }`}
                  title={
                    set
                      ? `Set ${idx + 1}: ${set.reps} reps`
                      : `Set ${idx + 1}: Not completed`
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Sets */}
      {sets.length > 0 && sets.length < 10 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Completed Sets:</h3>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-center ${
                  set.completed ? 'border-green-500' : 'border-yellow-500'
                }`}
              >
                <div className="text-muted-foreground text-xs">Set {idx + 1}</div>
                <div className="text-xl font-bold">{set.reps}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Set Input */}
      {sets.length < 10 && !isResting && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h3 className="font-semibold text-xl mb-4">
            Set {currentSet} of 10
          </h3>
          <p className="text-muted-foreground mb-4">Target: {targetReps} reps</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reps">Reps Completed</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)}
                placeholder={`Target: ${targetReps}`}
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
            1 minute rest before next set
          </p>
          <Button
            onClick={() => {
              setIsResting(false);
              setRestTimer(60);
            }}
            variant="outline"
            className="mt-4"
          >
            Skip Rest
          </Button>
        </div>
      )}

      {/* Complete Workout */}
      {sets.length === 10 && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <div>
            <h3 className="font-semibold text-xl">Workout Complete!</h3>
            <p className="text-muted-foreground mt-1">
              {allSetsCompleted
                ? `Perfect! You completed all 10 sets at ${targetReps} reps. Next time, aim for ${targetReps + 1} reps!`
                : `You completed ${completedCount}/10 sets at target. Keep working!`}
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
