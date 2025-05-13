import React, {useState} from 'react';
import {Button} from '@mui/material';

export interface FormFieldProps {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'checkbox';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    defaultValue?: string | number;
}

interface GenericFormCreatorProps {
    title: string;
    fields: FormFieldProps[];
    onSubmit: (formData: Record<string, any>) => Promise<void>;
    columns?: 1 | 2 | 3 | 4;
    submitButtonText?: string;
}

const GenericABM: React.FC<GenericFormCreatorProps> = ({
                                                           title,
                                                           fields,
                                                           onSubmit,
                                                           columns = 2,
                                                           submitButtonText = "Create",
                                                       }) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    const handleInputChange = (id: string, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await onSubmit(formValues);
            // Reset form after successful submission
            setFormValues({});
            (event.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="generic-form-container">
            <h3 className="form-title">{title}</h3>
            <form onSubmit={handleSubmit} className="generic-form">
                <div className={`form-grid form-grid-${columns}-columns`}>
                    {fields.map((field) => (
                        <div className="form-group" key={field.id}>
                            <label htmlFor={field.id}>{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    name={field.id}
                                    id={field.id}
                                    required={field.required}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    defaultValue={field.defaultValue}
                                >
                                    {field.options &&
                                        field.options.map((option, i) => (
                                            <option key={i} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                </select>
                            ) : field.type === 'checkbox' ? (
                                <input
                                    type="checkbox"
                                    id={field.id}
                                    name={field.id}
                                    checked={!!formValues[field.id]}
                                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                                    defaultChecked={Boolean(field.defaultValue)}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    name={field.id}
                                    id={field.id}
                                    required={field.required}
                                    onChange={(e) =>
                                        handleInputChange(
                                            field.id,
                                            field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                                        )
                                    }
                                    defaultValue={field.defaultValue}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="form-actions">
                    <Button type="submit" variant="contained" color="primary" className="submit-button">
                        {submitButtonText}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default GenericABM;