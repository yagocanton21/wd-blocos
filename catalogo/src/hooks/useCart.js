import { useState, useEffect, useMemo } from 'react';

/**
 * Hook customizado para gerenciar a lista de cotação (carrinho)
 * Mantém persistência automática no localStorage sob a chave 'wd_cotacao_itens'.
 */
export function useCart(mostrarToast) {
  const [itensCotacao, setItensCotacao] = useState(() => {
    try {
      const salvo = localStorage.getItem('wd_cotacao_itens');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  // Persiste a lista de cotação no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wd_cotacao_itens', JSON.stringify(itensCotacao));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }, [itensCotacao]);

  const handleAdicionarCotacao = (produto, quantidade) => {
    setItensCotacao(prev => {
      const index = prev.findIndex(item => item.produto.id === produto.id);
      if (index > -1) {
        const novos = [...prev];
        novos[index] = {
          ...novos[index],
          quantidade: novos[index].quantidade + quantidade
        };
        return novos;
      } else {
        return [...prev, { produto, quantidade }];
      }
    });
    if (mostrarToast) {
      mostrarToast(`✅ ${produto.nome} adicionado à lista!`);
    }
  };

  const handleAtualizarQuantidade = (produtoId, novaQuantidade) => {
    setItensCotacao(prev =>
      prev.map(item =>
        item.produto.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const handleRemoverItem = (produtoId) => {
    setItensCotacao(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const handleLimparCotacao = () => {
    if (window.confirm('Deseja realmente esvaziar todos os itens da cotação?')) {
      setItensCotacao([]);
    }
  };

  const mapQuantidades = useMemo(() => {
    const mapa = {};
    itensCotacao.forEach(item => {
      mapa[item.produto.id] = item.quantidade;
    });
    return mapa;
  }, [itensCotacao]);

  const totalItens = itensCotacao.length;
  const totalVolumes = itensCotacao.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);

  return {
    itensCotacao,
    handleAdicionarCotacao,
    handleAtualizarQuantidade,
    handleRemoverItem,
    handleLimparCotacao,
    mapQuantidades,
    totalItens,
    totalVolumes
  };
}

