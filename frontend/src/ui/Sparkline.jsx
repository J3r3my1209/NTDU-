import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

/**
 * Sparkline — mini gráfico de área sin ejes, para las tarjetas.
 */
export const Sparkline = ({ data = [], color = '#00E56A', height = 44 }) => {
    const id = useId().replace(/:/g, '');
    const serie = data.map((v, i) => ({ i, v: Number(v) || 0 }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={serie} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#spark-${id})`}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default Sparkline;
