import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transcription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  meetingType: {
    type: String,
    enum: ['legal', 'meeting'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;
