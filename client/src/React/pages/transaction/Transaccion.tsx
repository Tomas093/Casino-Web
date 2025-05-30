import React, {useEffect, useState} from 'react';
import '@css/LandingPageStyle.css';
import '@css/TransaccionStyle.css';
import Footer from '@components//Footer';
import NavBar from '@components//NavBar';
import {useAuth} from '@context/AuthContext';
import {useUser} from "@context/UserContext.tsx";
import {useTransaction} from "@context/TransactionContext.tsx";
import {useLimitContext} from "@context/LimitContext.tsx";
import {useCupon} from "@context/CuponContext.tsx";
import Message from "@components/Error/Message";

const METODOS_INGRESO = [
    {value: 'Tarjeta', label: 'Tarjeta de crédito/débito', via: 'Ingreso'},
    {value: 'Transferencia', label: 'Transferencia bancaria', via: 'Ingreso'},
    {value: 'Wallet', label: 'Billetera Virtual', via: 'Ingreso'},
    {value: 'Cripto', label: 'Criptomonedas', via: 'Ingreso'}
];

const METODOS_RETIRO = [
    {value: 'Transferencia', label: 'Transferencia bancaria', via: 'Retiro'},
    {value: 'Wallet', label: 'Billetera Virtual', via: 'Retiro'},
    {value: 'Cripto', label: 'Criptomonedas', via: 'Retiro'}
];


interface TransaccionUI {
    id: number;
    tipo: 'ingreso' | 'retiro';
    monto: number;
    fecha: Date;
    metodo: string;
    estado?: string;
}

interface MetodoProps {
    metodo: string;
    via?: string;
}


const TransaccionItem: React.FC<{ transaccion: TransaccionUI }> = ({transaccion}) => {
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
                <span>${Math.round(transaccion.monto)}</span>
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

const MetodoTransferenciaIngreso: React.FC = () => {
    const [copiado, setCopiado] = useState<boolean>(false);

    const copiarCBU = () => {
        navigator.clipboard.writeText('31415926535897932384626');
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="metodo-detalle">
            <div className="form-group">
                <label>CBU para transferencia</label>
                <div className="cbu-display">
                    <span className="cbu-number">3141 5926 5358 9793 2384 626</span>
                    <button
                        type="button"
                        className="copy-btn"
                        onClick={copiarCBU}
                    >
                        {copiado ? 'Copiado' : 'Copiar'}
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
};

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

const MetodoWalletIngreso: React.FC = () => {
    const [copiado, setCopiado] = useState<boolean>(false);

    const copiarCVU = () => {
        navigator.clipboard.writeText('0000003100054851694701');
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="metodo-detalle">
            <div className="form-group">
                <label htmlFor="wallet">CVU</label>
                <div className="cbu-display">
                    <span className="cbu-number">0000003100054851694701</span>
                    <button
                        type="button"
                        className="copy-btn"
                        onClick={copiarCVU}
                    >
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MetodoCriptoIngreso: React.FC = () => {
    const [copiado, setCopiado] = useState<boolean>(false);

    const copiarWallet = () => {
        navigator.clipboard.writeText('0xA1b2C3d4E5F609032005G6');
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="metodo-detalle">
            <div className="form-group">
                <label htmlFor="wallet">Wallet</label>
                <div className="cbu-display">
                    <span className="cbu-number">0xA1b2C3d4E5F609032005G6</span>
                    <button
                        type="button"
                        className="copy-btn"
                        onClick={copiarWallet}
                    >
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

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

const DetalleMetodo: React.FC<MetodoProps> = ({metodo, via}) => {
    switch (metodo) {
        case 'Tarjeta':
            return <MetodoTarjeta/>;
        case 'Transferencia':
            if (via === 'Ingreso') {
                return <MetodoTransferenciaIngreso/>;
            }
            return <MetodoTransferenciaRetiro/>;
        case 'Wallet':
            if (via === 'Ingreso') {
                return <MetodoWalletIngreso/>;
            }
            return <MetodoWalletRetiro/>;
        case 'Cripto':
            if (via === 'Ingreso') {
                return <MetodoCriptoIngreso/>;
            }
            return <MetodoCriptoRetiro/>;
        default:
            return null;
    }
};

// Componente principal
const Transaccion: React.FC = () => {
    const {user} = useAuth();
    const {client, getUserData} = useUser();
    const {getTransactions, createIngreso, createEgreso} = useTransaction();
    const {getLimitMonetario} = useLimitContext();
    const {getCuponsById} = useCupon();

    const [activeTab, setActiveTab] = useState<'ingreso' | 'retiro'>('ingreso');
    const [monto, setMonto] = useState<string>('');
    const [metodo, setMetodo] = useState<string>('Tarjeta');
    const [historial, setHistorial] = useState<TransaccionUI[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [monetaryLimits, setMonetaryLimits] = useState<any>(null);

    // Estados para cupones
    const [couponId, setCouponId] = useState<string>('');
    const [coupon, setCoupon] = useState<any>(null);
    const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
    const [couponError, setCouponError] = useState<string>('');
    const [benefitAmount, setBenefitAmount] = useState<number>(0);
    const [isCouponValidated, setIsCouponValidated] = useState<boolean>(true); // Nuevo estado

    // Estado para mensajes
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('error');

    // Validar cupón
    const validateCoupon = async () => {
        if (!couponId.trim()) {
            setCouponError('Ingrese un ID de cupón');
            setCoupon(null);
            setBenefitAmount(0);
            return;
        }

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const couponData = await getCuponsById(couponId);

            // Validar fechas y usos del cupón
            const now = new Date();
            const startDate = new Date(couponData.fechainicio);
            const endDate = new Date(couponData.fechafin);

            if (now < startDate || now > endDate) {
                setCouponError('Este cupón no está vigente');
                setCoupon(null);
                setBenefitAmount(0);
                return;
            }

            if (couponData.cantidadusos <= 0) {
                setCouponError('Este cupón ya no tiene usos disponibles');
                setCoupon(null);
                setBenefitAmount(0);
                return;
            }

            const montoNum = parseInt(monto) || 0;

            // Verificar montos mínimos/máximos
            if (montoNum < couponData.mincarga) {
                setCouponError(`El monto mínimo para este cupón es $${couponData.mincarga}`);
                setCoupon(null);
                setBenefitAmount(0);
                return;
            }

            if (couponData.maxcarga && montoNum > couponData.maxcarga) {
                setCouponError(`El monto máximo para este cupón es $${couponData.maxcarga}`);
                setCoupon(null);
                setBenefitAmount(0);
                return;
            }

            // Calcular beneficio como entero
            const benefit = Math.round((montoNum * couponData.beneficio) / 100);
            setBenefitAmount(benefit);
            setCoupon(couponData);
            setCouponError('');

            setIsCouponValidated(true); // Habilitar el botón de "Depositar" después de validar

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error("Error al validar cupón:", error);
            setCouponError('Cupón no válido o no encontrado');
            setCoupon(null);
            setBenefitAmount(0);
            setErrorMessage('Cupón no válido o no encontrado');
            setMessageType('error');
            setIsCouponValidated(false); // Mantener deshabilitado si falla la validación
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Manejar cambios en el campo del cupón
    const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCouponId(e.target.value);
        setIsCouponValidated(false); // Deshabilitar el botón si el usuario escribe en el campo
    };

    // Actualizar monto de beneficio cuando cambia el monto o hay cupón válido
    useEffect(() => {
        if (coupon && monto) {
            const montoNum = parseInt(monto) || 0;
            const benefit = Math.round((montoNum * coupon.beneficio) / 100);
            setBenefitAmount(benefit);
        } else {
            setBenefitAmount(0);
        }
    }, [monto, coupon]);

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
                setErrorMessage('Error al cargar límites monetarios');
                setMessageType('error');
            }
        };

        fetchLimits();
    }, [user, getLimitMonetario]);

    // Cambiar automáticamente el método según la pestaña
    useEffect(() => {
        setMetodo(activeTab === 'ingreso' ? METODOS_INGRESO[0].value : METODOS_RETIRO[0].value);

        // Reset coupon data when switching tabs
        if (activeTab === 'retiro') {
            setCouponId('');
            setCoupon(null);
            setCouponError('');
            setBenefitAmount(0);
        }
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
                setErrorMessage('Error al cargar historial de transacciones');
                setMessageType('error');
            }
        };

        fetchHistorial();
    }, [user, getTransactions]);

    // Calculate current usage for limits
    const calculateCurrentUsage = () => {
        if (!historial.length) return {daily: 0, weekly: 0, monthly: 0};

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter ingreso transactions by time periods
        const ingresos = historial.filter(t => t.tipo === 'ingreso');

        const dailyTotal = ingresos
            .filter(t => t.fecha >= today)
            .reduce((sum, t) => sum + Math.round(t.monto), 0);

        const weeklyTotal = ingresos
            .filter(t => t.fecha >= weekStart)
            .reduce((sum, t) => sum + Math.round(t.monto), 0);

        const monthlyTotal = ingresos
            .filter(t => t.fecha >= monthStart)
            .reduce((sum, t) => sum + Math.round(t.monto), 0);

        return {daily: dailyTotal, weekly: weeklyTotal, monthly: monthlyTotal};
    };

    const getMetodosDisponibles = () => {
        return activeTab === 'ingreso' ? METODOS_INGRESO : METODOS_RETIRO;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setErrorMessage('Debe iniciar sesión para realizar transacciones');
            setMessageType('error');
            return;
        }

        if (!monto || parseInt(monto) <= 0) {
            setErrorMessage('Por favor ingrese un monto válido');
            setMessageType('error');
            return;
        }

        const montoNum = parseInt(monto, 10);

        // Check monetary limits for deposits
        if (activeTab === 'ingreso' && monetaryLimits) {
            const usage = calculateCurrentUsage();

            // Check if deposit would exceed any limit
            if (usage.daily + montoNum > monetaryLimits.limitediario) {
                setErrorMessage(`Este depósito excedería su límite diario de $${monetaryLimits.limitediario}`);
                setMessageType('warning');
                return;
            }

            if (usage.weekly + montoNum > monetaryLimits.limitesemanal) {
                setErrorMessage(`Este depósito excedería su límite semanal de $${monetaryLimits.limitesemanal}`);
                setMessageType('warning');
                return;
            }

            if (usage.monthly + montoNum > monetaryLimits.limitemensual) {
                setErrorMessage(`Este depósito excedería su límite mensual de $${monetaryLimits.limitemensual}`);
                setMessageType('warning');
                return;
            }
        }

        // Para retiros, verificar si hay suficiente balance (como entero)
        const clientBalance = client ? Math.round(client.balance) : 0;
        if (activeTab === 'retiro' && client && montoNum > clientBalance) {
            setErrorMessage('No tiene suficiente saldo para realizar este retiro');
            setMessageType('error');
            return;
        }

        setLoading(true);

        try {
            const fecha = new Date().toISOString();

            if (activeTab === 'ingreso') {
                // Calcular el monto total con el beneficio del cupón como entero
                const totalAmount = coupon ? montoNum + benefitAmount : montoNum;

                // Datos para la transacción con posible cupón
                const transaccionData = {
                    usuarioid: user.usuarioid,
                    fecha: fecha,
                    metodo: metodo,
                    monto: totalAmount, // Usar el monto total (original + beneficio)
                    cuponid: coupon ? parseInt(couponId) : undefined // Asegurar que se envíe el ID del cupón
                };

                await createIngreso(transaccionData);

                // Mensaje de éxito con información del beneficio
                if (coupon) {
                    setSuccessMessage(`Depósito exitoso: $${montoNum} + $${benefitAmount} (beneficio) = $${totalAmount}`);
                } else {
                    setSuccessMessage('Depósito registrado exitosamente');
                }
                setMessageType('success');
            } else {
                // Datos para retiro (sin cambios)
                const transaccionData = {
                    usuarioid: user.usuarioid,
                    fecha: fecha,
                    metodo: metodo,
                    monto: montoNum
                };

                await createEgreso(transaccionData);
                setSuccessMessage('Retiro solicitado exitosamente');
                setMessageType('success');
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
            setCouponId('');
            setCoupon(null);
            setBenefitAmount(0);
        } catch (error: any) {
            console.error("Error al procesar la transacción:", error);
            if (error.message) {
                setErrorMessage(`Error: ${error.message}`);
            } else {
                setErrorMessage('Error al procesar la transacción');
            }
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavBar/>
            <div className="transaccion-page">
                <div className="australis-container">
                    <h1 className="transaccion-title">Transacciones</h1>

                    {/* Mensajes de error/éxito */}
                    {errorMessage && (
                        <Message
                            message={errorMessage}
                            type={messageType}
                            onClose={() => setErrorMessage('')}
                        />
                    )}
                    {successMessage && (
                        <Message
                            message={successMessage}
                            type="success"
                            onClose={() => setSuccessMessage('')}
                        />
                    )}

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
                                <label htmlFor="monto">Monto
                                    ({activeTab === 'ingreso' ? 'a depositar' : 'a retirar'})</label>
                                <div className="monto-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        id="monto"
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        placeholder="0"
                                        min="10"
                                        step="1"
                                        onKeyDown={(e) => {
                                            // Prevent entering decimal point
                                            if (e.key === '.') {
                                                e.preventDefault();
                                            }
                                        }}
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

                            <DetalleMetodo metodo={metodo} via={activeTab === 'ingreso' ? 'Ingreso' : 'Retiro'}/>

                            {/* Añadir campo de cupón solo para ingresos (como penúltimo campo) */}
                            {activeTab === 'ingreso' && (
                                <div className="form-group">
                                    <label htmlFor="coupon">Código de Cupón (opcional)</label>
                                    <div className="coupon-input-container">
                                        <input
                                            type="text"
                                            id="coupon"
                                            value={couponId}
                                            onChange={handleCouponChange} // Usar el nuevo manejador
                                            placeholder="Ingrese ID del cupón"
                                        />
                                        <button
                                            type="button"
                                            className="validate-coupon-btn"
                                            onClick={validateCoupon}
                                            disabled={validatingCoupon || !couponId.trim()}
                                        >
                                            {validatingCoupon ? 'Validando...' : 'Validar'}
                                        </button>
                                    </div>
                                    {couponError && <p className="coupon-error">{couponError}</p>}

                                    {coupon && (
                                        <div className="coupon-details">
                                            <p className="coupon-valid">¡Cupón válido!
                                                Beneficio: {coupon.beneficio}%</p>
                                            <p className="coupon-benefit">
                                                Beneficio: ${benefitAmount}
                                            </p>
                                            <p className="total-deposit">
                                                Depósito total: ${parseInt(monto) + benefitAmount}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="cta-btn transaccion-btn"
                                disabled={loading || (activeTab === 'ingreso' && !!couponId.trim() && !isCouponValidated)}
                            >
                                {loading
                                    ? 'Procesando...'
                                    : activeTab === 'ingreso'
                                        ? 'Depositar'
                                        : 'Retirar'}
                            </button>
                        </form>

                        {/* Límites monetarios */}
                        {activeTab === 'ingreso' && monetaryLimits && (
                            <div className="limits-section">
                                <div className="limits-block">
                                    <div className="limits-block-title">Límites</div>
                                    <div className="limits-pills">
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Diario</span> ${monetaryLimits.limitediario}
                                        </span>
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Semanal</span> ${monetaryLimits.limitesemanal}
                                        </span>
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Mensual</span> ${monetaryLimits.limitemensual}
                                        </span>
                                    </div>
                                </div>
                                <div className="limits-block">
                                    <div className="limits-block-title">Usado</div>
                                    <div className="limits-pills">
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Diario</span> ${calculateCurrentUsage().daily}
                                        </span>
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Semanal</span> ${calculateCurrentUsage().weekly}
                                        </span>
                                        <span className="limits-pill">
                                            <span
                                                className="limits-pill-label">Mensual</span> ${calculateCurrentUsage().monthly}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historial de transacciones */}
                    <div className="transaccion-historial">
                        <h2>Historial de transacciones</h2>
                        {historial.length === 0 ? (
                            <div className="no-transacciones">
                                No hay transacciones registradas.
                            </div>
                        ) : (
                            <div className="historial-lista">
                                {historial.map((transaccion) => (
                                    <TransaccionItem key={transaccion.id} transaccion={transaccion}/>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Transaccion;
