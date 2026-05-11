import { Schema, model, models } from 'mongoose';

const ManagerAssignmentSchema = new Schema({
  manager_id:  { type: String, required: true, unique: true, index: true },
  place_id:    { type: String, required: true },
  assigned_by: { type: String },
  assigned_at: { type: Date, default: Date.now },
});

export const ManagerAssignment = models.ManagerAssignment || model('ManagerAssignment', ManagerAssignmentSchema);
