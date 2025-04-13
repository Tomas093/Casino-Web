import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';


interface Props {
    userId: number;
    onImageUploaded?: (imageUrl: string) => void;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Imagen de perfil</label>
                <Button
                    component="label"
                    variant="contained"
                    sx={{
                        backgroundColor: '#FFD700',
                        color: 'black',
                        '&:hover': {
                            backgroundColor: '#FFC107',
                        },
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                    }}
                >
                    <CloudUploadIcon sx={{ verticalAlign: 'middle', fontSize: '1.2rem', marginRight: '8px' }} />
                    Seleccionar imagen
                    <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </Button>
            </div>

            <button type="submit" disabled={isUploading}>
                {isUploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>

            {imageUrl && !onImageUploaded && (
                <div style={{ marginTop: '1rem' }}>
                    <p>Imagen subida:</p>
                    <img src={`http://localhost:3001${imageUrl}`} alt="Imagen de perfil" width="200" />
                </div>
            )}
        </form>
    );
};

export default ImageUpload;