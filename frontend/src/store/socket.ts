import { environment, SOCKET_URL } from "@/config";
import { SocketBroadcastMessage, SocketOnlineUser, SocketPrivateMessage } from "@/types/next";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

type EmitModeDataTypes = {
    join: SocketOnlineUser;
    broadcast: SocketBroadcastMessage;
    private_message: SocketPrivateMessage;
};

type Store = {
    socket: null | Socket;
    emitMode: keyof EmitModeDataTypes;
    setEmitMode: (mode: keyof EmitModeDataTypes) => void;
    emit: <T extends keyof EmitModeDataTypes>(event: T, data: EmitModeDataTypes[T]) => void;
    connect: () => void;
    disconnect: () => void;
};

const useSocketStore = create<Store>((set, get) => {
    return {
        socket: null,
        emitMode: "broadcast",
        setEmitMode: (mode) => {
            set({ emitMode: mode });
        },
        /**
         * Emits an event with data.
         *
         * @param event - The name of the event to emit.
         * @param data - The data to send along with the event.
         */
        emit: (event, data) => {
            const { socket } = get();
            if (!socket) return toast.error("Socket not connected");
            // This callback response needs to define on server at first.
            // Emit the event with the data and handle the response
            socket.emit(event, data, (response: { ok: boolean }) => {
                // Display an error message if response.ok is false
                if (!response.ok) toast.error("Something went wrong");
            });
        },
        /**
         * Connects to the socket server.
         */
        connect: () => {
            const { socket: existingSocket } = get();
            if (SOCKET_URL === undefined) {
                // Display error message if socket URL is undefined
                return toast.error("Socket URL is undefined");
            }
            if (existingSocket?.connected) {
                console.log("Socket already connected", existingSocket);
                return;
            }

            console.log("Connecting to socket", SOCKET_URL);
            const options = {
                path: "/socket.io",
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                forceNew: true,
                autoConnect: true,
            };

            const socket = io(SOCKET_URL, options);

            socket
                .on("connect", () => {
                    console.log("SOCKET CONNECTED!", socket.id);
                    // Update the socket in the global state when connected
                    set({ socket });
                    toast.success("Connected to server");
                })
                .on("disconnect", () => {
                    console.log("SOCKET DISCONNECTED!");
                    // Set socket to null in the global state when disconnected
                    set({ socket: null });
                    toast.error("Disconnected from server");
                })
                .on("connect_error", (error) => {
                    console.log("Connection error:", error);
                    toast.error("Failed to connect to server");
                });
        },
        /**
         * Disconnects the socket if it is connected.
         * If the socket is not connected, displays an error message.
         */
        disconnect: () => {
            const { socket } = get();
            if (socket) {
                socket.disconnect();
                set({ socket: null });
            } else {
                toast.error("Socket not connected");
            }
        },
    };
});

export default useSocketStore;
