import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@context/AuthContext';
import {useLimitContext} from '@context/LimitContext';
import Sidebar from '@components/SideBar.tsx';
import limitApi from '@api/limitApi.ts';
import '@css/ProfileStyle.css';
import '@css/LimitStyle.css';

interface LocationState {
  category: 'time' | 'money';
  period: 'daily' | 'weekly' | 'monthly';
  currentValue: number;
  increment: number;
}

const MonLimitTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getLimitHorario, getLimitMonetario } = useLimitContext();
  
  const [email, setEmail] = useState('');
  const [newLimit, setNewLimit] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Get the state passed from the LimitPage
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    
    if (state?.currentValue) {
      // Set initial new limit to current value plus the increment
      setNewLimit(state.currentValue + (state.increment || 0));
    }
  }, [user, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.usuarioid || !state) {
      setMessage({ type: 'error', text: 'Información de usuario o límite no disponible' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a ticket record (for tracking purposes)
      // This would be handled by an API call in a real implementation
      const ticketData = {
        userId: user.usuarioid,
        email,
        category: state.category,
        period: state.period,
        oldLimit: state.currentValue,
        newLimit,
        reason,
        status: 'approved', // Auto-approve for this implementation
        date: new Date().toISOString()
      };
      
      console.log('Ticket submitted:', ticketData);
      
      // Actually update the limit based on category and period
      if (state.category === 'time') {
        const timeLimits = await getLimitHorario(user.usuarioid);
        const currentLimits = timeLimits.length > 0 ? timeLimits[0] : {};
        
        await limitApi.updateLimitHorario(parseInt(user.usuarioid.toString()), {
          ...currentLimits,
          [state.period === 'daily' ? 'limitediario' : 
           state.period === 'weekly' ? 'limitesemanal' : 'limitemensual']: newLimit
        });
      } else {
        const moneyLimits = await getLimitMonetario(user.usuarioid);
        const currentLimits = moneyLimits.length > 0 ? moneyLimits[0] : {};
        
        await limitApi.updateLimitMonetario(parseInt(user.usuarioid.toString()), {
          ...currentLimits,
          [state.period === 'daily' ? 'limitediario' : 
           state.period === 'weekly' ? 'limitesemanal' : 'limitemensual']: newLimit
        });
      }
      
      setMessage({ type: 'success', text: 'Límite actualizado correctamente' });
      
      // Navigate to /limit page after successful update
      setTimeout(() => {
        navigate('/limit');
      }, 2000);
    } catch (error) {
      console.error('Error updating limit:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el límite' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCategory = (category?: 'time' | 'money') => {
    return category === 'time' ? 'tiempo' : 'dinero';
  };
  
  const formatPeriod = (period?: 'daily' | 'weekly' | 'monthly') => {
    switch (period) {
      case 'daily': return 'diario';
      case 'weekly': return 'semanal';
      case 'monthly': return 'mensual';
      default: return '';
    }
  };
  
  const formatValue = (category?: 'time' | 'money', value: number = 0) => {
    if (category === 'time') {
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
      }
      return `${value}m`;
    } else {
      return `${value} AC`;
    }
  };

  // Add this handler to safely parse numeric input
  const handleNumericInput = (value: string): number => {
    // If the input is empty, return 0 or the minimum allowed value
    if (value === '') {
      return state?.currentValue || 0;
    }
    
    const parsedValue = parseInt(value);
    // Return the parsed value if it's a valid number, otherwise return the current minimum
    return !isNaN(parsedValue) ? parsedValue : state?.currentValue || 0;
  };

  return (
    <div className="container">
      <Sidebar />
      <main className="main-content">
        <div className="profile-container">
          <div className="settings-section">
            <div className="section-header">
              <h2>Solicitud de aumento de límite</h2>
            </div>
            
            {message && (
              <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                {message.text}
              </div>
            )}
            
            <div className="limit-container">
              <form onSubmit={handleSubmit} className="limit-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={!!user?.email}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="limitType">Tipo de límite</label>
                  <input 
                    type="text" 
                    id="limitType" 
                    value={`${formatCategory(state?.category)} ${formatPeriod(state?.period)}`} 
                    disabled 
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="currentLimit">Límite actual</label>
                  <input 
                    type="text" 
                    id="currentLimit" 
                    value={formatValue(state?.category, state?.currentValue)} 
                    disabled 
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newLimit">Nuevo límite</label>
                  <input 
                    type="number" 
                    id="newLimit" 
                    value={newLimit} 
                    onChange={(e) => setNewLimit(handleNumericInput(e.target.value))} 
                    min={state?.currentValue || 0}
                    required 
                    className="form-input"
                  />
                  <small className="form-hint">*El nuevo límite debe ser mayor que el límite actual</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="reason">¿Por qué quieres aumentar el límite?</label>
                  <textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    required 
                    rows={4}
                    className="form-textarea"
                  />
                </div>
                
                <div className="button-group">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => navigate('/limit')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    type="submit" 
                    className="save-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonLimitTicketPage;

