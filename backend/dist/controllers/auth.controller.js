"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.message = exports.users = exports.register = exports.login = void 0;
const DB_1 = require("../models/DB");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Email e senha são obrigatórios" });
    }
    try {
        const result = yield (0, DB_1.query)(`SELECT * FROM users WHERE email = @Email`, { Email: email });
        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Email ou senha inválidos' });
        }
        const user = result.recordset[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ error: "Email ou senha inválidos" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        return res.status(200).json({ token });
    }
    catch (error) {
        console.error("Erro ao processar login:", error);
        return res.status(500).json({ error: "Erro ao processar login" });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, password_confirmation } = req.body;
    if (!name || !email || !password || !password_confirmation) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    try {
        const result = yield (0, DB_1.query)(`SELECT * FROM users WHERE email = @Email`, { Email: email });
        if (result.recordset.length > 0) {
            return res.status(400).json({ error: "E-mail já cadastrado" });
        }
        if (password !== password_confirmation) {
            return res.status(400).json({ error: "password e password_confirmation devem coincidir" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield (0, DB_1.query)(`INSERT INTO users (name, email, password) VALUES (@Name, @Email, @Password)`, {
            Name: name,
            Email: email,
            Password: hashedPassword
        });
        return res.status(201).json({ message: 'Usuário criado com sucesso' });
    }
    catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return res.status(500).json({ error: "Erro ao criar usuário" });
    }
});
exports.register = register;
const users = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, DB_1.query)(`SELECT * FROM users`);
        return res.status(200).json(result.recordset);
    }
    catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});
exports.users = users;
const message = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, sender, content } = req.body;
    if (!to || !sender || !content) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    try {
        yield (0, DB_1.query)(`INSERT INTO t_mensagens (idUserDe, idUserPara, mensagem) VALUES (@FromUserId, @ToUserId, @Message)`, {
            FromUserId: sender.id,
            ToUserId: to.id,
            Message: content
        });
        return res.status(201).json({ message: 'Mensagem enviada com sucesso' });
    }
    catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
});
exports.message = message;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, DB_1.query)(`
      SELECT 
        idUserDe,
        u.name as nameUserDe,
        idUserPara,
        u2.name as nameUserPara,
        mensagem
      FROM t_mensagens m
      left JOIN users u  ON m.idUserDe   = u.id
      left JOIN users u2 ON m.idUserPara = u2.id
      order by
        m.id
    `);
        return res.status(200).json(result.recordset);
    }
    catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        return res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
});
exports.getMessages = getMessages;
