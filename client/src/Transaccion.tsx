import React, { useState, useEffect } from 'react';
import './LandingPageStyle.css';
import './TransaccionStyle.css';
import Footer from './Footer';
import NavBar from './NavBar';

// Constantes
const METODOS_INGRESO = [
    { value: 'tarjeta', label: 'Tarjeta de crédito/débito' },
    { value: 'transferencia-ingreso', label: 'Transferencia bancaria' },
    { value: 'wallet-ingreso', label: 'Billetera electrónica' },
    { value: 'cripto-ingreso', label: 'Criptomonedas' }
];

const METODOS_RETIRO = [
    { value: 'transferencia-retiro', label: 'Transferencia bancaria' },
    { value: 'wallet-retiro', label: 'Billetera electrónica' },
    { value: 'cripto-retiro', label: 'Criptomonedas' }
];

// Interfaces
interface Transaccion {
    id: number;
    tipo: 'ingreso' | 'retiro';
    monto: number;
    fecha: Date;
    estado: 'pendiente' | 'completada' | 'rechazada';
}

interface MetodoProps {
    metodo: string;
}

// Componentes de métodos de pago
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
                        navigator.clipboard.writeText('31415926535897932384626');
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
                        alert('Dirrección de billetera copiada al portapapeles');
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
const DetalleMetodo: React.FC<MetodoProps> = ({ metodo }) => {
    switch (metodo) {
        case 'tarjeta':
            return <MetodoTarjeta />;
        case 'transferencia-ingreso':
            return <MetodoTransferenciaIngreso />;
        case 'transferencia-retiro':
            return <MetodoTransferenciaRetiro />;
        case 'wallet-ingreso':
            return <MetodoWalletIngreso />;
        case 'wallet-retiro':
            return <MetodoWalletRetiro />;
        case 'cripto-ingreso':
            return <MetodoCriptoIngreso />;
        case 'cripto-retiro':
            return <MetodoCriptoRetiro />;
        default:
            return null;
    }
};

// Componente para una transacción individual en el historial
const TransaccionItem: React.FC<{ transaccion: Transaccion }> = ({ transaccion }) => {
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
        <div className={`transaccion-item ${transaccion.tipo} ${transaccion.estado}`}>
            <div className="transaccion-icon">
                {transaccion.tipo === 'ingreso' ? '↓' : '↑'}
            </div>
            <div className="transaccion-info">
                <h3>{transaccion.tipo === 'ingreso' ? 'Depósito' : 'Retiro'}</h3>
                <p className="transaccion-fecha">{formatFecha(transaccion.fecha)}</p>
                <p className="transaccion-estado">{transaccion.estado}</p>
            </div>
            <div className="transaccion-monto">
                <span>${transaccion.monto.toFixed(2)}</span>
            </div>
        </div>
    );
};

// Componente principal
const Transaccion: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ingreso' | 'retiro'>('ingreso');
    const [monto, setMonto] = useState<string>('');
    const [metodo, setMetodo] = useState<string>('tarjeta');
    const [historial, setHistorial] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Efecto para cambiar el método cuando cambia la pestaña
    useEffect(() => {
        // Al cambiar de pestaña, seleccionar automáticamente la primera opción disponible
        if (activeTab === 'ingreso') {
            setMetodo(METODOS_INGRESO[0].value); // Primera opción de ingreso ('tarjeta')
        } else {
            setMetodo(METODOS_RETIRO[0].value); // Primera opción de retiro ('transferencia-retiro')
        }
    }, [activeTab]); // Solo se ejecuta cuando cambia activeTab

    useEffect(() => {
        // Cargar datos de historial
        const transaccionesMock: Transaccion[] = [
            {id: 1, tipo: 'ingreso', monto: 100, fecha: new Date(Date.now() - 86400000), estado: 'completada'},
            {id: 2, tipo: 'retiro', monto: 50, fecha: new Date(Date.now() - 172800000), estado: 'completada'},
            {id: 3, tipo: 'ingreso', monto: 200, fecha: new Date(Date.now() - 259200000), estado: 'completada'},
        ];
        setHistorial(transaccionesMock);
    }, []);

    // Métodos
    const getMetodosDisponibles = () => {
        return activeTab === 'ingreso' ? METODOS_INGRESO : METODOS_RETIRO;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!monto || parseFloat(monto) <= 0) {
            alert('Por favor ingrese un monto válido');
            return;
        }

        setLoading(true);

        // Simulación de procesamiento
        setTimeout(() => {
            const nuevaTransaccion: Transaccion = {
                id: Date.now(),
                tipo: activeTab,
                monto: parseFloat(monto),
                fecha: new Date(),
                estado: 'pendiente'
            };

            setHistorial([nuevaTransaccion, ...historial]);
            setMonto('');
            setLoading(false);

            // Actualizar estado después de "procesamiento"
            setTimeout(() => {
                setHistorial(prev =>
                    prev.map(t => t.id === nuevaTransaccion.id ? {...t, estado: 'completada'} : t)
                );
            }, 3000);
        }, 1500);
    };

    return (
        <>
            <NavBar />
            <div className="transaccion-page">
                <div className="australis-container">
                    <h1 className="transaccion-title">Transacciones</h1>

                    {/* Tabs de navegación */}
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

                    {/* Formulario de transacción */}
                    <div className="transaccion-form-container">
                        <form onSubmit={handleSubmit} className="transaccion-form">
                            <h2>{activeTab === 'ingreso' ? 'Realizar un depósito' : 'Solicitar un retiro'}</h2>

                            {/* Campo de monto */}
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

                            {/* Selector de método */}
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

                            {/* Detalle del método seleccionado */}
                            <DetalleMetodo metodo={metodo} />

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                className="cta-btn transaccion-btn"
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : activeTab === 'ingreso' ? 'Depositar' : 'Retirar'}
                            </button>
                        </form>
                    </div>

                    {/* Historial de transacciones */}
                    <div className="transaccion-historial">
                        <h2>Historial de transacciones</h2>

                        {historial.length === 0 ? (
                            <p className="no-transacciones">No hay transacciones para mostrar</p>
                        ) : (
                            <div className="historial-lista">
                                {historial.map((transaccion) => (
                                    <TransaccionItem key={transaccion.id} transaccion={transaccion} />
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