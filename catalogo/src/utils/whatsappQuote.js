import { INFO_EMPRESA } from '../data/produtos';

export const formatarUnidade = (qtd, un) => {
  if (un === 'saco') return qtd > 1 ? 'sacos' : 'saco';
  if (un === 'un') return qtd > 1 ? 'unidades' : 'unidade';
  if (un === 'painel') return qtd > 1 ? 'painéis' : 'painel';
  if (un === 'bisnaga') return qtd > 1 ? 'bisnagas' : 'bisnaga';
  return un || 'unidades';
};

export const gerarMensagemWhatsApp = ({ nomeCliente, localEntrega, observacoes, itensCotacao }) => {
  let mensagem = `*SOLICITAÇÃO DE ORÇAMENTO — WD BLOCOS*\n\n`;

  if (nomeCliente && nomeCliente.trim()) {
    mensagem += `👤 *Cliente:* ${nomeCliente.trim()}\n`;
  }
  if (localEntrega && localEntrega.trim()) {
    mensagem += `📍 *Entrega (Bairro/Cidade):* ${localEntrega.trim()}\n`;
  }
  if (observacoes && observacoes.trim()) {
    mensagem += `📝 *Observação:* ${observacoes.trim()}\n`;
  }

  mensagem += `\n📦 *LISTA DE MATERIAIS (${itensCotacao.length} itens):*\n`;

  itensCotacao.forEach((item, idx) => {
    mensagem += `\n${idx + 1}. *${item.quantidade} ${formatarUnidade(item.quantidade, item.produto.unidade)}* — ${item.produto.nome}`;
  });

  mensagem += `\n\n─────────────────\n`;
  mensagem += `Por favor, informar valores com frete e previsão de entrega. Aguardo retorno!`;

  return mensagem;
};

export const gerarLinkWhatsApp = ({ telefone, mensagem }) => {
  const tel = telefone || INFO_EMPRESA.telefoneWhatsapp;
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensagem)}`;
};

