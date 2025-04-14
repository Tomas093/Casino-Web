import React, {useState, FormEvent} from 'react';

// Tipos de campos soportados
type FieldType = 'text' | 'email' | 'password' | 'number';

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
}

// Props del componente
interface FormProps {
    title?: string;
    subtitle?: string;
    fields: FieldConfig[];
    submitButtonText?: string;
    termsText?: React.ReactNode;
    onSubmit: (formData: Record<string, string>) => void;
}

const Form: React.FC<FormProps> = ({
                                       title = "Australis",
                                       subtitle = "Crea tu cuenta",
                                       fields,
                                       submitButtonText = "Crear Cuenta",
                                       termsText,
                                       onSubmit
                                   }) => {
    // Estado del formulario dinámico
    const [formData, setFormData] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};
        fields.forEach(field => {
            initialState[field.name] = '';
        });
        return initialState;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    </label>
                ))}
                <button type="submit" className="btn">{submitButtonText}</button>
            </form>
            {termsText && <p className="terms">{termsText}</p>}
        </div>
    );
};

export default Form;