// src/services/iaService.js
import { supabase } from "../lib/supabase";

export const getFinancialAdvice = async ({ userData, message }) => {
  try {
    // Usamos el objeto userData (tus analíticas) y el mensaje (la pregunta del usuario)
    const { data, error } = await supabase.functions.invoke('financial-advisor', {
      method: 'POST',
      body: { 
        userData: userData || {}, 
        message: message || "Hola" 
      },
    });

    if (error) throw error;
    return data.reply; // Esto debe coincidir con el retorno de tu index.ts en Supabase
  } catch (err) {
    console.error("Error en iaService:", err);
    return "Lo siento, hubo un problema al conectar con el asistente.";
  }
};