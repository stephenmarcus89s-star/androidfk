import { z } from 'zod';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req.validated = parsed;
      next();
    } catch (err) {
      const issues = err.errors?.map(e => ({ path: e.path.join('.'), message: e.message })) || [{ message: err.message }];
      return res.status(400).json({ error: 'Validation failed', details: issues });
    }
  };
}

export const schemas = {
  login: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
  updateApp: z.object({
    name: z.string().min(1).max(100).optional(),
    developer: z.string().min(1).max(100).optional(),
    package_name: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    min_android: z.string().max(20).optional(),
    rating_override: z.coerce.number().min(0).max(5).nullable().optional(),
    downloads_override: z.string().max(50).nullable().optional(),
    // Multipart sends boolean as 'true'/'false' string — coerce
    mandatory_update: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
  }),
  createVersion: z.object({
    version_name: z.string().min(1).max(50),
    // Multipart forms send numbers as strings — coerce
    version_code: z.coerce.number().int().min(1),
    release_date: z.string().min(1),
    changelog: z.string().max(5000).optional(),
  }),
  updateSettings: z.object({
    site_name: z.string().max(100).optional(),
    api_base_url: z.string().max(300).optional(),
    default_rating: z.string().max(10).optional(),
    default_downloads: z.string().max(20).optional(),
    theme: z.enum(['dark', 'light']).optional(),
  }),
  changePassword: z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  updateProfile: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  }),
};
