import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
