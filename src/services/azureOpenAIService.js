import { AzureOpenAI } from 'openai';

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2024-04-01-preview',
});

export const generateSummaryWithAI = async (transcription, meetingType) => {
  const prompt = getMeetingPrompt(meetingType, transcription);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarises meetings and legal proceedings.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary with AI:', error);
    throw error;
  }
};

const getMeetingPrompt = (meetingType, transcription) => {
  if (meetingType === 'legal') {
    return `Summarise the following legal proceeding transcription, highlighting key points, arguments, and decisions:

${transcription}

Please provide a comprehensive summary in a structured format.`;
  } else {
    return `Summarise the following meeting transcription, highlighting key discussion points, decisions, and action items:

${transcription}

Please provide a comprehensive summary in a structured format.`;
  }
};
