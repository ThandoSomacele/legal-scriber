import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetingType: {
    type: String,
    enum: ['legal', 'meeting'],
    required: true,
  },
  content: [
    {
      type: String,
    },
  ],
  audioFileUrls: [
    {
      type: String,
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'error', 'submitted'],
    default: 'pending',
  },
  transcriptionUrl: {
    type: String,
  },
  detailedResponse: {
    type: String,
  },
  errorDetails: {
    type: String,
  },
  completedAt: {
    type: Date,
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

const Transcription = mongoose.model('Transcription', transcriptionSchema);

export default Transcription;
