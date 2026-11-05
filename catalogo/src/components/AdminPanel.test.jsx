import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from './AdminPanel';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  checkAuth: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  getProdutos: vi.fn(),
  getCategorias: vi.fn(),
  getStats: vi.fn(),
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  alternarAtivo: vi.fn(),
  alternarProntaEntrega: vi.fn(),
  criarProduto: vi.fn(),
  atualizarProduto: vi.fn(),
  excluirProduto: vi.fn(),
  criarCategoria: vi.fn(),
  atualizarCategoria: vi.fn(),
  excluirCategoria: vi.fn(),
  uploadImage: vi.fn()
}));

describe('AdminPanel Component (Testes de Caracterização)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe tela de login quando o usuário não está autenticado', async () => {
    api.checkAuth.mockRejectedValue(new Error('Não autenticado'));

    render(<AdminPanel onVoltarCatalogo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Gestão de Produtos & Catálogo WD Blocos/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar no Painel/i })).toBeInTheDocument();
  });

  it('exibe o dashboard e tabela de produtos quando autenticado', async () => {
    api.checkAuth.mockResolvedValue({ success: true, username: 'admin' });
    api.getProdutos.mockResolvedValue([
      {
        id: 'prod-1',
        codigo: 'WD-01',
        nome: 'Bloco de Concreto Teste',
        categoria: 'blocos-estruturais',
        categoriaLabel: 'Blocos Estruturais',
        dimensoes: '14x19x39',
        ativo: true,
        prontaEntrega: true
      }
    ]);
    api.getCategorias.mockResolvedValue([
      { id: 'blocos-estruturais', label: 'Blocos Estruturais' }
    ]);
    api.getStats.mockResolvedValue({
      totalProdutos: 1,
      prontaEntrega: 1,
      sobEncomenda: 0
    });
    api.getConfig.mockResolvedValue({
      telefone_whatsapp: '5511999999999',
      telefone_exibicao: '(11) 99999-9999'
    });

    render(<AdminPanel onVoltarCatalogo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/WD Blocos — Painel de Controle/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Bloco de Concreto Teste')).toBeInTheDocument();
    expect(screen.getByText('WD-01')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Produto/i })).toBeInTheDocument();
  });

  it('permite alternar para a aba de Categorias', async () => {
    api.checkAuth.mockResolvedValue({ success: true, username: 'admin' });
    api.getProdutos.mockResolvedValue([]);
    api.getCategorias.mockResolvedValue([
      { id: 'canaletas', label: 'Canaletas de Concreto' }
    ]);
    api.getStats.mockResolvedValue({ totalProdutos: 0, prontaEntrega: 0, sobEncomenda: 0 });
    api.getConfig.mockResolvedValue({ telefone_whatsapp: '', telefone_exibicao: '' });

    render(<AdminPanel onVoltarCatalogo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/WD Blocos — Painel de Controle/i)).toBeInTheDocument();
    });

    const abaCategorias = screen.getByRole('button', { name: /Categorias/i });
    fireEvent.click(abaCategorias);

    await waitFor(() => {
      expect(screen.getByText('Canaletas de Concreto')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Nova Categoria/i })).toBeInTheDocument();
    });
  });

  it('abre o modal de criação de produto ao clicar em Novo Produto', async () => {
    api.checkAuth.mockResolvedValue({ success: true, username: 'admin' });
    api.getProdutos.mockResolvedValue([]);
    api.getCategorias.mockResolvedValue([
      { id: 'blocos', label: 'Blocos' }
    ]);
    api.getStats.mockResolvedValue({ totalProdutos: 0, prontaEntrega: 0, sobEncomenda: 0 });
    api.getConfig.mockResolvedValue({ telefone_whatsapp: '', telefone_exibicao: '' });

    render(<AdminPanel onVoltarCatalogo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Novo Produto/i })).toBeInTheDocument();
    });

    const btnNovo = screen.getByRole('button', { name: /Novo Produto/i });
    fireEvent.click(btnNovo);

    await waitFor(() => {
      expect(screen.getByText(/Cadastrar Novo Produto/i)).toBeInTheDocument();
      expect(screen.getByText(/Nome do Material \/ Produto/i)).toBeInTheDocument();
    });
  });
});
