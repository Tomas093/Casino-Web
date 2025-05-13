import {useEffect, useState} from 'react';
import {useLimitContext} from '@context/LimitContext';
import '@css/ChangeLimitStyle.css';

interface ChangeLimitsProps {
    clienteId: number;
}

interface Limits {
    daily: number;
    weekly: number;
    monthly: number;
}

const ChangeLimits = ({clienteId}: ChangeLimitsProps) => {
    const {
        isLoading,
        getLimitHorarioByClienteId,
        getLimitMonetarioByClienteId,
        updateLimitHorarioByClienteId,
        updateLimitMonetarioByClienteId
    } = useLimitContext();

    const [currentHorario, setCurrentHorario] = useState<Limits>({daily: 0, weekly: 0, monthly: 0});
    const [currentMonetario, setCurrentMonetario] = useState<Limits>({daily: 0, weekly: 0, monthly: 0});
    const [newHorario, setNewHorario] = useState<Limits>({daily: 0, weekly: 0, monthly: 0});
    const [newMonetario, setNewMonetario] = useState<Limits>({daily: 0, weekly: 0, monthly: 0});
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchLimits = async () => {
            try {
                const horarioRes = await getLimitHorarioByClienteId(clienteId);
                const monetarioRes = await getLimitMonetarioByClienteId(clienteId);
                const horario = {
                    daily: horarioRes[0]?.limitediario ?? 0,
                    weekly: horarioRes[0]?.limitesemanal ?? 0,
                    monthly: horarioRes[0]?.limitemensual ?? 0,
                };
                const monetario = {
                    daily: Number(monetarioRes[0]?.limitediario ?? 0),
                    weekly: Number(monetarioRes[0]?.limitesemanal ?? 0),
                    monthly: Number(monetarioRes[0]?.limitemensual ?? 0),
                };
                setCurrentHorario(horario);
                setCurrentMonetario(monetario);
                setNewHorario(horario);
                setNewMonetario(monetario);
            } catch (e) {
                setMessage({type: 'error', text: 'Error loading limits'});
            }
        };
        fetchLimits();
    }, [clienteId, getLimitHorarioByClienteId, getLimitMonetarioByClienteId]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateLimitHorarioByClienteId(clienteId, {
                limitediario: newHorario.daily,
                limitesemanal: newHorario.weekly,
                limitemensual: newHorario.monthly,
            });
            await updateLimitMonetarioByClienteId(clienteId, {
                limitediario: newMonetario.daily,
                limitesemanal: newMonetario.weekly,
                limitemensual: newMonetario.monthly,
            });
            setMessage({type: 'success', text: 'Limits updated successfully'});
            setEditing(false);
            setCurrentHorario(newHorario);
            setCurrentMonetario(newMonetario);
        } catch (e) {
            setMessage({type: 'error', text: 'Error updating limits'});
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (
        type: 'horario' | 'monetario',
        period: keyof Limits,
        value: number
    ) => {
        if (type === 'horario') {
            setNewHorario(prev => ({...prev, [period]: value}));
        } else {
            setNewMonetario(prev => ({...prev, [period]: value}));
        }
    };

    return (
        <div className="limit-info">
            <h3>Change User Limits</h3>
            {isLoading ? (
                <div className="loading-indicator">Loading...</div>
            ) : (
                <form>
                    <div className="limits-flex-container">
                        <fieldset disabled={!editing || saving}>
                            <legend>Time Limits (minutes)</legend>
                            <div>
                                <label>Daily:</label>
                                <span className="current-value">Current: {currentHorario.daily}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newHorario.daily}
                                    onChange={e => handleChange('horario', 'daily', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Weekly:</label>
                                <span className="current-value">Current: {currentHorario.weekly}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newHorario.weekly}
                                    onChange={e => handleChange('horario', 'weekly', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Monthly:</label>
                                <span className="current-value">Current: {currentHorario.monthly}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newHorario.monthly}
                                    onChange={e => handleChange('horario', 'monthly', Number(e.target.value))}
                                />
                            </div>
                        </fieldset>
                        <fieldset disabled={!editing || saving}>
                            <legend>Money Limits (AC)</legend>
                            <div>
                                <label>Daily:</label>
                                <span className="current-value">Current: {currentMonetario.daily}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newMonetario.daily}
                                    onChange={e => handleChange('monetario', 'daily', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Weekly:</label>
                                <span className="current-value">Current: {currentMonetario.weekly}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newMonetario.weekly}
                                    onChange={e => handleChange('monetario', 'weekly', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Monthly:</label>
                                <span className="current-value">Current: {currentMonetario.monthly}</span>
                                <input
                                    type="number"
                                    className="limit-input"
                                    value={newMonetario.monthly}
                                    onChange={e => handleChange('monetario', 'monthly', Number(e.target.value))}
                                />
                            </div>
                        </fieldset>
                    </div>
                    {message && (
                        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                            {message.text}
                        </div>
                    )}
                    {editing ? (
                        <button
                            type="button"
                            className="save-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="edit-btn"
                            onClick={() => setEditing(true)}
                        >
                            Edit
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};

export default ChangeLimits;