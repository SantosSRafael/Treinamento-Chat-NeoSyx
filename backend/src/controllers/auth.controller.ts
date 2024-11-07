import { Request, Response } from "express";
import { query } from "../models/DB";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  
  if (!email || !password) {
    return res.status(422).json({ error: "Email e senha são obrigatórios" });
  }

  try {
  
    const result = await query(`SELECT * FROM users WHERE email = @Email`, { Email: email });
  
    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Email ou senha inválidos' });
    }

    const user = result.recordset[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(422).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Erro ao processar login:", error);
    return res.status(500).json({ error: "Erro ao processar login" });
  }
};

const register = async (req: Request, res: Response) => {
  const { name, email, password, password_confirmation } = req.body;

  if (!name || !email || !password || !password_confirmation) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const result = await query(`SELECT * FROM users WHERE email = @Email`, { Email: email });
    if (result.recordset.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ error: "password e password_confirmation devem coincidir" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(`INSERT INTO users (name, email, password) VALUES (@Name, @Email, @Password)`, {
      Name: name,
      Email: email,
      Password: hashedPassword
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

const users = async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM users`);
    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

const message = async (req: Request, res: Response) => {
  const { to, sender, content } = req.body;

  if (!to || !sender || !content) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    await query(`INSERT INTO t_mensagens (idUserDe, idUserPara, mensagem) VALUES (@FromUserId, @ToUserId, @Message)`, {
      FromUserId: sender.id,
      ToUserId: to.id,
      Message: content
    });

    return res.status(201).json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
};

const getMessages = async (req: Request, res: Response) => {
  try {
    const result = await query(`
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
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
};

export { login, register, users, message, getMessages };
