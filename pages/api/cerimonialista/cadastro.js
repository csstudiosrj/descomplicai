import { withRateLimit, cadastroLimiter } from "../../../lib/ratelimit";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { nome, email, telefone, senha, cidade, estado } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    // Verificar se email já existe
    const { data: existente } = await supabase
      .from("cerimonialistas")
      .select("id")
      .eq("email", email)
      .single();

    if (existente) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar cerimonialista
    const { data, error } = await supabase
      .from("cerimonialistas")
      .insert({
        nome,
        email,
        telefone: telefone || null,
        senha_hash: senhaHash,
        cidade: cidade || null,
        estado: estado || null,
        status: "ativo",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Remover senha_hash da resposta
    const { senha_hash, ...cerimonialista } = data;

    return res.status(201).json({
      success: true,
      cerimonialista,
    });
  } catch (error) {
    console.error("[Cadastro Cerimonialista] Erro:", error);
    return res.status(500).json({ error: "Erro ao criar conta" });
  }
}

// Aplicar rate limit: 5 req/min por IP
export default withRateLimit(handler, cadastroLimiter);
