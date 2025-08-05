
import { parentPort } from 'worker_threads';
import pdf from 'pdf-parse';

if (!parentPort) {
  throw new Error('This file must be run as a worker thread.');
}

parentPort.on('message', async (bufferData: ArrayBuffer) => {
  try {
    const data = await pdf(Buffer.from(bufferData));
    parentPort.postMessage({ success: true, text: data.text });
  } catch (error) {
    // We can't post the full error object, as it's not always cloneable.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during parsing.';
    parentPort.postMessage({ success: false, error: `PDF parsing failed in worker: ${errorMessage}` });
  }
});
