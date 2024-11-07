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
exports.query = query;
const dotenv_1 = __importDefault(require("dotenv"));
const mssql_1 = __importDefault(require("mssql"));
dotenv_1.default.config();
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};
function query(queryString_1) {
    return __awaiter(this, arguments, void 0, function* (queryString, params = {}) {
        try {
            const pool = yield mssql_1.default.connect(sqlConfig);
            console.log("Conectado ao banco de dados com sucesso!");
            const request = pool.request();
            // Adiciona os parâmetros à consulta
            for (const key in params) {
                request.input(key, params[key]);
            }
            const result = yield request.query(queryString);
            console.log("Resultado da consulta:", result.recordset);
            return result;
        }
        catch (err) {
            console.error("Erro ao conectar ao banco de dados:", err);
            throw err;
        }
    });
}
