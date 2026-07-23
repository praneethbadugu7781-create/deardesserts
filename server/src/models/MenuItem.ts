import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  price: number;
  taxPercent: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isCombo: boolean;
  preparationMinutes: number;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  taxPercent: { type: Number, default: 5.0 },
  description: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  isCombo: { type: Boolean, default: false },
  preparationMinutes: { type: Number, default: 5 },
});

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
