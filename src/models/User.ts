import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  profile?: {
    height?: number; // cm
    weight?: number; // kg
    goals?: string; // Giảm cân, Tăng cơ, Duy trì
    conditions?: string[]; // Tiểu đường, Ăn chay, Dị ứng đậu phộng...
  };
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: false },
    profile: {
      height: { type: Number, required: false },
      weight: { type: Number, required: false },
      goals: { type: String, required: false },
      conditions: [{ type: String, required: false }],
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
