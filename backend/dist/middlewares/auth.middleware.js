"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    dotenv_1.default.config();
    if (!authHeader) {
        return res.status(401).json({ error: "Cabeçalho de Autorização faltando" });
    }
    const token = authHeader.split(' ')[1];
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
};
exports.authenticateJWT = authenticateJWT;
