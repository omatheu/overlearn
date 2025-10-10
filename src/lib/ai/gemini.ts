// src/lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não configurada');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const flashModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

export const proModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro" 
});

export { genAI };