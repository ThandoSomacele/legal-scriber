import Summary from '../models/Summary.js';
import Transcription from '../models/Transcription.js';
import { generateSummaryWithAI } from './azureOpenAIService.js';

export const generateSummary = async (transcriptionId, meetingType, userId) => {
  try {
    const transcription = await Transcription.findById(transcriptionId);

    if (!transcription) {
      throw new Error('Transcription not found');
    }

    if (transcription.status !== 'completed') {
      throw new Error('Transcription is not yet completed');
    }

    let summaryContent = '';
    for (const content of transcription.content) {
      const partialSummary = await generateSummaryWithAI(content, meetingType);
      summaryContent += partialSummary + '\n\n';
    }

    const summary = new Summary({
      user: userId,
      transcription: transcriptionId,
      content: summaryContent.trim(),
      meetingType,
    });

    await summary.save();

    return summary;
  } catch (error) {
    console.error('Error in generateSummary:', error);
    throw error;
  }
};
