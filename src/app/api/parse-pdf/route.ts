
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
    
    // Remove the fragile pagerender option and rely on the default text extraction.
    const data = await pdf(buffer);

    // `data.text` will now have page breaks. We will make them more explicit for the AI.
    // The form feed character ('\f') is the default page delimiter from pdf-parse.
    const pages = data.text.split('\f'); 
    let paginatedText = '';
    pages.forEach((pageContent, i) => {
        paginatedText += `--- Page ${i + 1} ---\n${pageContent.trim()}\n\n`;
    });

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
