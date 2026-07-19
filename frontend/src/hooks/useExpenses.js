import { useState, useEffect, useCallback } from 'react';
import {
    obtenerGastosAPI,
    crearGastoAPI,
    actualizarGastoAPI,
    eliminarGastoAPI
} from '../services/gastosService.js';

/**
 * useExpenses — Hook para gestión de transacciones financieras
 * Centraliza la lógica de estado, carga y operaciones CRUD.
 */
export const useExpenses = () => {
    const [gastos, setGastos]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await obtenerGastosAPI();
            setGastos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al cargar transacciones.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const crearGasto = async (datos) => {
        const nuevo = await crearGastoAPI(datos);
        setGastos(prev => [nuevo, ...prev]);
        return nuevo;
    };

    const actualizarGasto = async (id, datos) => {
        const actualizado = await actualizarGastoAPI(id, datos);
        setGastos(prev => prev.map(g => g._id === id ? actualizado : g));
        return actualizado;
    };

    const eliminarGasto = async (id) => {
        await eliminarGastoAPI(id);
        setGastos(prev => prev.filter(g => g._id !== id));
    };

    // Cálculos derivados
    const lista         = Array.isArray(gastos) ? gastos : [];
    const totalIngresos = lista.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + Number(t.monto), 0);
    const totalGastos   = lista.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + Number(t.monto), 0);
    const saldo         = totalIngresos - totalGastos;

    return {
        gastos: lista,
        loading,
        error,
        totalIngresos,
        totalGastos,
        saldo,
        crearGasto,
        actualizarGasto,
        eliminarGasto,
        recargar: cargar
    };
};
