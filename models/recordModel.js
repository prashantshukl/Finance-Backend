import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
   },
   amount: {
      type: Number,
      required: true
   },
   type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true,
   },
   category: {
      type: String,
      required: true,
   },
   date: {
      type: Date,
      required: true,
   },
   description: {
      type: String,
      trim: true,
   },
   isDeleted: {
      type: Boolean,
      default: false,
   },
   deletedAt: {
      type: Date,
   },
}, { timestamps: true });

const recordModel = mongoose.models.record || mongoose.model('record', recordSchema);
export default recordModel;