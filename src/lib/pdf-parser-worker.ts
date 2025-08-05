
import { parentPort } from 'worker_threads';
import pdf from 'pdf-parse';

if (!parentPort) {
  throw new Error('This file must be run as a worker thread.');
}

// Options to get page-by-page text
const options = {
  pagerender: (pageData: any) => {
    // We can strip out page numbers and other headers/footers if needed.
    // For now, just return the text content.
    return pageData.getTextContent()
      .then((textContent: any) => {
        let lastY = 0;
        let text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        return text;
      });
  }
};


parentPort.on('message', async (bufferData: Buffer) => {
  try {
    const data = await pdf(bufferData, options);

    // `data.text` will now have page breaks. We will make them more explicit for the AI.
    const pages = data.text.split('\f'); // Form feed character is the page delimiter
    let paginatedText = '';
    for (let i = 0; i < pages.length; i++) {
        paginatedText += `--- Page ${i + 1} ---\n${pages[i].trim()}\n\n`;
    }

    parentPort.postMessage({ success: true, text: paginatedText });
  } catch (error) {
    // We can't post the full error object, as it's not always cloneable.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during parsing.';
    parentPort.postMessage({ success: false, error: `PDF parsing failed in worker: ${errorMessage}` });
  }
});
