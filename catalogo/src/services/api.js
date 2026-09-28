import { PRODUTOS_INICIAIS } from '../data/produtos';

// Em produção (Docker/VPS): Nginx proxia /api/ para o backend — URL relativa
// Em dev local: aponta direto para localhost:8001
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Normaliza campos para suportar tanto camelCase quanto snake_case do backend
const normalizarProduto = (p) => ({
  id: p.id,
  codigo: p.codigo,
  nome: p.nome,
  categoria: p.categoria,
  categoriaLabel: p.categoriaLabel || p.categoria_label || 'Material',
  destaque: Boolean(p.destaque),
  foto: p.foto || p.foto_url || null,
  dimensoes: p.dimensoes || '',
  resistencia: p.resistencia || '',
  peso: p.peso || '',
  rendimento: p.rendimento || '',
  paletizacao: p.paletizacao || '',
  norma: p.norma || 'ABNT NBR 6136',
  unidade: p.unidade || 'un',
  qtdMinima: p.qtdMinima ?? p.qtd_minima ?? 10,
  incremento: p.incremento ?? 10,
  prontaEntrega: p.prontaEntrega ?? p.pronta_entrega ?? true,
  descricaoCurta: p.descricaoCurta || p.descricao_curta || '',
  descricaoLonga: p.descricaoLonga || p.descricao_longa || '',
  aplicacoes: p.aplicacoes || [],
  tipoIcone: p.tipoIcone || p.tipo_icone || 'bloco-padrao'
});

// Busca produtos da API FastAPI com fallback inteligente
export async function getProdutos(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.categoria && filtros.categoria !== 'todos') params.append('categoria', filtros.categoria);
    if (filtros.busca) params.append('busca', filtros.busca);
    if (filtros.ordenacao) params.append('ordenacao', filtros.ordenacao);

    const res = await fetch(`${API_BASE}/produtos?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizarProduto) : [];
  } catch (err) {
    console.warn('⚠️ Backend FastAPI offline ou indisponível. Usando dados locais.', err);
    return PRODUTOS_INICIAIS;
  }
}

// Estatísticas do painel
export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      totalProdutos: PRODUTOS_INICIAIS.length,
      prontaEntrega: PRODUTOS_INICIAIS.filter(p => p.prontaEntrega).length,
      sobEncomenda: PRODUTOS_INICIAIS.filter(p => !p.prontaEntrega).length,
      porCategoria: {}
    };
  }
}

// Cadastrar novo produto
export async function criarProduto(dados) {
  const res = await fetch(`${API_BASE}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  if (!res.ok) throw new Error('Erro ao cadastrar produto');
  const criado = await res.json();
  return normalizarProduto(criado);
}

// Atualizar produto existente
export async function atualizarProduto(id, dados) {
  const res = await fetch(`${API_BASE}/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  if (!res.ok) throw new Error('Erro ao atualizar produto');
  const atualizado = await res.json();
  return normalizarProduto(atualizado);
}

// Alternar status rápida (1 clique)
export async function alternarProntaEntrega(id) {
  const res = await fetch(`${API_BASE}/produtos/${id}/toggle-pronta-entrega`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Erro ao alternar disponibilidade');
  return await res.json();
}

// Excluir produto
export async function excluirProduto(id) {
  const res = await fetch(`${API_BASE}/produtos/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Erro ao excluir produto');
  return await res.json();
}

// Autenticação de Administrador
export async function loginAdmin(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Falha no login');
  return data;
}
