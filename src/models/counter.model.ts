import mongoose, { Schema } from 'mongoose';

const counterSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    seq: {
      type: Number,
      default: 0
    }
  },
  {
    versionKey: false
  }
);

export const CounterModel = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
