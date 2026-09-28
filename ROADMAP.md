# 🚀 Roadmap Futuro: WD Blocos

Este documento guarda ideias, solicitações e planejamentos de longo prazo para a evolução do Catálogo Digital da WD Blocos.

## 🛒 Evolução para E-commerce (Venda Direta)

O cliente levantou a possibilidade de colocar preço em alguns produtos e permitir que a venda aconteça diretamente pelo site, em vez de ser apenas um pedido de orçamento.

Para viabilizar isso no futuro sem perder a essência atual, temos duas opções mapeadas:

### Opção 1: "Carrinho de Orçamento com Preço" (Recomendada para o nicho)
Essa opção não exige integração com bancos nem cobrança de taxas de plataforma.
1. **Banco de Dados:** Criar a coluna `preco` (opcional) na tabela de Produtos.
2. **Painel Admin:** Adicionar o campo "Preço de Venda" no formulário de cadastro. Se ficar vazio, o site exibe "Sob Consulta".
3. **Frontend (Vitrine):** Exibir o preço formatado (Ex: `R$ 3,50 / un`).
4. **Carrinho (Quote Drawer):** Multiplicar o preço pela quantidade e calcular o **Valor Total** dos itens.
5. **Fechamento via WhatsApp:** A mensagem enviada ao vendedor incluirá os preços unitários e o Valor Total estimado, agilizando o fechamento e o Pix direto com a fábrica. O frete continua sendo negociado caso a caso.

### Opção 2: E-commerce Tradicional (Gateway de Pagamento)
Transformar o sistema numa loja virtual autônoma (Estilo MercadoLivre).
1. **Carrinho de Compras:** Substitui o disparo pro WhatsApp por uma tela de Checkout interno.
2. **Cálculo de Frete:** Exige integração com API de CEP ou cálculo por raio de KM (complexo para carga pesada/caminhão munck).
3. **Pagamento (Gateway):** Integração via API (MercadoPago, Stripe, Pagar.me) para gerar Pix dinâmico ou cobrar Cartão de Crédito.
4. **Painel Admin (Aba Pedidos):** Criar um painel robusto para o lojista gerenciar o status do pagamento, separar o estoque e mudar o status para "Em Rota de Entrega".

---
*Anotado em: 28/09/2026*
