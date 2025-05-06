import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:3001/ticket'; // Adjust according to your server URL

// Ticket interface based on the Prisma schema
export interface Ticket {
    ticketid?: number;
    clienteid?: number | null;
    problema?: string | null;
    resuelto?: boolean | null;
    adminid?: number | null;
    fechacreacion?: Date | null;
    fechacierre?: Date | null;
    prioridad?: string | null;
    categoria?: string | null;
}

// Type for creating a new ticket
export interface CreateTicketData {
    clienteid: number;
    problema: string;
    prioridad?: string;
    categoria?: string;
}

export const ticketApi = {
    // Create a new ticket
    async createTicket(ticketData: CreateTicketData): Promise<Ticket> {
        try {
            const response = await axios.post(`${API_URL}/create`, ticketData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    },

    // Get tickets by client ID
    async getTicketsByClientId(clientId: number): Promise<Ticket[]> {
        try {
            const response = await axios.get(`${API_URL}/client/${clientId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching client tickets:', error);
            throw error;
        }
    },


    // Get tickets by admin ID
    async getTicketsByAdminId(adminId: number): Promise<Ticket[]> {
        try {
            const response = await axios.get(`${API_URL}/admin/${adminId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching admin tickets:', error);
            throw error;
        }
    },

    // Edit a ticket
    async editTicket(ticketId: number, ticketData: Partial<Ticket>): Promise<Ticket> {
        try {
            const response = await axios.put(`${API_URL}/edit/${ticketId}`, ticketData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error editing ticket:', error);
            throw error;
        }
    },

    // Get a ticket by ID
    async getTicketById(ticketId: number): Promise<Ticket> {
        try {
            const response = await axios.get(`${API_URL}/${ticketId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw error;
        }
    }


};