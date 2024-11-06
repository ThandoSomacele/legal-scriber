// src/services/summaryService.js
import Summary from '../models/Summary.js';
import Transcription from '../models/Transcription.js';
import { generateSummaryWithAI } from './azureOpenAIService.js';

/**
 * Generates a summary for a given transcription
 * @param {string} transcriptionId - The ID of the transcription to summarise
 * @param {string} meetingType - The type of meeting ('legal' or 'meeting')
 * @param {string} userId - The ID of the user requesting the summary
 * @returns {Promise<Summary>} The generated summary document
 */
export const generateSummary = async (transcriptionId, meetingType, userId) => {
  try {
    const transcription = await Transcription.findById(transcriptionId);
    if (!transcription) {
      throw new Error('Transcription not found');
    }

    if (transcription.status !== 'completed') {
      throw new Error('Transcription is not yet completed');
    }

    // Process transcription content
    const processedContent = transcription.content
      .map(content => {
        try {
          const parsed = JSON.parse(content);
          return parsed.combinedRecognizedPhrases?.[0]?.display || content;
        } catch {
          return content;
        }
      })
      .join('\n\n');

    if (!processedContent) {
      throw new Error('No valid transcription content found');
    }

    // Generate summary
    const summaryContent = await generateSummaryWithAI(processedContent, meetingType);

    // Create and save summary
    const summary = new Summary({
      user: userId,
      transcription: transcriptionId,
      content: summaryContent,
      meetingType,
    });

    await summary.save();
    return summary;
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error.message || 'An error occurred while generating the summary';
    console.error('Summary Generation Error:', {
      message: errorMessage,
      transcriptionId,
      meetingType,
      userId,
      originalError: error,
    });
    throw new Error(errorMessage);
  }
};
