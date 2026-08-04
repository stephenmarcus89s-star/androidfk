import { SettingsModel } from '../models/Settings.js';
import { asyncHandler } from '../middleware/error.js';
import { schemas, validate } from '../middleware/validate.js';

export const getSettings = asyncHandler(async (req, res) => {
  res.json({ settings: await SettingsModel.getAll() });
});

export const updateSettings = [
  validate(schemas.updateSettings),
  asyncHandler(async (req, res) => {
    const updated = await SettingsModel.setMany(req.validated);
    res.json({ settings: updated });
  }),
];
