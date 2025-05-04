import React, {createContext, ReactNode, useContext, useState} from 'react';
import {CreateTicketData, Ticket, ticketApi} from '../api/ticketApi';

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
    getTicketById: (ticketId: number) => Promise<Ticket>;
    editTicket: (ticketId: number, ticketData: Partial<Ticket>) => Promise<void>;
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

    const getTicketById = async (ticketId: number) => {
        setLoading(true);
        setError(null);
        try {
            const ticket = await ticketApi.getTicketById(ticketId);
            return ticket; // Return the fetched ticket
        } catch (err) {
            setError('Error al obtener el ticket');
            console.error(err);
            throw err; // Throw error to handle it in the component
        } finally {
            setLoading(false);
        }
    };

    const editTicket = async (ticketId: number, ticketData: Partial<Ticket>) => {
        setLoading(true);
        setError(null);
        try {
            const updatedTicket = await ticketApi.editTicket(ticketId, ticketData);
            setTickets(prevTickets =>
                prevTickets.map(ticket => (ticket.ticketid === ticketId ? updatedTicket : ticket))
            );
        } catch (err) {
            setError('Error al editar el ticket');
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
        clearError,
        getTicketById,
        editTicket
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
