import Summary from '../models/Summary.js';
import Transcription from '../models/Transcription.js';
import { generateSummaryWithAI } from './azureOpenAIService.js';

export const generateSummary = async (transcriptionId, meetingType, userId) => {
  try {
    const transcription = await Transcription.findById(transcriptionId);

    if (!transcription) {
      throw new Error('Transcription not found');
    }

    const summaryContent = await generateSummaryWithAI(transcription.content, meetingType);

    const summary = new Summary({
      user: userId,
      transcription: transcriptionId,
      content: summaryContent,
      meetingType,
    });

    await summary.save();

    return summary;
  } catch (error) {
    console.error('Error in generateSummary:', error);
    throw error;
  }
};
