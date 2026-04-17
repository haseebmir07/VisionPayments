// ============================================================
// Vision Glass & Interior — Employee Model
// ============================================================

import mongoose, { Schema, Model } from 'mongoose';
import type { IEmployee } from '@/types';

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });

// Auto-generate employeeId before saving
EmployeeSchema.pre('save', async function () {
  if (this.isNew && !this.employeeId) {
    const EmployeeModel = mongoose.model<IEmployee>('Employee');
    const lastEmployee = await EmployeeModel.findOne({}, { employeeId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let nextNum = 1;
    if (lastEmployee?.employeeId) {
      const match = lastEmployee.employeeId.match(/EMP-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    this.employeeId = `EMP-${String(nextNum).padStart(3, '0')}`;
  }
});

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
