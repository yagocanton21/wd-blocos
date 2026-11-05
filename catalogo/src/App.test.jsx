import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  getProdutos: vi.fn(),
  getCategorias: vi.fn(),
  getConfig: vi.fn(),
  checkAuth: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  getStats: vi.fn()
}));

describe('App Component (Testes de Caracterização do Catálogo Público)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';
    window.location.search = '';
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renderiza o catálogo público com produtos carregados', async () => {
    api.getConfig.mockResolvedValue({
      telefone_whatsapp: '5511942440440',
      telefone_exibicao: '(11) 94244-0440'
    });
    api.getCategorias.mockResolvedValue([
      { id: 'blocos', label: 'Blocos Estruturais' }
    ]);
    api.getProdutos.mockResolvedValue([
      {
        id: 'prod-app-1',
        codigo: 'WD-01',
        nome: 'Bloco de Concreto Estrutural',
        categoria: 'blocos',
        categoriaLabel: 'Blocos Estruturais',
        dimensoes: '14x19x39',
        qtdMinima: 10,
        unidade: 'un',
        prontaEntrega: true,
        ativo: true
      }
    ]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Bloco de Concreto Estrutural')).toBeInTheDocument();
    });

    expect(screen.getByText(/Catálogo Técnico Completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por bloco, canaleta/i)).toBeInTheDocument();
  });

  it('abre o modal do AdminPanel quando a rota contém #admin', async () => {
    window.location.hash = '#admin';
    api.checkAuth.mockRejectedValue(new Error('Não autenticado'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Gestão de Produtos & Catálogo WD Blocos/i)).toBeInTheDocument();
    });
  });
});
