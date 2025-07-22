import React, {FormEvent, useState} from 'react';
import {CredentialResponse, GoogleLogin} from "@react-oauth/google";

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
    showGoogleButton?: boolean;
    onGoogleSuccess?: (credentialResponse: CredentialResponse) => void;
    onGoogleError?: () => void;
    googleButtonText?: string;
    // Nuevas props para clases CSS customizables
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    formClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    termsClassName?: string;
    containerClassName?: string;
    pageClassName?: string;
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
                                       onGoogleSuccess,
                                       onGoogleError,
                                       className = "container",
                                       titleClassName = "login-title",
                                       subtitleClassName = "login-subtitle",
                                       formClassName = "login-form",
                                       inputClassName = "form-control",
                                       buttonClassName = "submit-button",
                                       termsClassName = "terms",
                                       containerClassName = "container",
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

    // Handlers for Google OAuth with fallbacks
    const handleGoogleSuccess = (response: CredentialResponse) => {
        if (onGoogleSuccess) {
            onGoogleSuccess(response);
        }
    };

    const handleGoogleError = () => {
        if (onGoogleError) {
            onGoogleError();
        } else {
            console.error("Google login failed");
        }
    };

    return (
        <div className={className || containerClassName}>
            {title && <h1 className={titleClassName}>{title}</h1>}
            {subtitle && <h2 className={subtitleClassName}>{subtitle}</h2>}

            {/* Botón de Google */}
            {showGoogleButton && (
                <>
                    <div className="google-button-container">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="continue_with"
                            shape="circle"
                            logo_alignment="center"
                            width={1000}
                        />
                    </div>
                    <div className="divider">
                        <span>O ingresa con email</span>
                    </div>
                </>
            )}

            {/* Formulario tradicional */}
            <form className={formClassName} onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index} className="form-group">
                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                className={inputClassName}
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
                                className={inputClassName}
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
                                className={inputClassName}
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

                <button type="submit" className={buttonClassName}>
                    {submitButtonText}
                </button>
            </form>

            {/* Términos y condiciones */}
            {termsText && <div className={termsClassName}>{termsText}</div>}

            {/* Footer */}
            {footerText && <div className="form-footer">{footerText}</div>}
        </div>
    );
};

export default Form;