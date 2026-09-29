import { render, screen, fireEvent } from '@testing-library/react';
import QuoteDrawer from './QuoteDrawer';
import { describe, it, expect, vi } from 'vitest';

const mockCotacao = [
  {
    produto: {
      id: 'test-1',
      nome: 'Cimento',
      qtdMinima: 10,
      unidade: 'saco',
    },
    quantidade: 10
  }
];

describe('QuoteDrawer Component', () => {
  it('renders empty cart message when no items', () => {
    render(
      <QuoteDrawer 
        aberto={true} 
        onClose={() => {}} 
        itensCotacao={[]} 
        onRemoverItem={() => {}} 
        onAtualizarQuantidade={() => {}} 
        onLimparCotacao={() => {}} 
      />
    );
    expect(screen.getByText(/Sua lista está vazia/i)).toBeInTheDocument();
  });

  it('renders items in the cart', () => {
    render(
      <QuoteDrawer 
        aberto={true} 
        onClose={() => {}} 
        itensCotacao={mockCotacao} 
        onRemoverItem={() => {}} 
        onAtualizarQuantidade={() => {}} 
        onLimparCotacao={() => {}} 
      />
    );
    expect(screen.getByText('Cimento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });
});
