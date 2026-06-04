import mongoose, { Schema, Document, Model } from "mongoose";

interface IAiSuggestions {
  content: string;
  generatedAt: Date;
}

export interface IHabit extends Document {
  userId: string; // multi-tenant prep (indexed)
  title: string; // max 100 chars
  description?: string; // max 500 chars
  targetTime?: string | null; // timezone-safe local time (HH:mm)
  isActive: boolean;
  completedDates: string[]; // historical completion log (YYYY-MM-DD)
  aiSuggestions?: IAiSuggestions; // populated by M5 AI Activation
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    targetTime: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    completedDates: { type: [String], default: [] },
    aiSuggestions: {
      _id: false, // no unnecessary nested ObjectIDs
      content: { type: String },
      generatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

const Habit: Model<IHabit> =
  mongoose.models.Habit ?? mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;
