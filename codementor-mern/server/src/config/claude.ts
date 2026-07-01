import Anthropic from '@anthropic-ai/sdk';

let claudeClient: Anthropic | null = null;

export const getClaude = (): Anthropic => {
  if (!claudeClient) {
    claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return claudeClient;
};
