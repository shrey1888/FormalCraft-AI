# FormalCraft AI ✍️✨
> **Intelligent Executive Email & Official Letter Assistant**

FormalCraft AI is a modern, high-precision document synthesis and correspondence platform designed to turn informal notes, rough bullet points, and situational details into polished, executive-ready emails and administrative letters. Powered by the Google Gemini API with a built-in offline-capable fallback engine, FormalCraft AI bridges the gap between quick thoughts and professional communication.

---

## 🌟 Key Features

- **🎯 Context-Aware Document Generation**:
  - **Executive Business Emails**: Status reports, vendor communications, proposals, and client outreach.
  - **Academic & University Letters**: Formal leave applications, bonafide requests, and departmental petitions.
  - **Official Administrative Requests**: Resource allocations, authorizations, and approvals.
  - **Formal Complaints & Dispute Notices**: Structured, fact-oriented grievances and formal dispute records.

- **🎛️ Dynamic Tone & Scope Calibration**:
  - **Tone Matrix**: Choose between *Formal* (Executive Standard), *Polite* (Warm & Cordial), *Firm* (Direct & Assertive), or *Respectful* (Deferential & Humble).
  - **Length Presets**: Tailor document volume from *Concise* (1–2 punchy paragraphs) to *Detailed* (comprehensive background & action items).

- **⚡ Dual AI Architecture**:
  - **Google Gemini Integration**: Uses Google's `@google/genai` SDK to produce contextually nuanced prose.
  - **Zero-Config Local AI Engine**: Seamless local mock generation enables instant testing and demonstration without requiring an API key.

- **📑 Interactive Template Studio**:
  - Pre-built templates for academic, corporate, and legal contexts.
  - Dynamic `{{variable}}` extraction: Automatically detects variables in templates and generates real-time input fields.
  - Custom template creation with local persistence.

- **💎 Glassmorphic Design & Micro-Interactions**:
  - Curated aesthetic with glassmorphism, floating ambient orbs, and dark/light environment themes (*Studio Cream*, *Sunset Rose*, *Aurora Mint*, *Cyber Dark*).
  - Optional subtle auditory feedback synthesized via the Web Audio API.
  - One-click clipboard copy and `.txt` file export.

---

## 🛠️ Tech Stack

- **Frontend & Framework**: [React 19](https://react.dev/), [Next.js](https://nextjs.org/) (App Router), [Vite](https://vitejs.dev/)
- **AI / LLM SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API)
- **Styling**: Vanilla CSS (Tailored Design System, CSS Variables, Glassmorphism)
- **Audio Feedback**: Native Web Audio API (zero external audio assets)

---

## 📂 Project Structure

```text
email-assistant/
├── public/                 # Static assets and icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/   # Next.js Route Handler for AI generation
│   │   ├── templates/      # Template Studio route
│   │   ├── globals.css     # Design tokens, typography & glassmorphic styling
│   │   ├── layout.js       # App layout wrapper
│   │   ├── page.jsx        # FormalCraft AI Composer surface
│   │   └── page.module.css
│   ├── lib/
│   │   ├── generator.js    # AI engine (Gemini API + Local Rule Engine)
│   │   └── templates.js    # Default template schemas and variable parser
│   ├── App.jsx             # Client-side router and view container
│   └── main.jsx            # Vite entry point
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules for node_modules, secrets, and builds
├── index.html              # HTML shell
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite dev configuration and API middleware
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/shrey1888/FormalCraft-AI.git
cd FormalCraft-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

FormalCraft AI runs out of the box using its built-in local engine. To enable live Gemini AI generation:

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and insert your [Google AI Studio Gemini API Key](https://aistudio.google.com/app/apikey):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

> ⚠️ **Note:** `.env.local` is listed in `.gitignore` and will never be committed or exposed to version control.

### 4. Run the Development Server

Start the fast development environment with Vite:

```bash
npm run dev
```

Alternatively, to run via Next.js:

```bash
npm run dev:next
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📖 Usage Instructions

1. **Select Document Type**: Choose from Executive Email, College Letter, Complaint, or Administrative Request.
2. **Set Parameters**: Specify recipient, optional subject, target tone, and desired length.
3. **Input Details**: Provide 2–3 key bullet points in the composer area.
4. **Generate**: Click **Generate Document** (or press <kbd>Cmd/Ctrl</kbd> + <kbd>Enter</kbd>).
5. **Review & Export**: Inspect the calibrated document, copy it to your clipboard with one click, or export it as a text file.
6. **Templates**: Switch to the **Template Filler** tab to select pre-made templates, fill in mapped variables, and export instantly.

---

## 🛡️ Security & Privacy

- **No Secrets Committed**: All API keys and environment configurations are isolated via `.env.local`.
- **Zero Data Retention**: Prompts are transmitted directly to the generation API endpoint and are not stored in any external database.

---

## 👤 Author

**Shreyansh Mishra**
- Email: [shrey1721@gmail.com](mailto:shrey1721@gmail.com)
- GitHub: [@shrey1888](https://github.com/shrey1888)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
