# AI Photo Ace

This is a NextJS starter project for AI Photo Ace.

## Getting Started

To get started with local development, you need to have Node.js and npm installed.

### 1. Environment Setup

You will need an API key from a service that can remove backgrounds from images. The current implementation uses `remove.bg`.

1.  Sign up for an account at [remove.bg](https://www.remove.bg/).
2.  Get your API Key from your account dashboard.
3.  Create a file named `.env` in the root of the project.
4.  Add your API key to the `.env` file like this:

```
REMOVE_BG_API_KEY=your_api_key_here
```

You will also need a Google AI API key for the generative features.

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to get your API key.
2.  Add the key to your `.env` file:

```
GEMINI_API_KEY=your_google_ai_api_key_here
```

### 2. Install Dependencies

Open a terminal and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Running the Application

**On Windows:**

Simply double-click the `start-dev.cmd` file. This will open two new terminal windows: one for the Next.js front-end and one for the Genkit AI back-end.

**On macOS / Linux:**

You will need to open two separate terminal windows.

In the first terminal, run the Genkit server:
```bash
npm run genkit:watch
```

In the second terminal, run the Next.js development server:
```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).
