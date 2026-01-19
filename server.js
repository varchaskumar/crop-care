const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const upload = multer();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static("public"));

// Feature 1: Bilingual Crop Suggestions
app.post("/api/suggestions", async (req, res) => {
    const { region } = req.body;
    const currentDate = new Date().toLocaleDateString();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Today is ${currentDate}. Based on the climate of ${region}, 
                    suggest 3 crops to plant right now. 
                    Provide the response in both ENGLISH and HINDI. 
                    Include: Name, Soil Type, Water Level, and Pesticide Tip.`;

    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
});

// Feature 2: Image-based Disease Analysis
app.post("/api/analyze", upload.single("image"), async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = {
        inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype }
    };

    const prompt = `Act as an expert plant pathologist. Analyze this crop image.
                    1. Name the disease or pest found.
                    2. Provide a cure and organic remedy.
                    3. List chemical pesticides if the infection is severe.
                    IMPORTANT: Provide the advice in both ENGLISH and HINDI.`;

    const result = await model.generateContent([prompt, imagePart]);
    res.json({ text: result.response.text() });
});

app.listen(3000, () => console.log("AgriSmart Server running on port 3000"));