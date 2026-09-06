# mVerse

Direct conversational intelligence platform featuring a sleek interface, code highlighting, and a resilient multi-provider AI fallback cascade.

---

## Features

- **Fast & Responsive UI**: Clean conversation interface with instant prompt starters and markdown/code block support with copy feedback.
- **Multi-Provider AI Fallback**: Resilient cascading backend architecture supporting:
  - **Google Gemini** (`gemini-flash-lite-latest` / `gemini-flash-latest`)
  - **Groq Cloud** (`llama-3.3-70b-versatile`)
  - **GitHub Models** (`gpt-4o-mini`)
  - **Cerebras Cloud** (`llama-3.3-70b`)
  - **OpenRouter** (`:free` community models)
- **Key Sanitization**: Prevents API keys or sensitive endpoints from leaking to client responses.
- **Vercel Ready**: Preconfigured routing and serverless function deployment via `vercel.json`.

---

## Getting Started

### 1. Install Dependencies

Install packages for both the backend and frontend:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

Create your environment file in the `server` directory:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and add your API key(s). At minimum, provide your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
```

*(Optional fallback keys like `GROQ_API_KEY` or `GITHUB_TOKEN` can also be added here.)*

### 3. Run Locally

Start both the backend server and frontend development client:

```bash
# Terminal 1: Start Backend (Port 5001)
cd server
npm start

# Terminal 2: Start Frontend (Port 3000)
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

1. Import the repository into Vercel.
2. In your Vercel Project Settings, navigate to **Environment Variables** and add:
   - `GEMINI_API_KEY` = your active Gemini API key
   - *(Optional)* any additional provider keys (`GROQ_API_KEY`, `GITHUB_TOKEN`, etc.)
3. Deploy! Vercel will automatically build the client bundle and serve the API routes via `vercel.json`.

---

## License

This project is licensed under the MIT License.
