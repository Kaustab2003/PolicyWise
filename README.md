# PolicyWise: Intelligent Policy Analysis

## Project Summary

PolicyWise is a web application built with Next.js and powered by Google's Generative AI (Genkit). It's designed to be an intelligent assistant for analyzing, understanding, and improving policy documents. Users can interact with the application in three primary ways: querying an existing policy for a summary, getting AI-driven suggestions to enhance a policy draft, and uploading their own documents to ask specific questions.

## Core Features

The application is organized into three main tabs, each serving a distinct purpose:

1.  **Query Policy**: This feature allows users to paste a policy document and ask a specific question about it (e.g., "Is accidental drop damage covered?"). The AI analyzes the document in the context of the question and returns a concise summary, a confidence score for its answer, and a list of the most relevant clauses from the source document.

2.  **Improve Policy**: This feature acts as an AI-powered policy analyst. Users can paste a draft policy, and the AI will provide suggestions to improve its clarity, completeness, and fairness based on common industry standards and best practices.

3.  **Ask Document**: Users can upload a text-based document (like a .txt or .md file). Once uploaded, they can ask questions about the content of the document, and the AI will provide a direct answer based on the information it contains. This is useful for quickly extracting information from various textual documents without having to read through them manually.

## Technical Requirements (Stack)

The project is built using a modern web development stack:

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI Toolkit**: [Genkit](https://firebase.google.com/docs/genkit) for seamless integration with Generative AI models.
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## How to Use the Application

Using PolicyWise is straightforward. The user interface is divided into an input panel on the left and a results panel on the right.

1.  **Select a Feature**:
    -   Click on one of the three tabs at the top of the left panel: **Query Policy**, **Improve Policy**, or **Ask Document**.

2.  **Provide Input**:
    -   For **Query Policy**:
        -   Paste the policy text into the "Policy Document" text area. A default warranty is pre-loaded as an example.
        -   Type your question into the "Your Question" input field.
        -   Click the "Analyze Query" button.
    -   For **Improve Policy**:
        -   Paste the policy draft into the "Policy Document" text area.
        -   Click the "Suggest Improvements" button.
    -   For **Ask Document**:
        -   Click the "Select a text file" button to upload a document from your computer.
        -   Once the file is selected, type your question into the "Your Question" input field that appears.
        -   Click the "Ask Question" button.

3.  **View Results**:
    -   After you submit your request, the AI will process it, and the results will appear in the "Results" card on the right-hand side of the screen.
    -   The results are tailored to the feature you used, displaying summaries, improvement suggestions, or direct answers as appropriate.

## Running Locally with VS Code

To run this project on your local machine using Visual Studio Code, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### 2. Install Dependencies
Open the project folder in VS Code. Then, open the integrated terminal (you can use `Ctrl+\``) and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Set Up Environment Variables
The application uses Google's Generative AI, which requires an API key.

1.  Create a new file named `.env` in the root of the project directory.
2.  Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add the key to your `.env` file like this:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 4. Run the Development Servers
This project requires two separate processes to be running at the same time:
- The **Next.js frontend** application.
- The **Genkit backend** for handling AI flows.

You will need to open two separate terminals in VS Code to run them.

-   **In your first terminal**, run the Next.js development server:
    ```bash
    npm run dev
    ```
    This will typically start the web application on `http://localhost:9002`.

-   **In your second terminal**, run the Genkit AI flows:
    ```bash
    npm run genkit:watch
    ```
    This starts the Genkit development server and will automatically restart if you make changes to the AI flow files.

Once both servers are running, you can open your browser to `http://localhost:9002` to use the application.