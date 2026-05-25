import { z } from 'zod';

const FlagValue = z.union([z.string(), z.number(), z.boolean(), z.null(), z.record(z.string(), z.any()), z.array(z.any())]);

const Overrides = z.object({
  env: z.record(z.string(), FlagValue).optional(),
  tenant: z.record(z.string(), z.record(z.string(), FlagValue)).optional(),
  platform: z.record(z.string(), FlagValue).optional(),
  browser: z.record(z.string(), FlagValue).optional(),
}).partial();

const Rollout = z.object({
  enabled: z.boolean().optional(),
  percentage: z.number().min(0).max(100).optional(),
  seed: z.string().optional(),
});

export const FlagPatch = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  owner: z.string().optional(),
  status: z.enum(['active', 'stale', 'archived']).optional(),
  dependencies: z.array(z.string()).optional(),
  overrides: Overrides.optional(),
  rollout: Rollout.optional(),
  killSwitch: z.boolean().optional(),
  __env: z.string().optional(),
  __tenant: z.string().optional(),
}).strict();

export const PublishBody = z.object({
  tenant: z.string().min(1),
  env: z.string().min(1),
  note: z.string().max(500).optional(),
  by: z.string().optional(),
}).strict();

export const RollbackBody = z.object({
  by: z.string().optional(),
}).strict().partial();

export const ApprovalBody = z.object({
  flag: z.string().min(1),
  tenant: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  requestedBy: z.string().optional(),
  reviewers: z.array(z.string()).optional(),
}).strict();

export const ApprovalDecisionBody = z.object({
  by: z.string().optional(),
}).strict().partial();

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'validation_failed',
        issues: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}
