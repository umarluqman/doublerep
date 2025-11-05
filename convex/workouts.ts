import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Log a Day 1 workout (Max Effort Sets)
export const logDay1Workout = mutation({
  args: {
    userId: v.id('users'),
    userProgramId: v.id('userPrograms'),
    weekNumber: v.number(),
    sets: v.array(v.object({
      reps: v.number(),
      restSeconds: v.optional(v.number()),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workoutId = await ctx.db.insert('workouts', {
      userId: args.userId,
      userProgramId: args.userProgramId,
      weekNumber: args.weekNumber,
      dayType: 'day1',
      workoutDate: Date.now(),
      completed: true,
      maxEffortSets: args.sets,
      notes: args.notes,
    });

    return workoutId;
  },
});

// Log a Day 2 workout (Volume Work)
export const logDay2Workout = mutation({
  args: {
    userId: v.id('users'),
    userProgramId: v.id('userPrograms'),
    weekNumber: v.number(),
    targetReps: v.number(),
    sets: v.array(v.object({
      reps: v.number(),
      completed: v.boolean(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workoutId = await ctx.db.insert('workouts', {
      userId: args.userId,
      userProgramId: args.userProgramId,
      weekNumber: args.weekNumber,
      dayType: 'day2',
      workoutDate: Date.now(),
      completed: true,
      volumeTargetReps: args.targetReps,
      volumeSets: args.sets,
      notes: args.notes,
    });

    return workoutId;
  },
});

// Log a Day 3 workout (Ladders)
export const logDay3Workout = mutation({
  args: {
    userId: v.id('users'),
    userProgramId: v.id('userPrograms'),
    weekNumber: v.number(),
    ladders: v.array(v.object({
      rungs: v.array(v.number()),
      totalReps: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workoutId = await ctx.db.insert('workouts', {
      userId: args.userId,
      userProgramId: args.userProgramId,
      weekNumber: args.weekNumber,
      dayType: 'day3',
      workoutDate: Date.now(),
      completed: true,
      ladders: args.ladders,
      notes: args.notes,
    });

    return workoutId;
  },
});

// Get all workouts for a program
export const getWorkoutsByProgram = query({
  args: { programId: v.id('userPrograms') },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect();

    return workouts.sort((a, b) => b.workoutDate - a.workoutDate);
  },
});

// Get workouts for specific week
export const getWorkoutsByWeek = query({
  args: {
    programId: v.id('userPrograms'),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const allWorkouts = await ctx.db
      .query('workouts')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect();

    return allWorkouts
      .filter((w) => w.weekNumber === args.weekNumber)
      .sort((a, b) => a.workoutDate - b.workoutDate);
  },
});

// Get the most recent Day 1 workout (for Day 2 target calculation)
export const getMostRecentDay1 = query({
  args: { programId: v.id('userPrograms') },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect();

    const day1Workouts = workouts
      .filter((w) => w.dayType === 'day1')
      .sort((a, b) => b.workoutDate - a.workoutDate);

    return day1Workouts[0] || null;
  },
});

// Get suggested next workout type
export const getNextWorkoutSuggestion = query({
  args: {
    programId: v.id('userPrograms'),
    currentWeek: v.number(),
  },
  handler: async (ctx, args) => {
    const weekWorkouts = await ctx.db
      .query('workouts')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect();

    const thisWeekWorkouts = weekWorkouts
      .filter((w) => w.weekNumber === args.currentWeek)
      .sort((a, b) => a.workoutDate - b.workoutDate);

    // Determine next workout type based on what's been done this week
    const completedTypes = thisWeekWorkouts.map((w) => w.dayType);

    if (!completedTypes.includes('day1')) {
      return { nextType: 'day1' as const, description: 'Max Effort Sets' };
    }
    if (!completedTypes.includes('day2')) {
      return { nextType: 'day2' as const, description: 'Volume Work' };
    }
    if (!completedTypes.includes('day3')) {
      return { nextType: 'day3' as const, description: 'Ladders' };
    }

    return { nextType: null, description: 'Week complete! Time for rest or move to next week.' };
  },
});

// Calculate Day 2 target reps based on most recent Day 1
export const calculateDay2Target = query({
  args: { programId: v.id('userPrograms') },
  handler: async (ctx, args) => {
    const day1Workout = await ctx.db
      .query('workouts')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect()
      .then((workouts) =>
        workouts
          .filter((w) => w.dayType === 'day1' && w.maxEffortSets)
          .sort((a, b) => b.workoutDate - a.workoutDate)[0]
      );

    if (!day1Workout || !day1Workout.maxEffortSets) {
      return null;
    }

    // Find the best set from Day 1
    const bestSet = Math.max(...day1Workout.maxEffortSets.map((s) => s.reps));
    const targetReps = Math.floor(bestSet / 2);

    return {
      bestDay1Set: bestSet,
      targetReps,
      totalSets: 10,
    };
  },
});
