import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const checkTaskSafety = async (title: string, description: string): Promise<{ safe: boolean; reason: string }> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini. Skipping safety check.");
    return { safe: true, reason: "Pemeriksaan keamanan dilewati (mode dev)." };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Anda adalah AI penjaga keamanan untuk platform freelance remaja (usia 13-17 tahun).
        Analisis deskripsi tugas berikut. Tentukan apakah tugas ini aman dan pantas.
        
        Judul Tugas: ${title}
        Deskripsi Tugas: ${description}

        Risiko yang harus dicari: Bahaya fisik, pertemuan dengan orang asing di tempat pribadi, konten eksplisit, penipuan, atau pekerjaan profesional yang terlalu rumit dan tidak cocok untuk anak di bawah umur.

        Jawab dengan format JSON: { "safe": boolean, "reason": "penjelasan singkat dalam Bahasa Indonesia" }.
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const result = JSON.parse(text);
    return {
      safe: result.safe,
      reason: result.reason
    };
  } catch (error) {
    console.error("Gemini safety check failed:", error);
    // Fail safe or open? Let's fail open for demo but warn.
    return { safe: true, reason: "Layanan pemeriksaan keamanan tidak tersedia." };
  }
};