import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    initialMaxPullups: v.optional(v.number()),
    currentMaxPullups: v.optional(v.number()),
  }).index('email', ['email']),

  // User's enrollment in the pull-up program
  userPrograms: defineTable({
    userId: v.id('users'),
    programType: v.string(), // 'pullup-progression'
    startDate: v.number(), // timestamp
    currentWeek: v.number(), // 1-8
    status: v.union(v.literal('active'), v.literal('completed'), v.literal('paused')),
    targetMaxPullups: v.number(), // Goal
  })
    .index('by_user', ['userId'])
    .index('by_user_and_status', ['userId', 'status']),

  // Individual workout sessions
  workouts: defineTable({
    userId: v.id('users'),
    userProgramId: v.id('userPrograms'),
    weekNumber: v.number(), // 1-8
    dayType: v.union(v.literal('day1'), v.literal('day2'), v.literal('day3')),
    workoutDate: v.number(), // timestamp
    completed: v.boolean(),
    notes: v.optional(v.string()),

    // Day 1 specific (Max Effort Sets)
    maxEffortSets: v.optional(v.array(v.object({
      reps: v.number(),
      restSeconds: v.optional(v.number()),
    }))),

    // Day 2 specific (Volume Work)
    volumeTargetReps: v.optional(v.number()), // Target reps per set
    volumeSets: v.optional(v.array(v.object({
      reps: v.number(),
      completed: v.boolean(), // Did they hit target?
    }))),

    // Day 3 specific (Ladders)
    ladders: v.optional(v.array(v.object({
      rungs: v.array(v.number()), // [1, 2, 3, 4, 3] for example
      totalReps: v.number(),
    }))),
  })
    .index('by_user', ['userId'])
    .index('by_user_program', ['userProgramId'])
    .index('by_user_and_date', ['userId', 'workoutDate']),

  // Progress snapshots for tracking improvements
  progressSnapshots: defineTable({
    userId: v.id('users'),
    userProgramId: v.id('userPrograms'),
    weekNumber: v.number(),
    maxPullups: v.number(),
    snapshotDate: v.number(),
    notes: v.optional(v.string()),
  })
    .index('by_user_program', ['userProgramId'])
    .index('by_user', ['userId']),
});
