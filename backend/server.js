require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: "*" }));
app.use(express.json());

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Sem token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido" });
  }
}

// REGISTER
app.post("/register", async (req, res) => {
  const { nome, empresa, email, senha } = req.body;
  if (!nome || !empresa || !email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe)
    return res.status(400).json({ erro: "E-mail já cadastrado" });
  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: { nome, empresa, email, senha: hash },
  });
  const token = jwt.sign({ id: user.id, nome: user.nome, empresa: user.empresa, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, nome: user.nome, empresa: user.empresa, email: user.email } });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return res.status(401).json({ erro: "E-mail ou senha incorretos" });
  if (!user.isActive)
    return res.status(403).json({ erro: "Conta desativada. Entre em contato com o suporte." });
  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok)
    return res.status(401).json({ erro: "E-mail ou senha incorretos" });
  const token = jwt.sign({ id: user.id, nome: user.nome, empresa: user.empresa, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, nome: user.nome, empresa: user.empresa, email: user.email } });
});

// ME
app.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// PRODUTOS
app.get("/produtos", auth, async (req, res) => {
  const produtos = await prisma.produto.findMany({
    where: { userId: req.user.id },
    include: { fornecedor: true },
    orderBy: { criadoEm: "desc" },
  });
  res.json(produtos);
});

app.post("/produtos", auth, async (req, res) => {
  const { nome, sku, categoria, quantidade, minimo, preco, fornecedorId } = req.body;
  if (!nome || !sku || !categoria)
    return res.status(400).json({ erro: "Preencha nome, SKU e categoria" });
  const existe = await prisma.produto.findUnique({ where: { sku } });
  if (existe) return res.status(400).json({ erro: "SKU já cadastrado" });
  const produto = await prisma.produto.create({
    data: {
      nome, sku, categoria,
      quantidade: Number(quantidade) || 0,
      minimo: Number(minimo) || 0,
      preco: Number(preco) || 0,
      fornecedorId: fornecedorId ? Number(fornecedorId) : null,
      userId: req.user.id,
    },
  });
  res.json(produto);
});

app.put("/produtos/:id", auth, async (req, res) => {
  const { nome, sku, categoria, quantidade, minimo, preco, fornecedorId } = req.body;
  const produto = await prisma.produto.update({
    where: { id: Number(req.params.id) },
    data: {
      nome, sku, categoria,
      quantidade: Number(quantidade),
      minimo: Number(minimo),
      preco: Number(preco),
      fornecedorId: fornecedorId ? Number(fornecedorId) : null,
    },
  });
  res.json(produto);
});

app.delete("/produtos/:id", auth, async (req, res) => {
  await prisma.produto.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// FORNECEDORES
app.get("/fornecedores", auth, async (req, res) => {
  const fornecedores = await prisma.fornecedor.findMany({
    where: { userId: req.user.id },
    orderBy: { criadoEm: "desc" },
  });
  res.json(fornecedores);
});

app.post("/fornecedores", auth, async (req, res) => {
  const { nome, contato, email, telefone } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });
  const fornecedor = await prisma.fornecedor.create({
    data: { nome, contato, email, telefone, userId: req.user.id },
  });
  res.json(fornecedor);
});

app.put("/fornecedores/:id", auth, async (req, res) => {
  const { nome, contato, email, telefone } = req.body;
  const fornecedor = await prisma.fornecedor.update({
    where: { id: Number(req.params.id) },
    data: { nome, contato, email, telefone },
  });
  res.json(fornecedor);
});

app.delete("/fornecedores/:id", auth, async (req, res) => {
  await prisma.fornecedor.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// MOVIMENTAÇÕES
app.get("/movimentacoes", auth, async (req, res) => {
  const movimentacoes = await prisma.movimentacao.findMany({
    where: { userId: req.user.id },
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
  res.json(movimentacoes);
});

app.post("/movimentacoes", auth, async (req, res) => {
  const { tipo, quantidade, obs, produtoId } = req.body;
  if (!tipo || !quantidade || !produtoId)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  const mov = await prisma.movimentacao.create({
    data: { tipo, quantidade: Number(quantidade), obs, produtoId: Number(produtoId), userId: req.user.id },
  });
  const delta = tipo === "entrada" ? Number(quantidade) : -Number(quantidade);
  await prisma.produto.update({
    where: { id: Number(produtoId) },
    data: { quantidade: { increment: delta } },
  });
  res.json(mov);
});

// RELATÓRIOS
app.get("/relatorios/resumo", auth, async (req, res) => {
  const userId = req.user.id;
  const totalProdutos = await prisma.produto.count({ where: { userId } });
  const produtos = await prisma.produto.findMany({ where: { userId } });
  const valorEstoque = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);
  const criticos = produtos.filter((p) => p.quantidade <= p.minimo).length;
  const totalFornecedores = await prisma.fornecedor.count({ where: { userId } });
  const movimentacoes = await prisma.movimentacao.findMany({
    where: { userId },
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
    take: 5,
  });
  res.json({ totalProdutos, valorEstoque, criticos, totalFornecedores, movimentacoes, produtos });
});

// ADMIN AUTH MIDDLEWARE
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Sem token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.admin) return res.status(403).json({ erro: "Não autorizado" });
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido" });
  }
}

// ADMIN
app.post("/admin/verificar", (req, res) => {
  const { senha } = req.body;
  if (senha === process.env.ADMIN_SECRET) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } else {
    res.status(401).json({ erro: "Senha incorreta" });
  }
});

app.post("/admin/cadastrar", async (req, res) => {
  const adminToken = req.headers.authorization?.split(" ")[1];
  if (!adminToken) return res.status(401).json({ erro: "Sem token admin" });
  try {
    const payload = jwt.verify(adminToken, process.env.JWT_SECRET);
    if (!payload.admin) return res.status(403).json({ erro: "Não autorizado" });
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
  const { nome, empresa, email, senha } = req.body;
  if (!nome || !empresa || !email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ erro: "E-mail já cadastrado" });
  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: { nome, empresa, email, senha: hash },
  });
  res.json({ ok: true, user: { id: user.id, nome: user.nome, empresa: user.empresa, email: user.email } });
});

app.get("/admin/clientes", adminAuth, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { criadoEm: "desc" },
    select: {
      id: true, nome: true, empresa: true, email: true, isActive: true, criadoEm: true,
      _count: { select: { produtos: true, fornecedores: true, movimentacoes: true } },
    },
  });
  res.json(users);
});

app.patch("/admin/clientes/:id/status", adminAuth, async (req, res) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { isActive },
  });
  res.json({ ok: true, isActive: user.isActive });
});

app.post("/admin/clientes/:id/resetar-senha", adminAuth, async (req, res) => {
  const { novaSenha } = req.body;
  if (!novaSenha || novaSenha.length < 6)
    return res.status(400).json({ erro: "Senha deve ter pelo menos 6 caracteres" });
  const hash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { senha: hash },
  });
  res.json({ ok: true });
});

app.delete("/admin/clientes/:id", adminAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// FUNCIONÁRIOS
app.get("/funcionarios", auth, async (req, res) => {
  const funcionarios = await prisma.funcionario.findMany({
    where: { userId: req.user.id },
    orderBy: { criadoEm: "desc" },
  });
  res.json(funcionarios);
});

app.post("/funcionarios", auth, async (req, res) => {
  const { nome, email, cargo } = req.body;
  if (!nome || !email)
    return res.status(400).json({ erro: "Nome e e-mail são obrigatórios" });
  const funcionario = await prisma.funcionario.create({
    data: { nome, email, cargo: cargo || "funcionario", userId: req.user.id },
  });
  res.json(funcionario);
});

app.put("/funcionarios/:id", auth, async (req, res) => {
  const { nome, email, cargo } = req.body;
  const funcionario = await prisma.funcionario.update({
    where: { id: Number(req.params.id) },
    data: { nome, email, cargo },
  });
  res.json(funcionario);
});

app.delete("/funcionarios/:id", auth, async (req, res) => {
  await prisma.funcionario.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// FINANCEIRO
app.get("/financeiro/resumo", auth, async (req, res) => {
  const userId = req.user.id;
  const produtos = await prisma.produto.findMany({ where: { userId } });
  const movimentacoes = await prisma.movimentacao.findMany({
    where: { userId },
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
  });

  const entradas = movimentacoes.filter(m => m.tipo === "entrada");
  const saidas = movimentacoes.filter(m => m.tipo === "saida");
  const valorEntradas = entradas.reduce((acc, m) => acc + m.quantidade * m.produto.preco, 0);
  const valorSaidas = saidas.reduce((acc, m) => acc + m.quantidade * m.produto.preco, 0);
  const valorEstoque = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);

  res.json({
    valorEstoque,
    valorEntradas,
    valorSaidas,
    totalMovimentacoes: movimentacoes.length,
    ultimasMovimentacoes: movimentacoes.slice(0, 10),
  });
});

app.post("/produtos/importar", auth, async (req, res) => {
  const { produtos } = req.body;
  if (!produtos || !Array.isArray(produtos) || produtos.length === 0)
    return res.status(400).json({ erro: "Nenhum produto enviado" });

  const resultados = { importados: 0, ignorados: 0, erros: [] };

  for (const p of produtos) {
    try {
      if (!p.nome || !p.sku || !p.categoria) {
        resultados.ignorados++;
        resultados.erros.push(`Linha ignorada: nome, SKU ou categoria faltando (${p.sku || "SKU vazio"})`);
        continue;
      }
      const existe = await prisma.produto.findUnique({ where: { sku: String(p.sku) } });
      if (existe) {
        resultados.ignorados++;
        resultados.erros.push(`SKU já cadastrado: ${p.sku}`);
        continue;
      }
      await prisma.produto.create({
        data: {
          nome: String(p.nome),
          sku: String(p.sku),
          categoria: String(p.categoria),
          quantidade: Number(p.quantidade) || 0,
          minimo: Number(p.minimo) || 0,
          preco: Number(String(p.preco).replace(",", ".")) || 0,
          userId: req.user.id,
        },
      });
      resultados.importados++;
    } catch (e) {
      resultados.ignorados++;
      resultados.erros.push(`Erro ao importar ${p.sku}: ${e.message}`);
    }
  }

  res.json(resultados);
});

app.get("/produtos/:id/historico", auth, async (req, res) => {
  const produto = await prisma.produto.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id },
    include: { fornecedor: true },
  });
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const movimentacoes = await prisma.movimentacao.findMany({
    where: { produtoId: Number(req.params.id) },
    orderBy: { criadoEm: "desc" },
  });

  const totalEntradas = movimentacoes
    .filter(m => m.tipo === "entrada")
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipo === "saida")
    .reduce((acc, m) => acc + m.quantidade, 0);

  res.json({ produto, movimentacoes, totalEntradas, totalSaidas });
});

// DEPOSITOS
app.get("/depositos", auth, async (req, res) => {
  const depositos = await prisma.deposito.findMany({
    where: { userId: req.user.id },
    include: { estoques: { include: { produto: true } } },
    orderBy: { criadoEm: "desc" },
  });
  res.json(depositos);
});

app.post("/depositos", auth, async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });
  const deposito = await prisma.deposito.create({ data: { nome, descricao, userId: req.user.id } });
  res.json(deposito);
});

app.put("/depositos/:id", auth, async (req, res) => {
  const { nome, descricao } = req.body;
  const deposito = await prisma.deposito.update({
    where: { id: Number(req.params.id) },
    data: { nome, descricao },
  });
  res.json(deposito);
});

app.delete("/depositos/:id", auth, async (req, res) => {
  const temEstoque = await prisma.estoqueDeposito.findFirst({
    where: { depositoId: Number(req.params.id), quantidade: { gt: 0 } },
  });
  if (temEstoque) return res.status(400).json({ erro: "Depósito possui estoque. Transfira ou zere antes de excluir." });
  await prisma.estoqueDeposito.deleteMany({ where: { depositoId: Number(req.params.id) } });
  await prisma.deposito.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

app.post("/depositos/:id/estoque", auth, async (req, res) => {
  const { produtoId, quantidade, tipo, obs } = req.body;
  if (!produtoId || !quantidade || !tipo)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  const depositoId = Number(req.params.id);
  const existente = await prisma.estoqueDeposito.findUnique({
    where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId } },
  });
  const delta = tipo === "entrada" ? Number(quantidade) : -Number(quantidade);
  if (existente) {
    if (existente.quantidade + delta < 0)
      return res.status(400).json({ erro: "Estoque insuficiente neste depósito" });
    await prisma.estoqueDeposito.update({
      where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId } },
      data: { quantidade: { increment: delta } },
    });
  } else {
    if (delta < 0) return res.status(400).json({ erro: "Estoque insuficiente neste depósito" });
    await prisma.estoqueDeposito.create({ data: { produtoId: Number(produtoId), depositoId, quantidade: delta } });
  }
  await prisma.movimentacao.create({
    data: { tipo, quantidade: Number(quantidade), obs: obs || "Movimentação em depósito", produtoId: Number(produtoId), depositoId, userId: req.user.id },
  });
  res.json({ ok: true });
});

// TRANSFERENCIAS
app.get("/transferencias", auth, async (req, res) => {
  const transferencias = await prisma.transferencia.findMany({
    where: { userId: req.user.id },
    include: { produto: true, origem: true, destino: true },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
  res.json(transferencias);
});

app.post("/transferencias", auth, async (req, res) => {
  const { produtoId, origemId, destinoId, quantidade, obs } = req.body;
  if (!produtoId || !origemId || !destinoId || !quantidade)
    return res.status(400).json({ erro: "Preencha todos os campos" });
  if (Number(origemId) === Number(destinoId))
    return res.status(400).json({ erro: "Origem e destino não podem ser iguais" });
  const estoqueOrigem = await prisma.estoqueDeposito.findUnique({
    where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId: Number(origemId) } },
  });
  if (!estoqueOrigem || estoqueOrigem.quantidade < Number(quantidade))
    return res.status(400).json({ erro: "Estoque insuficiente no depósito de origem" });
  await prisma.estoqueDeposito.update({
    where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId: Number(origemId) } },
    data: { quantidade: { decrement: Number(quantidade) } },
  });
  const estoqueDestino = await prisma.estoqueDeposito.findUnique({
    where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId: Number(destinoId) } },
  });
  if (estoqueDestino) {
    await prisma.estoqueDeposito.update({
      where: { produtoId_depositoId: { produtoId: Number(produtoId), depositoId: Number(destinoId) } },
      data: { quantidade: { increment: Number(quantidade) } },
    });
  } else {
    await prisma.estoqueDeposito.create({
      data: { produtoId: Number(produtoId), depositoId: Number(destinoId), quantidade: Number(quantidade) },
    });
  }
  const transferencia = await prisma.transferencia.create({
    data: { produtoId: Number(produtoId), origemId: Number(origemId), destinoId: Number(destinoId), quantidade: Number(quantidade), obs, userId: req.user.id },
    include: { produto: true, origem: true, destino: true },
  });
  res.json(transferencia);
});

// PEDIDOS DE COMPRA
app.get("/pedidos", auth, async (req, res) => {
  const pedidos = await prisma.pedidoCompra.findMany({
    where: { userId: req.user.id },
    include: { fornecedor: true, itens: { include: { produto: true } } },
    orderBy: { criadoEm: "desc" },
  });
  res.json(pedidos);
});

app.post("/pedidos", auth, async (req, res) => {
  const { fornecedorId, obs, itens } = req.body;
  if (!itens || itens.length === 0)
    return res.status(400).json({ erro: "Adicione ao menos um produto ao pedido" });
  const pedido = await prisma.pedidoCompra.create({
    data: {
      fornecedorId: fornecedorId ? Number(fornecedorId) : null,
      obs,
      userId: req.user.id,
      itens: { create: itens.map(i => ({ produtoId: Number(i.produtoId), quantidade: Number(i.quantidade) })) },
    },
    include: { fornecedor: true, itens: { include: { produto: true } } },
  });
  res.json(pedido);
});

app.patch("/pedidos/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const pedido = await prisma.pedidoCompra.update({
    where: { id: Number(req.params.id) },
    data: { status },
    include: { itens: { include: { produto: true } } },
  });
  if (status === "recebido") {
    for (const item of pedido.itens) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { increment: item.quantidade } },
      });
      await prisma.movimentacao.create({
        data: {
          tipo: "entrada",
          quantidade: item.quantidade,
          obs: `Pedido de compra #${pedido.id}`,
          produtoId: item.produtoId,
          userId: req.user.id,
        },
      });
    }
  }
  res.json(pedido);
});

app.delete("/pedidos/:id", auth, async (req, res) => {
  await prisma.pedidoItem.deleteMany({ where: { pedidoId: Number(req.params.id) } });
  await prisma.pedidoCompra.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

app.get("/pedidos/criticos", auth, async (req, res) => {
  const produtos = await prisma.produto.findMany({
    where: { userId: req.user.id },
    include: { fornecedor: true },
  });
  const criticos = produtos.filter(p => p.quantidade <= p.minimo);
  res.json(criticos);
});

app.get("/relatorios/graficos", auth, async (req, res) => {
  const userId = req.user.id;

  const movimentacoes = await prisma.movimentacao.findMany({
    where: { userId },
    include: { produto: true },
    orderBy: { criadoEm: "asc" },
  });

  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() - 29);

  const diasMap = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(limite);
    d.setDate(limite.getDate() + i);
    const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    diasMap[key] = { dia: key, entradas: 0, saidas: 0 };
  }

  movimentacoes.forEach(m => {
    const data = new Date(m.criadoEm);
    if (data >= limite) {
      const key = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (diasMap[key]) {
        if (m.tipo === "entrada") diasMap[key].entradas += m.quantidade;
        else diasMap[key].saidas += m.quantidade;
      }
    }
  });

  const movPorDia = Object.values(diasMap);

  const produtoMap = {};
  movimentacoes.forEach(m => {
    if (!produtoMap[m.produto.nome]) produtoMap[m.produto.nome] = 0;
    produtoMap[m.produto.nome] += m.quantidade;
  });

  const topProdutos = Object.entries(produtoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, total]) => ({ nome: nome.length > 16 ? nome.substring(0, 16) + "..." : nome, total }));

  const produtos = await prisma.produto.findMany({ where: { userId } });
  const catMap = {};
  produtos.forEach(p => {
    if (!catMap[p.categoria]) catMap[p.categoria] = 0;
    catMap[p.categoria] += p.quantidade;
  });
  const porCategoria = Object.entries(catMap).map(([cat, qty]) => ({ cat, qty }));

  res.json({ movPorDia, topProdutos, porCategoria });
});

app.listen(process.env.PORT, () =>
  console.log(`Servidor rodando na porta ${process.env.PORT}`)
);
