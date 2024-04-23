import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
const PORT: number = 8080;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

const connectedDevices: string[] = [];

io.on("connection", (socket: Socket) => {
    socket.emit("me", socket.id);

    connectedDevices.push(socket.id);

    io.emit("devices", connectedDevices);

    socket.on("disconnect", () => {
        const index = connectedDevices.indexOf(socket.id);
        if (index !== -1) {
            connectedDevices.splice(index, 1);
        }
        io.emit("devices", connectedDevices);
        socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", (data: { userToCall: string, signalData: any, from: string, name: string }) => {
        const { userToCall, signalData, from, name } = data;
        io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data: { to: string, signal: any }) => {
        const { to, signal } = data;
        io.to(to).emit("callAccepted", signal);
    });
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

