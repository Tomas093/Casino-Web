import React, {createContext, useContext, useState, ReactNode} from 'react';
import {ticketApi, Ticket, CreateTicketData} from '../api/ticketApi';

// Define the context shape
interface TicketContextType {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    createTicket: (ticketData: CreateTicketData) => Promise<void>;
    getTicketsByClientId: (clientId: number) => Promise<void>;
    getTicketsByAdminId: (adminId: number) => Promise<void>;
    clearTickets: () => void;
    clearError: () => void;
}

// Create the context with a default value
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Provider props type
interface TicketProviderProps {
    children: ReactNode;
}

// Provider component
export const TicketProvider: React.FC<TicketProviderProps> = ({children}) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createTicket = async (ticketData: CreateTicketData) => {
        setLoading(true);
        setError(null);
        try {
            const newTicket = await ticketApi.createTicket(ticketData);
            setTickets(prevTickets => [...prevTickets, newTicket]);
        } catch (err) {
            setError('Error al crear el ticket');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTicketsByClientId = async (clientId: number) => {
        setLoading(true);
        setError(null);
        try {
            const clientTickets = await ticketApi.getTicketsByClientId(clientId);
            setTickets(clientTickets);
        } catch (err) {
            setError('Error al obtener los tickets del cliente');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTicketsByAdminId = async (adminId: number) => {
        setLoading(true);
        setError(null);
        try {
            const adminTickets = await ticketApi.getTicketsByAdminId(adminId);
            setTickets(adminTickets);
        } catch (err) {
            setError('Error al obtener los tickets del administrador');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearTickets = () => setTickets([]);

    const clearError = () => setError(null);

    const value = {
        tickets,
        loading,
        error,
        createTicket,
        getTicketsByClientId,
        getTicketsByAdminId,
        clearTickets,
        clearError
    };

    return (
        <TicketContext.Provider value={value}>
            {children}
        </TicketContext.Provider>
    );
};

// Custom hook to use the ticket context
export const useTicket = (): TicketContextType => {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTicket must be used within a TicketProvider');
    }
    return context;
};