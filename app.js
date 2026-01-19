// CONFIGURATION - Replace with your real keys
const GEMINI_API_KEY = "AIzaSyAMsPCR7fDatPtpaBM5psdKntpTer9uGlk";
const WEATHER_API_KEY = "YOUR_OPENWEATHER_KEY_HERE";

// 1. Fetch Weather (Patna default)
async function fetchWeather() {
    const city = "Patna";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("weatherDetail").innerHTML = 
            `🌡️ ${data.main.temp}°C | 💧 ${data.main.humidity}% Humidity | <b>${data.weather[0].main}</b>`;
    } catch (e) { document.getElementById("weatherDetail").innerText = "Weather error."; }
}

// 2. Gemini API Caller (Universal Function)
async function callGemini(prompt, base64Image = null) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const contents = [{
        parts: [{ text: prompt }]
    }];

    if (base64Image) {
        contents[0].parts.push({
            inline_data: { mime_type: "image/jpeg", data: base64Image }
        });
    }

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ contents })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// 3. Button Actions
async function getSuggestions() {
    const region = document.getElementById("regionSelect").value;
    const display = document.getElementById("suggestionResult");
    display.innerText = "Generating seasonal plan...";

    const prompt = `Today's date is ${new Date().toLocaleDateString()}. For the region of ${region}, suggest 3 crops for this season. Provide details on soil and water in English and Hindi.`;
    
    const result = await callGemini(prompt);
    display.innerText = result;
    saveToHistory("Crop Advice: " + region);
}

async function analyzeImage() {
    const fileInput = document.getElementById("imageInput");
    if (!fileInput.files[0]) return alert("Please select an image.");

    document.getElementById("analysisResult").innerText = "Analyzing plant health...";
    
    // Convert image to Base64
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Data = reader.result.split(",")[1];
        const prompt = "Identify the crop and any disease/pests. Suggest cures in English and Hindi.";
        const result = await callGemini(prompt, base64Data);
        document.getElementById("analysisResult").innerText = result;
        saveToHistory("Disease Scan: Done");
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// History logic (same as before)
function saveToHistory(action) {
    let history = JSON.parse(localStorage.getItem("agriHistory") || "[]");
    history.unshift(`${new Date().toLocaleTimeString()} - ${action}`);
    localStorage.setItem("agriHistory", JSON.stringify(history.slice(0, 5)));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem("agriHistory") || "[]");
    document.getElementById("historyList").innerHTML = history.map(h => `<p>✅ ${h}</p>`).join("");
}

fetchWeather();
loadHistory();