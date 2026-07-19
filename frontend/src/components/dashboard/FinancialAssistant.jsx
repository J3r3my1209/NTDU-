import { useState } from 'react';
import BorderGlow from '../BorderGlow/BorderGlow';

export default function FinancialAssistant({ analytics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente financiero. ¿Qué deseas consultar hoy?' }
  ]);

  const enviarPregunta = async () => {
    if (!input.trim()) return;
    const preguntaUsuario = input;
    setInput(""); // Limpiamos el input al enviar
    setMensajes(prev => [...prev, { role: 'user', content: preguntaUsuario }]);

    try {
      const response = await fetch("https://rfvwcaiqyksocjwhezjb.supabase.co/functions/v1/financial-advisor", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: preguntaUsuario, contexto: analytics })
      });
      const data = await response.json();
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }]);
    } catch (error) {
      setMensajes(prev => [...prev, { role: 'assistant', content: "Error de conexión." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2147483647]">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-4 bg-[#00E56A] text-black font-bold rounded-full shadow-lg hover:scale-105 transition-all"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[320px] h-[450px] sm:right-8 z-[2147483647] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <BorderGlow 
            className="w-full h-full"
            borderRadius={24} 
            backgroundColor="#0A0B0D" 
            glowColor="148 100% 45%" 
            glowIntensity={0.6}
            colors={['#00E56A', '#1fe884', '#068f45']}
          >
            <div className="h-full flex flex-col p-5 bg-[#0A0B0D] rounded-[24px]">
              <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Asistente Financiero</h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {mensajes.map((m, i) => (
                  <div key={i} className={`text-sm p-3 rounded-2xl max-w-[90%] ${
                    m.role === 'user' ? 'bg-[#00E56A] text-black ml-auto rounded-br-none' : 'bg-[#1A1D23] text-white rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                ))}
              </div>

              {/* Contenedor del Input y Botón */}
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') enviarPregunta(); }}
                  className="w-full bg-[#1A1D23] border border-white/5 rounded-full px-5 py-3 text-sm text-white outline-none focus:border-[#00E56A] pr-12"
                  placeholder="Escribe tu consulta..."
                />
                <button 
                  onClick={enviarPregunta}
                  className="absolute right-2 p-2 bg-[#00E56A] rounded-full text-black hover:bg-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </BorderGlow>
        </div>
      )}
    </div>
  );
}