import { PRODUTOS_INICIAIS } from '../data/produtos';

// Em produção (Docker/VPS): Nginx proxia /api/ para o backend — URL relativa
// Em dev local: aponta direto para localhost:8001
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads') && API_BASE.startsWith('http')) {
    return `${API_BASE.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
};

const getAuthHeaders = (extraHeaders = {}) => {
  return extraHeaders;
};

const getFetchOptions = (extraOptions = {}) => {
  return {
    credentials: 'include',
    ...extraOptions
  };
};

// Normaliza campos para suportar tanto camelCase quanto snake_case do backend
const normalizarProduto = (p) => ({
  id: p.id,
  codigo: p.codigo,
  nome: p.nome,
  categoria: p.categoria,
  categoriaLabel: p.categoriaLabel || p.categoria_label || 'Material',
  destaque: Boolean(p.destaque),
  foto: formatImageUrl(p.foto || p.foto_url || p.imagemUrl || p.imagem_url),
  imagemUrl: formatImageUrl(p.imagemUrl || p.imagem_url),
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
  tipoIcone: p.tipoIcone || p.tipo_icone || 'bloco-padrao',
  ativo: p.ativo !== false
});

// Busca produtos da API FastAPI
export async function getProdutos(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.categoria && filtros.categoria !== 'todos') params.append('categoria', filtros.categoria);
    if (filtros.busca) params.append('busca', filtros.busca);
    if (filtros.ordenacao) params.append('ordenacao', filtros.ordenacao);
    if (filtros.admin) params.append('admin', 'true');

    const res = await fetch(`${API_BASE}/produtos?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizarProduto) : [];
  } catch (err) {
    console.error('⚠️ Backend FastAPI offline ou indisponível.', err);
    return [];
  }
}

// Estatísticas do painel
export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`, getFetchOptions({ 
      cache: 'no-store',
      headers: getAuthHeaders()
    }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      totalProdutos: 0,
      prontaEntrega: 0,
      sobEncomenda: 0,
      porCategoria: {}
    };
  }
}

// Cadastrar novo produto
export async function criarProduto(dados) {
  const res = await fetch(`${API_BASE}/produtos`, getFetchOptions({
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados)
  }));
  if (!res.ok) throw new Error('Erro ao cadastrar produto');
  const criado = await res.json();
  return normalizarProduto(criado);
}

// Upload de Imagem
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, getFetchOptions({
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  }));
  if (!res.ok) throw new Error('Erro ao fazer upload da imagem');
  return await res.json();
}

// Atualizar produto existente
export async function atualizarProduto(id, dados) {
  const res = await fetch(`${API_BASE}/produtos/${id}`, getFetchOptions({
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados)
  }));
  if (!res.ok) throw new Error('Erro ao atualizar produto');
  const atualizado = await res.json();
  return normalizarProduto(atualizado);
}

// Alternar status rápida (1 clique)
export async function alternarProntaEntrega(id) {
  const res = await fetch(`${API_BASE}/produtos/${id}/toggle-pronta-entrega`, getFetchOptions({
    method: 'PATCH',
    headers: getAuthHeaders()
  }));
  if (!res.ok) throw new Error('Erro ao alternar disponibilidade');
  return await res.json();
}

export async function alternarAtivo(id) {
  const res = await fetch(`${API_BASE}/produtos/${id}/toggle-ativo`, getFetchOptions({
    method: 'PATCH',
    headers: getAuthHeaders()
  }));
  if (!res.ok) throw new Error('Erro ao alternar status ativo');
  return await res.json();
}

// Excluir produto
export async function excluirProduto(id) {
  const res = await fetch(`${API_BASE}/produtos/${id}`, getFetchOptions({
    method: 'DELETE',
    headers: getAuthHeaders()
  }));
  if (!res.ok) throw new Error('Erro ao excluir produto');
  return await res.json();
}

// Autenticação de Administrador
export async function loginAdmin(username, password, remember_me = false) {
  const res = await fetch(`${API_BASE}/auth/login`, getFetchOptions({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, remember_me })
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Falha no login');
  return data;
}

export async function logoutAdmin() {
  const res = await fetch(`${API_BASE}/auth/logout`, getFetchOptions({
    method: 'POST'
  }));
  return res.ok;
}

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/auth/verify`, getFetchOptions());
  if (!res.ok) throw new Error('Não autenticado');
  return await res.json();
}

// ==========================================
// CATEGORIAS
// ==========================================
export async function getCategorias() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('⚠️ Falha ao buscar categorias do backend.', err);
    return [];
  }
}

export async function criarCategoria(dados) {
  const res = await fetch(`${API_BASE}/categories`, getFetchOptions({
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados)
  }));
  if (!res.ok) throw new Error('Erro ao cadastrar categoria');
  return await res.json();
}

export async function atualizarCategoria(id, dados) {
  const res = await fetch(`${API_BASE}/categories/${id}`, getFetchOptions({
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados)
  }));
  if (!res.ok) throw new Error('Erro ao atualizar categoria');
  return await res.json();
}

export async function excluirCategoria(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, getFetchOptions({
    method: 'DELETE',
    headers: getAuthHeaders()
  }));
  if (!res.ok) {
    let msg = 'Erro ao excluir categoria';
    try {
      const errData = await res.json();
      if (errData.detail) msg = errData.detail;
    } catch (e) {}
    throw new Error(msg);
  }
}

// ==========================================
// CONFIGURAÇÕES DA LOJA
// ==========================================
export async function getConfig() {
  try {
    const res = await fetch(`${API_BASE}/config`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return {
      telefone_whatsapp: '5511942440440',
      telefone_exibicao: '(11) 94244-0440'
    };
  }
}

export async function updateConfig(dados) {
  const res = await fetch(`${API_BASE}/config`, getFetchOptions({
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados)
  }));
  if (!res.ok) throw new Error('Erro ao salvar configurações');
  return await res.json();
}
