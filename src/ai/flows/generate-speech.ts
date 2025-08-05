'use server';

/**
 * @fileOverview Converts text to speech.
 *
 * - generateSpeech - A function that handles the text-to-speech conversion.
 * - GenerateSpeechInput - The input type for the generateSpeech function.
 * - GenerateSpeechOutput - The return type for the generateSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a base64-encoded data URI in WAV format."),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;


export async function generateSpeech(input: GenerateSpeechInput): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async ({ text }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media was returned from the text-to-speech model.');
    }

    // The audio data is returned as a base64 string within the data URI.
    // We need to extract it, convert it to a Buffer, and then re-format it as a WAV file.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
