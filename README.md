# ReclaimID MX

A focused Next.js MVP that helps people organize a potential unauthorized financial incident into a structured recovery case. It uses Gemini multimodal analysis to extract visible details from one evidence image, lets the user review them, then generates cautious next-step guidance.

The app does not verify identity, authenticate evidence, detect deepfakes, or determine whether fraud occurred. Images are sent directly to Gemini for the current request and are not written to disk or stored in a database.

## Local setup

Requirements: Node.js 18.17 or later and a Gemini API key.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your server-side key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

   `GEMINI_MODEL` is optional. Never prefix the API key with `NEXT_PUBLIC_`; doing so would expose it to the browser.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Production and Vercel

Run `npm run build` to verify a production build locally.

To deploy on Vercel, import this repository/project, keep the detected Next.js settings, and add `GEMINI_API_KEY` under **Project Settings → Environment Variables**. Optionally add `GEMINI_MODEL`. Deploy normally; no database or persistent storage is required.

## API routes

- `POST /api/extract`: validates an incident description and image (maximum 5 MB), then extracts structured visible evidence.
- `POST /api/recovery-case`: validates the description and reviewed fields, then creates the structured recovery case.

For demonstrations, use synthetic evidence without real account numbers or personal data.
