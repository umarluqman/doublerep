import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export const Route = createFileRoute('/dashboard/workout-day3')({
  component: WorkoutDay3,
});

interface Ladder {
  rungs: number[];
  totalReps: number;
}

function WorkoutDay3() {
  const { user } = Route.useRouteContext();
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [currentLadder, setCurrentLadder] = useState<number[]>([]);
  const [currentRung, setCurrentRung] = useState(1);
  const [currentReps, setCurrentReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(30);
  const [notes, setNotes] = useState('');

  const addRung = () => {
    const reps = Number.parseInt(currentReps);
    if (!reps || reps < 1) return;

    const newLadder = [...currentLadder, reps];
    setCurrentLadder(newLadder);
    setCurrentReps('');

    // Check if we should continue or start new ladder
    const previousRung = currentLadder[currentLadder.length - 1] || 0;
    if (reps <= previousRung) {
      // Failed to exceed previous rung, complete this ladder
      completeLadder(newLadder);
    } else {
      // Continue ladder
      setCurrentRung(currentRung + 1);
      setIsResting(true);
      setRestTimer(30);
      startRestTimer();
    }
  };

  const completeLadder = (ladder: number[]) => {
    const totalReps = ladder.reduce((sum, reps) => sum + reps, 0);
    setLadders([...ladders, { rungs: ladder, totalReps }]);
    setCurrentLadder([]);
    setCurrentRung(1);

    if (ladders.length < 4) {
      // Start rest before next ladder
      setIsResting(true);
      setRestTimer(30);
      startRestTimer();
    }
  };

  const skipCurrentLadder = () => {
    if (currentLadder.length > 0) {
      completeLadder(currentLadder);
    }
  };

  const startRestTimer = () => {
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const totalRepsCompleted = ladders.reduce((sum, l) => sum + l.totalReps, 0);
  const workoutComplete = ladders.length === 5;

  const handleComplete = async () => {
    // TODO: Save workout to Convex
    console.log('Workout completed:', { ladders, notes });
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
        <h1 className="font-bold text-3xl mt-2">Day 3: Ladders</h1>
        <p className="text-muted-foreground mt-1">
          5 ladders with 30 second rest between rungs
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>• Start each ladder at 1 rep</li>
          <li>• Increase by 1 rep each rung (1, 2, 3, 4...)</li>
          <li>• Continue until you can't exceed the previous rung</li>
          <li>• Rest 30 seconds between each rung</li>
          <li>• Complete 5 ladders total</li>
        </ul>
      </div>

      {/* Progress Overview */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Progress</h3>
            <p className="text-muted-foreground text-sm">
              Ladder {ladders.length + 1} of 5
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalRepsCompleted}</div>
            <p className="text-muted-foreground text-sm">Total Reps</p>
          </div>
        </div>
      </div>

      {/* Completed Ladders */}
      {ladders.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Completed Ladders:</h3>
          <div className="space-y-2">
            {ladders.map((ladder, idx) => (
              <div
                key={idx}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Ladder {idx + 1}</span>
                  <span className="text-muted-foreground text-sm">
                    {ladder.totalReps} total reps
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ladder.rungs.map((reps, rungIdx) => (
                    <span
                      key={rungIdx}
                      className="bg-primary/10 px-2 py-1 rounded text-sm"
                    >
                      {reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Ladder */}
      {!workoutComplete && currentLadder.length > 0 && (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <h3 className="font-semibold mb-2">
            Current Ladder (Ladder {ladders.length + 1})
          </h3>
          <div className="flex flex-wrap gap-1">
            {currentLadder.map((reps, idx) => (
              <span
                key={idx}
                className="bg-primary px-2 py-1 rounded text-sm text-primary-foreground"
              >
                {reps}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Rung Input */}
      {!workoutComplete && !isResting && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h3 className="font-semibold text-xl mb-4">
            Ladder {ladders.length + 1}, Rung {currentRung}
          </h3>
          <p className="text-muted-foreground mb-4">
            {currentLadder.length === 0
              ? 'Start with 1 rep'
              : `Try to beat ${currentLadder[currentLadder.length - 1]} reps`}
          </p>
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
            <div className="flex gap-2">
              <Button onClick={addRung} size="lg" disabled={!currentReps}>
                Record Rung
              </Button>
              {currentLadder.length > 0 && (
                <Button
                  onClick={skipCurrentLadder}
                  variant="outline"
                  size="lg"
                >
                  End Ladder
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {isResting && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground text-center">
          <h3 className="font-semibold text-xl mb-2">Rest Period</h3>
          <div className="font-mono text-6xl font-bold my-4">
            0:{restTimer.toString().padStart(2, '0')}
          </div>
          <p className="text-muted-foreground">
            30 seconds rest
          </p>
          <Button
            onClick={() => {
              setIsResting(false);
              setRestTimer(30);
            }}
            variant="outline"
            className="mt-4"
          >
            Skip Rest
          </Button>
        </div>
      )}

      {/* Complete Workout */}
      {workoutComplete && (
        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <div>
            <h3 className="font-semibold text-xl">Workout Complete!</h3>
            <p className="text-muted-foreground mt-1">
              Great work! You completed {totalRepsCompleted} total reps across 5 ladders.
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
