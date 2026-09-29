import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageSquare, 
  MapPin, 
  User, 
  FileText, 
  Truck
} from 'lucide-react';
import { INFO_EMPRESA } from '../data/produtos';
import ProductVisual from './ProductVisual';
import styles from './QuoteDrawer.module.css';

const formatarUnidade = (qtd, un) => {
  if (un === 'saco') return qtd > 1 ? 'sacos' : 'saco';
  if (un === 'un') return qtd > 1 ? 'unidades' : 'unidade';
  if (un === 'painel') return qtd > 1 ? 'painéis' : 'painel';
  if (un === 'bisnaga') return qtd > 1 ? 'bisnagas' : 'bisnaga';
  return un || 'unidades';
};

export default function QuoteDrawer({ 
  aberto, 
  onClose, 
  itensCotacao, 
  onAtualizarQuantidade, 
  onRemoverItem, 
  onLimparCotacao,
  configLoja
}) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [localEntrega, setLocalEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Recupera dados salvos localmente
  useEffect(() => {
    const salvoNome = localStorage.getItem('wd_cliente_nome');
    const salvoLocal = localStorage.getItem('wd_cliente_local');
    if (salvoNome) setNomeCliente(salvoNome);
    if (salvoLocal) setLocalEntrega(salvoLocal);
  }, []);

  if (!aberto) return null;

  const totalUnidades = itensCotacao.reduce((acc, item) => acc + item.quantidade, 0);

  const handleEnviarWhatsApp = (e) => {
    e.preventDefault();

    if (itensCotacao.length === 0) return;

    // Salva no storage para futuras cotações
    localStorage.setItem('wd_cliente_nome', nomeCliente);
    localStorage.setItem('wd_cliente_local', localEntrega);

    // Formata mensagem profissional para o WhatsApp da WD Blocos
    let mensagem = `*SOLICITAÇÃO DE ORÇAMENTO — WD BLOCOS*\n\n`;

    if (nomeCliente.trim()) {
      mensagem += `👤 *Cliente:* ${nomeCliente.trim()}\n`;
    }
    if (localEntrega.trim()) {
      mensagem += `📍 *Entrega (Bairro/Cidade):* ${localEntrega.trim()}\n`;
    }
    if (observacoes.trim()) {
      mensagem += `📝 *Observação:* ${observacoes.trim()}\n`;
    }

    mensagem += `\n📦 *LISTA DE MATERIAIS (${itensCotacao.length} itens):*\n`;

    itensCotacao.forEach((item, idx) => {
      mensagem += `\n${idx + 1}. *${item.quantidade} ${formatarUnidade(item.quantidade, item.produto.unidade)}* — ${item.produto.nome}`;
    });

    mensagem += `\n\n─────────────────\n`;
    mensagem += `Por favor, informar valores com frete e previsão de entrega. Aguardo retorno!`;

    const telefoneWhatsapp = configLoja?.telefone_whatsapp || INFO_EMPRESA.telefoneWhatsapp;
    const urlZap = `https://wa.me/${telefoneWhatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlZap, '_blank');
  };

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <aside className={styles.quoteDrawer} onClick={(e) => e.stopPropagation()}>
        {/* Header da Gaveta */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleGroup}>
            <h3 className={styles.drawerTitle}>Lista de Cotação</h3>
            <span className={styles.drawerCountBadge}>
              {itensCotacao.length} {itensCotacao.length === 1 ? 'material' : 'materiais'}
            </span>
          </div>
          <button className={styles.drawerCloseBtn} onClick={onClose} title="Fechar gaveta">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className={styles.drawerBody}>
          {itensCotacao.length === 0 ? (
            <div className={styles.emptyDrawerState}>
              <div className={styles.emptyIconBox}>
                <Truck size={40} />
              </div>
              <h4>Sua lista está vazia</h4>
              <p>Navegue pelo catálogo e clique em <strong>+ Adicionar à Cotação</strong> para montar seu pedido de materiais.</p>
              <button className={styles.btnExplore} onClick={onClose}>
                Explorar Materiais
              </button>
            </div>
          ) : (
            <>
              {/* Lista dos Itens Selecionados */}
              <div className={styles.drawerItemsList}>
                {itensCotacao.map((item) => (
                  <div key={item.produto.id} className={styles.drawerItemCard}>
                    <div className={styles.drawerItemVisual}>
                      {item.produto.imagemUrl ? (
                        <img 
                          src={item.produto.imagemUrl} 
                          alt={item.produto.nome}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={item.produto.imagemUrl ? { display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' } : { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProductVisual 
                          tipo={item.produto.tipoIcone} 
                          dimensao="" 
                          nome="" 
                        />
                      </div>
                    </div>

                    <div className={styles.drawerItemDetails}>
                      <div className={styles.drawerItemTop}>
                        <span className={styles.drawerItemCode}>{item.produto.codigo}</span>
                        <button 
                          className={styles.btnRemoveItem}
                          onClick={() => onRemoverItem(item.produto.id)}
                          title="Remover item da lista"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h4 className={styles.drawerItemName}>{item.produto.nome}</h4>
                      <span className={styles.drawerItemSub}>{item.produto.dimensoes}</span>

                      {/* Controles de Quantidade */}
                      <div className={styles.drawerQtyRow}>
                        <span className={styles.drawerQtyUnit}>Qtd ({formatarUnidade(2, item.produto.unidade)}):</span>
                        <div className={styles.drawerStepper}>
                          <button 
                            type="button" 
                            className={styles.stepperBtnMini}
                            onClick={() => onAtualizarQuantidade(
                              item.produto.id, 
                              Math.max(item.produto.qtdMinima || 1, item.quantidade - (item.produto.incremento || 1))
                            )}
                          >
                            <Minus size={12} />
                          </button>
                          <input 
                            type="number" 
                            className={styles.stepperInputMini}
                            value={item.quantidade}
                            min={item.produto.qtdMinima || 1}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                onAtualizarQuantidade(item.produto.id, '');
                                return;
                              }
                              const val = parseInt(raw, 10);
                              if (!isNaN(val)) {
                                onAtualizarQuantidade(item.produto.id, val);
                              }
                            }}
                            onBlur={(e) => {
                              const min = item.produto.qtdMinima || 1;
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < min) {
                                onAtualizarQuantidade(item.produto.id, min);
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            className={styles.stepperBtnMini}
                            onClick={() => onAtualizarQuantidade(
                              item.produto.id, 
                              item.quantidade + (item.produto.incremento || 1)
                            )}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de limpar tudo */}
              <div className={styles.clearAllRow}>
                <button 
                  type="button" 
                  className={styles.btnClearAll} 
                  onClick={onLimparCotacao}
                >
                  <Trash2 size={14} />
                  <span>Limpar todos os itens</span>
                </button>
              </div>

              {/* Formulário de Identificação da Obra / Frete */}
              <div className={styles.quoteFormSection}>
                <div className={styles.sectionTitleWithBadge}>
                  <h4>Dados para Cálculo de Frete</h4>
                  <span className={styles.infoPill}>Opcional</span>
                </div>
                <p className={styles.formHelper}>
                  Informe o bairro de entrega para que a equipe da WD Blocos já envie o valor com frete/munck calculado.
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <User size={14} />
                    <span>Seu Nome ou Construtora</span>
                  </label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    placeholder="Ex: Construtora Silva ou Carlos"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <MapPin size={14} />
                    <span>Bairro e Cidade de Entrega</span>
                  </label>
                  <input 
                    type="text"
                    className={styles.formInput}
                    placeholder="Ex: Jd. América, Campinas - SP"
                    value={localEntrega}
                    onChange={(e) => setLocalEntrega(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FileText size={14} />
                    <span>Observações (Acesso, data ou dúvidas)</span>
                  </label>
                  <textarea 
                    className={styles.formTextarea}
                    rows="2"
                    placeholder="Ex: Rua plana, entrada para caminhão toco liberada..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé da Gaveta: Disparo WhatsApp */}
        {itensCotacao.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.drawerSummaryBar}>
              <span>Total de Peças / Volumes:</span>
              <strong>{totalUnidades.toLocaleString('pt-BR')} itens</strong>
            </div>

            <button 
              type="button"
              className={styles.btnSubmitWhatsapp}
              onClick={handleEnviarWhatsApp}
            >
              <MessageSquare size={20} />
              <span>Enviar Cotação pelo WhatsApp</span>
            </button>
            <span className={styles.footerSafeNote}>
              ✓ Você será redirecionado para o WhatsApp com a mensagem pronta.
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}
