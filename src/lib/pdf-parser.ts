'use server';

import pdf from 'pdf-parse';

export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  const data = await pdf(Buffer.from(buffer));
  return data.text;
}
