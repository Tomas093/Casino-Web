import * as React from "react";
import {useEffect, useState} from "react";
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {useTransaction} from "@context/TransactionContext";
import '@css/PieChartStyle.css';

interface IngresoStats {
    metodo: string;
    total_ingresos: number;
}

interface EgresoStats {
    metodo: string;
    total_egresos: number;
}

interface PaymentMethodStats {
    ingresos: IngresoStats[];
    egresos: EgresoStats[];
}

export default function PaymentMethodsChart() {
    const { getTransactionStatsByMethod } = useTransaction();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [paymentMethodsStats, setPaymentMethodsStats] = useState<PaymentMethodStats>({
        ingresos: [],
        egresos: [],
    });
    const [chartType, setChartType] = useState<'ingresos' | 'egresos'>('ingresos');

    const COLORS = {
        Tarjeta: "#ffdd00",
        Wallet: "#27c376",
        Transferencia: "#00aaff",
        Cripto: "#e74a3b"
    };

    const chartData = React.useMemo(() => {
        if (chartType === 'ingresos') {
            return paymentMethodsStats.ingresos.map((item) => ({
                name: item.metodo,
                value: item.total_ingresos,
                color: COLORS[item.metodo as keyof typeof COLORS] || "#a0a0a0"
            }));
        } else {
            return paymentMethodsStats.egresos.map((item) => ({
                name: item.metodo,
                value: item.total_egresos,
                color: COLORS[item.metodo as keyof typeof COLORS] || "#a0a0a0"
            }));
        }
    }, [paymentMethodsStats, chartType]);

    const total = React.useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    const formatNumber = (value: number) => {
        return value.toLocaleString();
    };



    const formatTooltipValue = (value: number, name: string) => {
        const percent = ((value / total) * 100).toFixed(1);
        return [`${formatNumber(value)} (${percent}%)`, name];
    };

    const handlePieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const handlePieLeave = () => {
        setActiveIndex(null);
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    useEffect(() => {
        const fetchPaymentMethodStats = async () => {
            try {
                const stats = await getTransactionStatsByMethod();
                setPaymentMethodsStats(stats);
            } catch (error) {
                console.error("Error fetching payment method stats:", error);
            }
        };

        fetchPaymentMethodStats();
    }, [getTransactionStatsByMethod]);

    const renderLegend = (props: any) => {
        const { payload } = props;

        return (
            <div className="chart-legend">
                {payload.map((entry: any, index: number) => {
                    const itemValue = chartData[index].value;
                    const percentage = ((itemValue / total) * 100).toFixed(1);

                    return (
                        <div
                            key={`item-${index}`}
                            className="legend-item"
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <div className="legend-color" style={{ backgroundColor: entry.color }} />
                            <div className="legend-text">
                                <span className="legend-name">{entry.value}</span>
                                <span className="legend-value">
                                    {formatNumber(itemValue)} <span className="legend-percent">({percentage}%)</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="payment-chart-container">
            <div className="chart-type-selector">
                <button
                    className={`chart-tab ${chartType === 'ingresos' ? 'active' : ''}`}
                    onClick={() => setChartType('ingresos')}
                >
                    Ingresos
                </button>
                <button
                    className={`chart-tab ${chartType === 'egresos' ? 'active' : ''}`}
                    onClick={() => setChartType('egresos')}
                >
                    Egresos
                </button>
            </div>
            <div className="chart-wrapper">
                {chartData.length === 0 ? (
                    <div className="no-data-message">No hay datos disponibles</div>
                ) : (
                    <div className="chart-container" style={{ position: 'relative' }}>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={90}
                                    innerRadius={45}
                                    paddingAngle={4}
                                    dataKey="value"
                                    onMouseEnter={handlePieEnter}
                                    onMouseLeave={handlePieLeave}
                                    animationBegin={200}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke={activeIndex === index ? "#fff" : "transparent"}
                                            strokeWidth={2}
                                            style={{
                                                filter: activeIndex === index
                                                    ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                                                    : 'none',
                                                opacity: activeIndex === null || activeIndex === index ? 1 : 0.7,
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={formatTooltipValue}
                                    contentStyle={{
                                        backgroundColor: 'rgba(18, 18, 18, 0.9)',
                                        border: '1px solid #d4af37',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        color: '#e0e0e0',
                                        fontSize: '13px',
                                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                                    }}
                                    itemStyle={{ color: '#e0e0e0' }}
                                    labelStyle={{ color: '#d4af37', fontWeight: 600 }}
                                />
                                <Legend
                                    content={renderLegend}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="chart-center-info" style={{
                            position: 'absolute',
                            top: '40%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                        }}>
                            <div className="center-text">
                                <span className="center-label">Total</span>
                                <span className="center-value">{formatNumber(total)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}