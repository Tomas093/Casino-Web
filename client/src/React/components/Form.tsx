import React, {FormEvent, useState} from 'react';

// Tipos de campos soportados
type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';

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
    footerText?: React.ReactNode; // Optional footer text
}

const Form: React.FC<FormProps> = ({
                                       title = "Australis",
                                       subtitle = "Crea tu cuenta",
                                       fields,
                                       submitButtonText = "Crear Cuenta",
                                       termsText,
                                       onSubmit,
                                       footerText
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

    return (
        <div className="register-container">
            {title && <h1>{title}</h1>}
            {subtitle && <h2>{subtitle}</h2>}
            <form id="register-form" onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <label key={index}>
                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                className="input-field"
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
                                className="input-field"
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
                                className="input-field"
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
                    </label>
                ))}
                <button type="submit" className="form-button">{submitButtonText}</button>
            </form>
            {termsText && <p className="terms">{termsText}</p>}
            {footerText && <div className="form-footer">{footerText}</div>}
        </div>
    );
};

export default Form;