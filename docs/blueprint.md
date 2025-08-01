# **App Name**: PolicyWise

## Core Features:

- Document Ingestion & Preprocessing: Ingest and preprocess various document formats (PDF, DOCX, email) up to 500MB using libraries like PyMuPDF and docx, chunking content intelligently, cleaning text, and storing original position info for traceability. Add OCR (for scanned PDFs) using Tesseract.
- Semantic Embedding & Retrieval: Embed document chunks using Sentence Transformers (all-MiniLM-L6-v2), index them in FAISS, and build a retrieval wrapper to allow semantic querying of the embedded documents.
- Query Understanding & Normalization: Extract key information like age, location, procedure, dates, and policy info from user queries using spaCy and regular expression rules, normalizing vague queries for better downstream retrieval, acts as a tool by using reasoning about whether anaphora resolution is necessary in the case of follow-up questions. Maintain session memory for follow-up queries.
- Clause Classification: Classify text chunks into clause types (Coverage, Exclusion, Limit) by fine-tuning a BERT model on annotated data to improve the LLM’s ability to synthesize its responses. Build 'Justification Templates' from prior examples and add confidence scores from classifier.
- LLM Integration: Integrate a local LLM (Mistral-7B via llama.cpp) with a prompt template injecting the user query, relevant chunks, and clause classifications to produce a structured JSON output. LLM acts as a tool and may choose not to answer the question directly, referring the user back to source documents if it deems its conclusions would be inaccurate or misrepresentative. Store clause-matching explanations and add confidence scores from the LLM.
- UI & API Layer: Provide a UI allowing users to upload files (drag/drop) and ask queries, displaying extracted information, results, and clause references. User provided file is not required.

## Style Guidelines:

- Primary color: A muted teal (#63B5A5) that suggests trust.
- Background color: Light grey (#E0E4E3), same hue but only 20% saturation
- Accent color: Mustard yellow (#B59363) for key actions
- Headline font: 'Playfair', a serif font, to lend an elegant and high-end feel
- Body font: 'PT Sans', a sans-serif font, will offer additional clarity and readability
- Code font: 'Source Code Pro' for displaying policy clauses.
- Use clear, minimalist icons to represent document types and query functions.
- Maintain a clean, organized layout to ensure users can easily navigate the app and view results. Focus on readability.