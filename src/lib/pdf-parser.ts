'use server';

import { Worker } from 'worker_threads';
import workerUrl from './pdf-parser-worker';

export async function parsePdf(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  return new Promise((resolve, reject) => {
    // The reason we use a worker is to isolate the memory-intensive and potentially
    // crash-prone pdf-parse library from the main server thread. If pdf-parse
    // encounters a file that causes a catastrophic failure, it will crash the
    // worker thread, which we can handle here, instead of crashing the entire server.
    const worker = new Worker(workerUrl);

    worker.on('message', (result: { success: boolean; text?: string; error?: string }) => {
      if (result.success) {
        resolve(result.text!);
      } else {
        reject(new Error(result.error || 'PDF parsing failed in worker.'));
      }
      worker.terminate();
    });

    worker.on('error', (err) => {
      // This catches errors in the worker initialization or unhandled exceptions.
      reject(new Error(`An error occurred in the PDF parsing worker: ${err.message}`));
      worker.terminate();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        // If the worker exited with a non-zero code, it likely crashed.
        reject(new Error(`PDF parsing worker stopped with exit code ${code}. This may be due to a corrupt or excessively large/complex PDF.`));
      }
    });

    // Post the buffer to the worker. Note: we are not transferring it, just posting it.
    worker.postMessage(buffer);
  });
}
