import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  tokenNumber: string;
  billNumber: string;
  status: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  isCancelled: boolean;
  cancellationReason?: string;
  isRefunded: boolean;
  refundAmount?: number;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  tokenNumber: { type: String, required: true },
  billNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'], default: 'NEW' },
  customerName: { type: String, default: 'Guest Customer' },
  customerPhone: { type: String },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD'], required: true },
  isCancelled: { type: Boolean, default: false },
  cancellationReason: { type: String },
  isRefunded: { type: Boolean, default: false },
  refundAmount: { type: Number },
  items: [
    {
      menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
      name: { type: String, required: true },
      itemPrice: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      notes: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
