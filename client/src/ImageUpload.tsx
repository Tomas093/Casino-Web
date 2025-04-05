// ImageUpload.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface Props {
    userId: number;
    onImageUploaded?: (imageUrl: string) => void;
}

const ImageUpload: React.FC<Props> = ({ userId, onImageUploaded }) => {
    const [imagen, setImagen] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImagen(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!imagen) return alert('Selecciona una imagen');

        setIsUploading(true);
        const formData = new FormData();
        formData.append('imagen', imagen);

        try {
            const response = await axios.post(`http://localhost:3001/upload/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            console.log(response.data);
            setImageUrl(response.data.imageUrl);

            // Llamar a la función de callback si existe
            if (onImageUploaded) {
                onImageUploaded(response.data.imageUrl);
            }

            alert('Imagen subida con éxito');
        } catch (error: any) {
            console.error(error);
            alert(`Error al subir imagen: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Imagen de perfil</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            <button type="submit" disabled={isUploading}>
                {isUploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>
            {imageUrl && !onImageUploaded && (
                <div>
                    <p>Imagen subida:</p>
                    <img src={`http://localhost:3001${imageUrl}`} alt="Imagen de perfil" width="200" />
                </div>
            )}
        </form>
    );
};

export default ImageUpload;