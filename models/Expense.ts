// ============================================================
// Vision Glass & Interior — Expense Model
// ============================================================

import mongoose, { Schema, Model } from 'mongoose';
import type { IExpense } from '@/types';

const ExpenseSchema = new Schema<IExpense>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [3, 'Description must be at least 3 characters'],
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi'],
      required: [true, 'Payment mode is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ExpenseSchema.index({ employee: 1, date: -1 });
ExpenseSchema.index({ date: -1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
