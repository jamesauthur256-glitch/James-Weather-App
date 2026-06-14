import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom Telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_FOR_PREVIEW_ONLY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// Weather insights generator
app.post("/api/weather/insights", async (req, res) => {
  try {
    const { weatherData, locationName } = req.body;

    if (!weatherData) {
      return res.status(400).json({ error: "Missing weatherData" });
    }

    const sysInstruction = `You are an expert, highly practical weather guide and lifestyle analyst. Given the real-time weather details for a specific location, generate useful weather insights including a high-level summary, specific attire recommendations, necessary gear, an outdoor activity score from 1-10 with a reasoning, and any special alerts or notes for the day. Be concise, warm, and highly practical. Avoid generic recommendations; tailor them directly to the temperatures, humidity, wind, and precipitation probability. For temperature references, remember the environment might use Celsius.`;

    const weatherContext = JSON.stringify(weatherData, null, 2);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide customized lifestyle recommendations for the following weather forecast in ${locationName || 'the current location'}:\n\n${weatherContext}`,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            highlights: {
              type: Type.STRING,
              description: "A summary of today's key weather themes (e.g. 'Brisk morning followed by a damp afternoon with light showers. Mild overall but keep your umbrella handy.')."
            },
            attire: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended clothing layers, footwear, and style specifically suited for this weather (e.g. ['Water-resistant windbreaker', 'Comfortable sneakers with grip', 'Light wool sweater'])."
            },
            gear: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Essential accessories or items to carry (e.g. ['Compact umbrella', 'UV sunglasses', 'Hydration bottle'])."
            },
            activityScore: {
              type: Type.INTEGER,
              description: "Outdoor usability score from 1 (dreadful, hazardous) to 10 (perfect, beautiful clear day)."
            },
            activityExplanation: {
              type: Type.STRING,
              description: "Explain why this score was given and what public/outdoor activities are ideal or advised against (e.g. 'Excellent for running in the morning, but afternoon cycling is not recommended due to high headwinds.')"
            },
            specialNote: {
              type: Type.STRING,
              description: "Any special note, weather observation, or delightful message (e.g., 'A beautiful sunset is expected around 8:15 PM with high cloud scattering!')."
            }
          },
          required: ["highlights", "attire", "gear", "activityScore", "activityExplanation", "specialNote"]
        }
      }
    });

    const bodyText = response.text;
    res.json(JSON.parse(bodyText.trim()));
  } catch (err: any) {
    console.error("Error generating weather insights:", err);
    res.status(500).json({ error: err.message || "Failed to generate weather insights." });
  }
});

// Chat support endpoint
app.post("/api/weather/chat", async (req, res) => {
  try {
    const { messages, weatherData, locationName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const currentContext = `Current Location: ${locationName || 'Unknown Location'}
Current Weather State:
${JSON.stringify(weatherData || {}, null, 2)}
`;

    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the AI Weather Assistant, integrated into a beautiful, real-time weather application. Your primary job is to help users understand the weather forecast and plan their day (activities, clothing, trips, sports, commuting) using the current weather context provided. Always refer to the provided real-time weather details (current temp, hourly trends, daily forecast) to answer questions with precision. Speak in a helpful, friendly, and visual style. Speak in plain conversational and concise manner. Avoid repeating system data verbatim, translate it into helpful recommendations. Limit your answers to 2-3 short paragraphs at most.`,
      }
    });

    // Provide the current weather context as the initial instruction or context
    const contextPrompt = `System Context - Here is the current weather data the user is seeing. Keep this in mind when answering any queries:
${currentContext}

User query: ${messages[messages.length - 1].content}`;

    const response = await chatInstance.sendMessage({
      message: contextPrompt,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Error in weather chat:", err);
    res.status(500).json({ error: err.message || "Failed to chat." });
  }
});

// Serve assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
