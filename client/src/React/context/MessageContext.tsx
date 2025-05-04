import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {messageApi} from "@api/messageApi.ts";

interface MessageContextType {
    messages: any[];
    createMessage: (messageData: any) => Promise<void>;
    getMessagesByTicketId: (ticketId: number) => Promise<void>;
    editMessage: (messageId: number, messageData: any) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);
export const MessageProvider = ({children}: { children: ReactNode }) => {
    const [messages, setMessages] = useState<any[]>([]);

    const createMessage = useCallback(async (messageData: any) => {
        try {
            const newMessage = await messageApi.createMessage(messageData);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (error) {
            console.error('Error creating message:', error);
        }
    }, []);

    const getMessagesByTicketId = useCallback(async (ticketId: number) => {
        try {
            const fetchedMessages = await messageApi.getMessagesByTicketId(ticketId);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const editMessage = useCallback(async (messageId: number, messageData: any) => {
        try {
            const updatedMessage = await messageApi.editMessage(messageId, messageData);
            setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.mensajeid === messageId ? updatedMessage : msg))
            );
        } catch (error) {
            console.error('Error updating message:', error);
        }
    }, []);

    return (
        <MessageContext.Provider value={{messages, createMessage, getMessagesByTicketId, editMessage}}>
            {children}
        </MessageContext.Provider>
    );
};
export const useMessageContext = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessageContext must be used within a MessageProvider');
    }
    return context;
};