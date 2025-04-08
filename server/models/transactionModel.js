import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // better than plain String for referencing
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['Basic', 'Advanced', 'Business'] // optional: validates plan types
  },
  amount: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  payment: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now // this gives you an actual Date object
  }
});

const transactionModel = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default transactionModel;