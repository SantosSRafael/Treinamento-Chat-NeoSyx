"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const express_2 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const router = (0, express_2.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "http://localhost:3000" } });
const corsOptions = {
    origin: '*'
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
router.use('/api', routes_1.default);
dotenv_1.default.config();
app.use(router);
const connectedUsers = new Map();
io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    if (!user) {
        return next(new Error('Usuário Inválido'));
    }
    /* @ts-expect-error: */
    socket.username = user.name;
    /* @ts-expect-error: */
    socket.userId = user.id;
    next();
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    /* @ts-expect-error: */
    connectedUsers.set(socket.userId, socket.username);
    io.emit('users-online', Array.from(connectedUsers, ([id, name]) => ({ id, name })));
    socket.on('join-room', (room) => {
        socket.join(room);
    });
    socket.on('message', ({ to, message }) => {
        /* @ts-expect-error: */
        const from = connectedUsers.get(socket.userId);
        if (!from || !connectedUsers.get(to.id)) {
            return;
        }
        console.log(message);
        io.to(to.id).emit('message', message);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        /* @ts-expect-error: */
        connectedUsers.delete(socket.userId);
        io.emit('users-online', Array.from(connectedUsers, ([id, name]) => ({ id, name })));
    });
});
server.listen(process.env.APP_PORT, () => {
    console.log('Server is running on http://localhost:' + process.env.APP_PORT);
});
