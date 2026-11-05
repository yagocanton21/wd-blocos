import { describe, it, expect } from 'vitest';
import { formatarUnidade, gerarMensagemWhatsApp, gerarLinkWhatsApp } from './whatsappQuote';

describe('whatsappQuote Utilities', () => {
  it('formata unidades no singular e plural corretamente', () => {
    expect(formatarUnidade(1, 'saco')).toBe('saco');
    expect(formatarUnidade(5, 'saco')).toBe('sacos');
    expect(formatarUnidade(1, 'un')).toBe('unidade');
    expect(formatarUnidade(20, 'un')).toBe('unidades');
    expect(formatarUnidade(1, 'painel')).toBe('painel');
    expect(formatarUnidade(3, 'painel')).toBe('painéis');
    expect(formatarUnidade(1, 'bisnaga')).toBe('bisnaga');
    expect(formatarUnidade(2, 'bisnaga')).toBe('bisnagas');
  });

  it('gera mensagem de orçamento estruturada para WhatsApp', () => {
    const dados = {
      nomeCliente: 'Carlos Silva',
      localEntrega: 'Atibaia - SP',
      observacoes: 'Entregar na obra',
      itensCotacao: [
        {
          quantidade: 50,
          produto: { nome: 'Bloco de Concreto 14x19x39', unidade: 'un' }
        }
      ]
    };

    const msg = gerarMensagemWhatsApp(dados);
    expect(msg).toContain('*SOLICITAÇÃO DE ORÇAMENTO — WD BLOCOS*');
    expect(msg).toContain('Carlos Silva');
    expect(msg).toContain('Atibaia - SP');
    expect(msg).toContain('Entregar na obra');
    expect(msg).toContain('50 unidades* — Bloco de Concreto 14x19x39');
  });

  it('gera o link correto do wa.me com url encoding', () => {
    const link = gerarLinkWhatsApp({
      telefone: '5511942440440',
      mensagem: 'Olá, cotação'
    });
    expect(link).toBe('https://wa.me/5511942440440?text=Ol%C3%A1%2C%20cota%C3%A7%C3%A3o');
  });
});

