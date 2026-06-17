// supabase/functions/financial-advisor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // 1. Recibir los datos del frontend (gastos e ingresos)
  const { userData } = await req.json()

  // 2. Llamar a la API de OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un experto asesor financiero. Analiza los datos del usuario y da consejos breves para mejorar sus finanzas.' },
        { role: 'user', content: `Mis datos financieros son: ${JSON.stringify(userData)}` }
      ],
    }),
  })

  const data = await response.json()
  
  // 3. Devolver la respuesta al frontend
  return new Response(
    JSON.stringify({ suggestion: data.choices[0].message.content }),
    { headers: { "Content-Type": "application/json" } },
  )
})