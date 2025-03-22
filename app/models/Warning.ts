import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Warning document
export interface IWarning extends Document {
  title: string;
  context: string;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
  color: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Create a schema for the Warning
const WarningSchema = new Schema<IWarning>(
  {
    title: { type: String, required: true },
    context: { type: String, required: true },
    polygon: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true }
    },
    color: { type: String, default: '#FF0000' }, // Default color is red
    severity: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'severe'], 
      default: 'medium' 
    },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Create a TTL index on expiresAt field for auto-deletion
WarningSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export the model
const Warning = mongoose.models.Warning || mongoose.model<IWarning>('Warning', WarningSchema);

export default Warning; 