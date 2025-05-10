import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import faqApi from '@api/faqApi.ts';

interface FaqContextType {
    isLoading: boolean;
    getAllFAQs: () => Promise<any>;
    createFAQ: (faqData: { pregunta: string; respuesta: string,categoria:string}) => Promise<any>;
    updateFAQ: (faqId: string, faqData: { pregunta: string; respuesta: string, categoria: string }) => Promise<any>;
    deleteFAQ: (faqId: string) => Promise<any>;
    getFAQsByCategory: (category: string) => Promise<any>;
    getFAQByQuestion: (question: string) => Promise<any>;
}


interface FaqProviderProps {
    children: ReactNode;
}

const FAQContext = createContext<FaqContextType | null>(null);

export const FAQProvider = ({children}: FaqProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchAllFAQs = useCallback(async () => {
        setIsLoading(true);
        try {
            return await faqApi.getAllFAQs();
        } catch (error) {
            console.error('Error al obtener las preguntas frecuentes:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addFAQ = useCallback(async (faqData: { pregunta: string; respuesta: string, categoria: string }) => {
        setIsLoading(true);
        try {
            return await faqApi.createFAQ(faqData);
        } catch (error) {
            console.error('Error al crear la pregunta frecuente:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const modifyFAQ = useCallback(async (faqId: string, faqData: { pregunta: string; respuesta: string, categoria: string }) => {
        setIsLoading(true);
        try {
            return await faqApi.updateFAQ(faqId, faqData);
        } catch (error) {
            console.error('Error al actualizar la pregunta frecuente:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeFAQ = useCallback(async (faqId: string) => {
        setIsLoading(true);
        try {
            return await faqApi.deleteFAQ(faqId);
        } catch (error) {
            console.error('Error al eliminar la pregunta frecuente:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFAQsByCategory = useCallback(async (category: string) => {
        setIsLoading(true);
        try {
            return await faqApi.getFAQsByCategory(category);
        } catch (error) {
            console.error('Error al obtener las preguntas frecuentes por categoría:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFAQByQuestion = useCallback(async (question: string) => {
        setIsLoading(true);
        try {
            return await faqApi.getFAQByQuestion(question);
        } catch (error) {
            console.error('Error al obtener la pregunta frecuente por pregunta:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <FAQContext.Provider
            value={{
                isLoading,
                getAllFAQs: fetchAllFAQs,
                createFAQ: addFAQ,
                updateFAQ: modifyFAQ,
                deleteFAQ: removeFAQ,
                getFAQsByCategory: fetchFAQsByCategory,
                getFAQByQuestion: fetchFAQByQuestion
            }}
        >
            {children}
        </FAQContext.Provider>
    );
}
export const useFaq = () => {
    const context = useContext(FAQContext);
    if (!context) {
        throw new Error('useFaqContext must be used within a FaqProvider');
    }
    return context;
};