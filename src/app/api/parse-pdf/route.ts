
import {NextResponse} from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dataUri = body.dataUri;

    if (!dataUri || !dataUri.startsWith('data:application/pdf;base64,')) {
      return NextResponse.json(
        {error: 'Invalid or missing PDF data URI.'},
        {status: 400}
      );
    }

    const base64Data = dataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Options to get page-by-page text
    const options = {
      pagerender: (pageData: any) => {
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

    const data = await pdf(buffer, options);

    // `data.text` will now have page breaks. We will make them more explicit for the AI.
    const pages = data.text.split('\f'); // Form feed character is the page delimiter
    let paginatedText = '';
    for (let i = 0; i < pages.length; i++) {
        paginatedText += `--- Page ${i + 1} ---\n${pages[i].trim()}\n\n`;
    }

    return NextResponse.json({text: paginatedText});
  } catch (error) {
    console.error('PDF parsing error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      {error: `PDF parsing failed: ${errorMessage}`},
      {status: 500}
    );
  }
}

    