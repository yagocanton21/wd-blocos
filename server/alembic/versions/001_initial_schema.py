"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 21:12:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Tabela: categorias
    if 'categorias' not in tables:
        op.create_table(
            'categorias',
            sa.Column('id', sa.String(length=100), primary_key=True),
            sa.Column('label', sa.String(length=100), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
        )

    # Tabela: store_config
    if 'store_config' not in tables:
        op.create_table(
            'store_config',
            sa.Column('id', sa.String(), primary_key=True),
            sa.Column('telefone_whatsapp', sa.String(length=20), nullable=True),
            sa.Column('telefone_exibicao', sa.String(length=20), nullable=True),
        )

    # Tabela: produtos
    if 'produtos' not in tables:
        op.create_table(
            'produtos',
            sa.Column('id', sa.String(length=100), primary_key=True),
            sa.Column('codigo', sa.String(length=50), nullable=False),
            sa.Column('nome', sa.String(length=255), nullable=False),
            sa.Column('categoria', sa.String(length=100), nullable=False),
            sa.Column('categoria_label', sa.String(length=100), nullable=False),
            sa.Column('destaque', sa.Boolean(), default=False),
            sa.Column('dimensoes', sa.String(length=100), nullable=True),
            sa.Column('resistencia', sa.String(length=100), nullable=True),
            sa.Column('peso', sa.String(length=100), nullable=True),
            sa.Column('rendimento', sa.String(length=100), nullable=True),
            sa.Column('paletizacao', sa.String(length=100), nullable=True),
            sa.Column('norma', sa.String(length=150), nullable=True),
            sa.Column('unidade', sa.String(length=50), default="un"),
            sa.Column('qtd_minima', sa.Integer(), default=10),
            sa.Column('incremento', sa.Integer(), default=10),
            sa.Column('pronta_entrega', sa.Boolean(), default=True),
            sa.Column('descricao_curta', sa.Text(), nullable=True),
            sa.Column('descricao_longa', sa.Text(), nullable=True),
            sa.Column('aplicacoes', sa.JSON(), nullable=True),
            sa.Column('tipo_icone', sa.String(length=50), default="bloco-padrao"),
            sa.Column('imagem_url', sa.Text(), nullable=True),
            sa.Column('ativo', sa.Boolean(), default=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
        )

    # Índices em produtos
    current_tables = inspector.get_table_names()
    if 'produtos' in current_tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('produtos')]
        if 'ix_produtos_id' not in indexes:
            op.create_index('ix_produtos_id', 'produtos', ['id'])
        if 'ix_produtos_codigo' not in indexes:
            op.create_index('ix_produtos_codigo', 'produtos', ['codigo'])
        if 'ix_produtos_categoria' not in indexes:
            op.create_index('ix_produtos_categoria', 'produtos', ['categoria'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'produtos' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('produtos')]
        if 'ix_produtos_categoria' in indexes:
            op.drop_index('ix_produtos_categoria', table_name='produtos')
        if 'ix_produtos_codigo' in indexes:
            op.drop_index('ix_produtos_codigo', table_name='produtos')
        if 'ix_produtos_id' in indexes:
            op.drop_index('ix_produtos_id', table_name='produtos')
        op.drop_table('produtos')

    if 'store_config' in tables:
        op.drop_table('store_config')
    if 'categorias' in tables:
        op.drop_table('categorias')
