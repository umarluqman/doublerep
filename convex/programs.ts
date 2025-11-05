import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Start a new pull-up progression program
export const startProgram = mutation({
  args: {
    userId: v.id('users'),
    initialMaxPullups: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, initialMaxPullups } = args;

    // Check if user already has an active program
    const existingProgram = await ctx.db
      .query('userPrograms')
      .withIndex('by_user_and_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .first();

    if (existingProgram) {
      throw new Error('User already has an active program');
    }

    // Update user's initial max
    await ctx.db.patch(userId, {
      initialMaxPullups,
      currentMaxPullups: initialMaxPullups,
    });

    // Create new program
    const programId = await ctx.db.insert('userPrograms', {
      userId,
      programType: 'pullup-progression',
      startDate: Date.now(),
      currentWeek: 1,
      status: 'active',
      targetMaxPullups: Math.floor(initialMaxPullups * 1.5), // 50% increase goal
    });

    // Create initial progress snapshot
    await ctx.db.insert('progressSnapshots', {
      userId,
      userProgramId: programId,
      weekNumber: 0,
      maxPullups: initialMaxPullups,
      snapshotDate: Date.now(),
      notes: 'Program started',
    });

    return programId;
  },
});

// Get user's active program
export const getActiveProgram = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const program = await ctx.db
      .query('userPrograms')
      .withIndex('by_user_and_status', (q) => q.eq('userId', args.userId).eq('status', 'active'))
      .first();

    return program;
  },
});

// Update current week
export const updateProgramWeek = mutation({
  args: {
    programId: v.id('userPrograms'),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.programId, {
      currentWeek: args.weekNumber,
    });
  },
});

// Complete a program
export const completeProgram = mutation({
  args: {
    programId: v.id('userPrograms'),
    finalMaxPullups: v.number(),
  },
  handler: async (ctx, args) => {
    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error('Program not found');

    await ctx.db.patch(args.programId, {
      status: 'completed',
    });

    // Update user's current max
    await ctx.db.patch(program.userId, {
      currentMaxPullups: args.finalMaxPullups,
    });

    // Create final progress snapshot
    await ctx.db.insert('progressSnapshots', {
      userId: program.userId,
      userProgramId: args.programId,
      weekNumber: 8,
      maxPullups: args.finalMaxPullups,
      snapshotDate: Date.now(),
      notes: 'Program completed',
    });
  },
});

// Get progress snapshots for a program
export const getProgressSnapshots = query({
  args: { programId: v.id('userPrograms') },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query('progressSnapshots')
      .withIndex('by_user_program', (q) => q.eq('userProgramId', args.programId))
      .collect();

    return snapshots.sort((a, b) => a.weekNumber - b.weekNumber);
  },
});
