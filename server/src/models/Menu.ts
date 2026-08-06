import mongoose, { Document, Schema } from 'mongoose';

export interface IMenu extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
}

const MenuSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }
});

export default mongoose.model<IMenu>('Menu', MenuSchema);
