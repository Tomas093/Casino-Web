import React, { useState, useEffect } from 'react';
import '@css/LandingPageStyle.css';
import '@css/TransaccionStyle.css';
import Footer from '@components//Footer';
import NavBar from '@components//NavBar';
import { useAuth } from '@context/AuthContext';
import { useUser } from "@context/UserContext.tsx";
import { useTransaction } from "@context/TransactionContext.tsx";
import { useLimitContext } from "@context/LimitContext.tsx";

// Métodos disponibles
const METODOS_INGRESO = [
    { value: 'Tarjeta', label: 'Tarjeta de crédito/débito', via: 'Ingreso' },
    { value: 'Transferencia', label: 'Transferencia bancaria', via: 'Ingreso' },
    { value: 'Wallet', label: 'Billetera Virtual', via: 'Ingreso' },
    { value: 'Cripto', label: 'Criptomonedas', via: 'Ingreso' }
];

const METODOS_RETIRO = [
    { value: 'Transferencia', label: 'Transferencia bancaria', via: 'Retiro' },
    { value: 'Wallet', label: 'Billetera Virtual', via: 'Retiro' },
    { value: 'Cripto', label: 'Criptomonedas', via: 'Retiro' }
];

// Interfaces
interface TransaccionUI {
    id: number;
    tipo: 'ingreso' | 'retiro';
    monto: number;
    fecha: Date;
    metodo: string;
    estado?: string; // opcional, por compatibilidad
}

interface MetodoProps {
    metodo: string;
    via?: string;
}

// Componente de transacción individual
const TransaccionItem: React.FC<{ transaccion: TransaccionUI }> = ({ transaccion }) => {
    const formatFecha = (fecha: Date): string => {
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`transaccion-item ${transaccion.tipo}`}>
            <div className="transaccion-icon">
                {transaccion.tipo === 'ingreso' ? '↓' : '↑'}
            </div>
            <div className="transaccion-info">
                <h3>{transaccion.tipo === 'ingreso' ? 'Depósito' : 'Retiro'}</h3>
                <p className="transaccion-fecha">{formatFecha(new Date(transaccion.fecha))}</p>
                <p className="transaccion-metodo">Método: {transaccion.metodo}</p>
            </div>
            <div className="transaccion-monto">
                <span>${transaccion.monto.toFixed(2)}</span>
            </div>
        </div>
    );
};

const MetodoTarjeta: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="numeroTarjeta">Número de Tarjeta</label>
            <input
                type="text"
                id="numeroTarjeta"
                placeholder="1234 5678 9012 3456"
                required
            />
        </div>
        <div className="form-row">
            <div className="form-group half">
                <label htmlFor="nombreTitular">Nombre del Titular</label>
                <input
                    type="text"
                    id="nombreTitular"
                    placeholder="Como aparece en la tarjeta"
                    required
                />
            </div>
        </div>
        <div className="form-row">
            <div className="form-group half">
                <label htmlFor="fechaExpiracion">Fecha de Expiración</label>
                <input
                    type="text"
                    id="fechaExpiracion"
                    placeholder="MM/AA"
                    required
                />
            </div>
            <div className="form-group half">
                <label htmlFor="cvv">CVV</label>
                <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    required
                />
            </div>
        </div>
    </div>
);

const MetodoTransferenciaIngreso: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label>CBU para transferencia</label>
            <div className="cbu-display">
                <span className="cbu-number">3141 5926 5358 9793 2384 626</span>
                <button
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                        navigator.clipboard.writeText('31415926535897932384626');
                        alert('CBU copiado al portapapeles');
                    }}
                >
                    Copiar
                </button>
            </div>
            <p className="cbu-instruccion">Realice la transferencia a este CBU y luego complete el formulario</p>
        </div>
        <div className="form-group">
            <label htmlFor="comprobante">Número de comprobante (opcional)</label>
            <input
                type="text"
                id="comprobante"
                placeholder="Ingrese el número de comprobante"
            />
        </div>
    </div>
);

const MetodoTransferenciaRetiro: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="CBU">CBU</label>
            <input
                type="text"
                id="transferencia-retiro"
                placeholder="Ingrese su CBU"
                required
            />
        </div>
    </div>
);

const MetodoWalletRetiro: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="wallet">CVU</label>
            <input
                type="text"
                id="wallet"
                placeholder="Ingrese su CVU"
                required
            />
        </div>
    </div>
);

const MetodoWalletIngreso: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="wallet">CVU</label>
            <div className="cbu-display">
                <span className="cbu-number">0000003100054851694701</span>
                <button
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                        navigator.clipboard.writeText('0000003100054851694701');
                        alert('CVU copiado al portapapeles');
                    }}
                >
                    Copiar
                </button>
            </div>
        </div>
    </div>
);

const MetodoCriptoIngreso: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="wallet">Wallet</label>
            <div className="cbu-display">
                <span className="cbu-number">0xA1b2C3d4E5F609032005G6</span>
                <button
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                        navigator.clipboard.writeText('0xA1b2C3d4E5F609032005G6H7I8J9K0L1M2N3O4P5Q');
                        alert('Dirección de billetera copiada al portapapeles');
                    }}
                >
                    Copiar
                </button>
            </div>
        </div>
    </div>
);

const MetodoCriptoRetiro: React.FC = () => (
    <div className="metodo-detalle">
        <div className="form-group">
            <label htmlFor="wallet">Wallet</label>
            <input
                type="text"
                id="wallet"
                placeholder="Ingrese su Wallet"
                required
            />
        </div>
    </div>
);

// Componente para renderizar el método de pago seleccionado
const DetalleMetodo: React.FC<MetodoProps> = ({ metodo, via }) => {
    switch (metodo) {
        case 'Tarjeta':
            return <MetodoTarjeta />;
        case 'Transferencia':
            if (via === 'Ingreso') {
                return <MetodoTransferenciaIngreso />;
            }
            return <MetodoTransferenciaRetiro />;
        case 'Wallet':
            if (via === 'Ingreso') {
                return <MetodoWalletIngreso />;
            }
            return <MetodoWalletRetiro />;
        case 'Cripto':
            if (via === 'Ingreso') {
                return <MetodoCriptoIngreso />;
            }
            return <MetodoCriptoRetiro />;
        default:
            return null;
    }
};

// Componente principal
const Transaccion: React.FC = () => {
    const { user } = useAuth();
    const { client, getUserData } = useUser();
    const { getTransactions, createIngreso, createEgreso } = useTransaction();
    const { getLimitMonetario } = useLimitContext();
    const [activeTab, setActiveTab] = useState<'ingreso' | 'retiro'>('ingreso');
    const [monto, setMonto] = useState<string>('');
    const [metodo, setMetodo] = useState<string>('Tarjeta');
    const [historial, setHistorial] = useState<TransaccionUI[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [monetaryLimits, setMonetaryLimits] = useState<any>(null);

    // Fetch monetary limits on component mount
    useEffect(() => {
        const fetchLimits = async () => {
            if (!user) return;
            try {
                const limits = await getLimitMonetario(user.usuarioid);
                if (limits && limits.length > 0) {
                    setMonetaryLimits(limits[0]);
                }
            } catch (error) {
                console.error("Error al cargar límites monetarios:", error);
            }
        };

        fetchLimits();
    }, [user, getLimitMonetario]);

    // Cambiar automáticamente el método según la pestaña
    useEffect(() => {
        setMetodo(activeTab === 'ingreso' ? METODOS_INGRESO[0].value : METODOS_RETIRO[0].value);
    }, [activeTab]);

    // Cargar historial desde el backend
    useEffect(() => {
        const fetchHistorial = async () => {
            if (!user) return;
            try {
                const data = await getTransactions(user.usuarioid.toString());

                const parsed = data.map((t: any) => ({
                    ...t,
                    fecha: new Date(t.fecha),
                    estado: 'completada', // default visual
                }));

                setHistorial(parsed);
            } catch (error) {
                console.error("Error al cargar historial:", error);
            }
        };

        fetchHistorial();
    }, [user, getTransactions]);

    // Calculate current usage for limits
    const calculateCurrentUsage = () => {
        if (!historial.length) return { daily: 0, weekly: 0, monthly: 0 };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter ingreso transactions by time periods
        const ingresos = historial.filter(t => t.tipo === 'ingreso');

        const dailyTotal = ingresos
            .filter(t => t.fecha >= today)
            .reduce((sum, t) => sum + t.monto, 0);

        const weeklyTotal = ingresos
            .filter(t => t.fecha >= weekStart)
            .reduce((sum, t) => sum + t.monto, 0);

        const monthlyTotal = ingresos
            .filter(t => t.fecha >= monthStart)
            .reduce((sum, t) => sum + t.monto, 0);

        return { daily: dailyTotal, weekly: weeklyTotal, monthly: monthlyTotal };
    };

    const getMetodosDisponibles = () => {
        return activeTab === 'ingreso' ? METODOS_INGRESO : METODOS_RETIRO;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Debe iniciar sesión para realizar transacciones');
            return;
        }

        if (!monto || parseFloat(monto) <= 0) {
            alert('Por favor ingrese un monto válido');
            return;
        }

        const montoNum = parseFloat(monto);

        // Check monetary limits for deposits
        if (activeTab === 'ingreso' && monetaryLimits) {
            const usage = calculateCurrentUsage();

            // Check if deposit would exceed any limit
            if (usage.daily + montoNum > monetaryLimits.limitediario) {
                alert(`Este depósito excedería su límite diario de $${monetaryLimits.limitediario}`);
                return;
            }

            if (usage.weekly + montoNum > monetaryLimits.limitesemanal) {
                alert(`Este depósito excedería su límite semanal de $${monetaryLimits.limitesemanal}`);
                return;
            }

            if (usage.monthly + montoNum > monetaryLimits.limitemensual) {
                alert(`Este depósito excedería su límite mensual de $${monetaryLimits.limitemensual}`);
                return;
            }
        }

        // Para retiros, verificar si hay suficiente balance
        if (activeTab === 'retiro' && client && montoNum > client.balance) {
            alert('No tiene suficiente saldo para realizar este retiro');
            return;
        }

        setLoading(true);

        try {
            const fecha = new Date().toISOString();

            // Datos para la transacción
            const transaccionData = {
                usuarioid: user.usuarioid,
                fecha: fecha,
                metodo: metodo,
                monto: montoNum
            };

            if (activeTab === 'ingreso') {
                await createIngreso(transaccionData);
                alert('Depósito registrado exitosamente');
            } else {
                await createEgreso(transaccionData);
                alert('Retiro solicitado exitosamente');
            }

            // Actualizar los datos del usuario para reflejar el nuevo balance
            if (user.usuarioid) {
                await getUserData(user.usuarioid.toString());
            }

            // Actualizar el historial de transacciones
            const updatedHistorial = await getTransactions(user.usuarioid.toString());
            setHistorial(updatedHistorial.map((t: any) => ({
                ...t,
                fecha: new Date(t.fecha),
                estado: 'completada'
            })));

            // Limpiar el formulario
            setMonto('');
        } catch (error: any) {
            console.error("Error al procesar la transacción:", error);
            if (error.message) {
                alert(`Error: ${error.message}`);
            } else {
                alert('Error al procesar la transacción');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavBar />
            <div className="transaccion-page">
                <div className="australis-container">
                    <h1 className="transaccion-title">Transacciones</h1>

                    {/* Tabs de ingreso / retiro */}
                    <div className="transaccion-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'ingreso' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ingreso')}
                        >
                            Ingreso
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'retiro' ? 'active' : ''}`}
                            onClick={() => setActiveTab('retiro')}
                        >
                            Retiro
                        </button>
                    </div>

                    {/* Formulario */}
                    <div className="transaccion-form-container">
                        <form onSubmit={handleSubmit} className="transaccion-form">
                            <h2>{activeTab === 'ingreso' ? 'Realizar un depósito' : 'Solicitar un retiro'}</h2>

                            <div className="form-group">
                                <label htmlFor="monto">Monto ({activeTab === 'ingreso' ? 'a depositar' : 'a retirar'})</label>
                                <div className="monto-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        id="monto"
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        placeholder="0.00"
                                        min="10"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="metodo">Método de {activeTab === 'ingreso' ? 'pago' : 'retiro'}</label>
                                <select
                                    id="metodo"
                                    value={metodo}
                                    onChange={(e) => setMetodo(e.target.value)}
                                    required
                                >
                                    {getMetodosDisponibles().map(opcion => (
                                        <option key={opcion.value} value={opcion.value}>
                                            {opcion.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Detalle según método. Se pasa la propiedad "via" según el activeTab */}
                            <DetalleMetodo metodo={metodo} via={activeTab === 'ingreso' ? 'Ingreso' : 'Retiro'} />

                            <button type="submit" className="cta-btn transaccion-btn" disabled={loading}>
                                {loading ? 'Procesando...' : activeTab === 'ingreso' ? 'Depositar' : 'Retirar'}
                            </button>
                        </form>
                    </div>

                    {/* Historial */}
                    <div className="transaccion-historial">
                        <h2>Historial de transacciones</h2>

                        {historial.length === 0 ? (
                            <p className="no-transacciones">No hay transacciones para mostrar</p>
                        ) : (
                            <div className="historial-lista">
                                {historial.map((transaccion) => (
                                    <TransaccionItem
                                        key={`${transaccion.tipo}-${transaccion.id}`}
                                        transaccion={transaccion}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Transaccion;