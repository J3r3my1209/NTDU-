import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import PremiumModal from '../components/premium/PremiumModal.jsx';

/**
 * PremiumContext — expone si el usuario es Premium y permite abrir el modal de
 * bloqueo desde cualquier parte de la app.
 */
const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
    const { esPremium } = useAuth();
    const [modal, setModal] = useState({ open: false, feature: null });

    const abrirModalPremium = (feature = null) => setModal({ open: true, feature });
    const cerrar = () => setModal({ open: false, feature: null });

    return (
        <PremiumContext.Provider value={{ esPremium, abrirModalPremium }}>
            {children}
            <PremiumModal open={modal.open} feature={modal.feature} onClose={cerrar} />
        </PremiumContext.Provider>
    );
}

export const usePremium = () => {
    const ctx = useContext(PremiumContext);
    if (!ctx) throw new Error('usePremium debe usarse dentro de <PremiumProvider>');
    return ctx;
};
