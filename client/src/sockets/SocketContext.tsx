import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {socket} from "./socket.ts";

interface SocketContextType {
    socket: typeof socket;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket debe usarse dentro de <SocketProvider>");
    }
    return context;
};

export const SocketProvider = ({children}: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Conectado al servidor:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("❌ Desconectado del servidor");
            setIsConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return (
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
    );
};