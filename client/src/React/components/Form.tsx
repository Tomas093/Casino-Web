import React, {FormEvent, useState} from 'react';

// Tipos de campos soportados
type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';

// Configuración de cada campo
interface FieldConfig {
    name: string;
    type: FieldType;
    placeholder: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    options?: string[]; // Opciones para campos tipo select
}

// Props del componente
interface FormProps {
    title?: string;
    subtitle?: string;
    fields: FieldConfig[];
    submitButtonText?: string;
    termsText?: React.ReactNode;
    onSubmit: (formData: Record<string, string>) => void;
    errorMessage?: string;
    footerText?: React.ReactNode;
    showGoogleButton?: boolean; // Nueva prop
    onGoogleLogin?: () => void; // Nueva prop
    googleButtonText?: string; // Nueva prop
}

const Form: React.FC<FormProps> = ({
                                       title = "Australis",
                                       subtitle = "Crea tu cuenta",
                                       fields,
                                       submitButtonText = "Crear Cuenta",
                                       termsText,
                                       onSubmit,
                                       footerText,
                                       showGoogleButton = false,
                                       onGoogleLogin,
                                       googleButtonText = "Continuar con Google"
                                   }) => {
    // Estado del formulario dinámico
    const [formData, setFormData] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};
        fields.forEach(field => {
            initialState[field.name] = '';
        });
        return initialState;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleGoogleClick = () => {
        if (onGoogleLogin) {
            onGoogleLogin();
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                {title && <h1 className="login-title">{title}</h1>}
                {subtitle && <h2 className="login-subtitle">{subtitle}</h2>}

                {/* Botón de Google */}
                {showGoogleButton && (
                    <>
                        <button
                            type="button"
                            onClick={handleGoogleClick}
                            className="google-button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285f4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {googleButtonText}
                        </button>

                        <div className="divider">
                            <span>O ingresa con email</span>
                        </div>
                    </>
                )}

                {/* Formulario tradicional */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {fields.map((field, index) => (
                        <div key={index} className="form-group">
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    className="form-control"
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    minLength={field.minLength}
                                    maxLength={field.maxLength}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    className="form-control"
                                    required={field.required}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>{field.placeholder}</option>
                                    {field.options?.map((option, idx) => (
                                        <option key={idx} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    className="form-control"
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    minLength={field.minLength}
                                    maxLength={field.maxLength}
                                    min={field.min}
                                    max={field.max}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                />
                            )}
                        </div>
                    ))}

                    <button type="submit" className="submit-button">
                        {submitButtonText}
                    </button>
                </form>

                {/* Términos y condiciones */}
                {termsText && <div className="terms">{termsText}</div>}

                {/* Footer */}
                {footerText && <div className="form-footer">{footerText}</div>}
            </div>
        </div>
    );
};

export default Form;