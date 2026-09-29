import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { describe, it, expect, vi } from 'vitest';

const mockProduto = {
  id: 'test-1',
  nome: 'Produto Teste',
  categoriaLabel: 'Teste Categoria',
  qtdMinima: 10,
  unidade: 'un',
  incremento: 5,
};

describe('ProductCard Component', () => {
  it('renders product information correctly', () => {
    render(<ProductCard produto={mockProduto} onAdicionarCotacao={() => {}} quantidadeNoCarrinho={0} />);
    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
  });

  it('allows typing quantity and validates on blur', () => {
    render(<ProductCard produto={mockProduto} onAdicionarCotacao={() => {}} quantidadeNoCarrinho={0} />);
    const input = screen.getByRole('spinbutton');
    
    // Type less than min
    fireEvent.change(input, { target: { value: '1' } });
    expect(input.value).toBe('1');
    
    // Blur to trigger validation
    fireEvent.blur(input);
    expect(input.value).toBe('10'); // should reset to min
  });
});
