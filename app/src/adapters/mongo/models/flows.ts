import mongoose, { Document, Model } from "mongoose";

export interface ModelFlowsDoc extends Document {
  type: "marketing" | "chatbot" | "universal";
  name: string;
  data: any;
  accountId: number;
  businessIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

export const ModelFlows: Model<ModelFlowsDoc> = mongoose.model<ModelFlowsDoc>(
  "Flows",
  new mongoose.Schema(
    {
      _id: String,
      type: {
        type: String,
        required: true,
        enum: ["marketing", "chatbot", "universal"],
      },
      name: { type: String, required: true },
      data: { type: Object, required: true },
      accountId: { type: Number, required: true },
      businessIds: { type: [Number], required: false },
    },
    { timestamps: true }
  )
);
