"""add_concurrency_constraints

Revision ID: 002_add_concurrency_constraints
Revises: 001_initial_schema
Create Date: 2026-11-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_concurrency_constraints'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'produtos' in tables:
        indexes = inspector.get_indexes('produtos')
        index_names = [idx['name'] for idx in indexes]

        # 1. Torna o índice do código estritamente UNIQUE para evitar duplicatas em requisições paralelas
        if 'ix_produtos_codigo' in index_names:
            op.drop_index('ix_produtos_codigo', table_name='produtos')

        if 'uq_produtos_codigo' not in index_names and 'ix_produtos_codigo' not in index_names:
            op.create_index('uq_produtos_codigo', 'produtos', ['codigo'], unique=True)

        # 2. Adiciona Foreign Key entre produtos e categorias para impedir deleção com produtos órfãos
        if 'categorias' in tables:
            # Garante que qualquer categoria referenciada em produtos já existentes esteja presente em categorias
            op.execute("""
                INSERT INTO categorias (id, label)
                SELECT DISTINCT p.categoria, COALESCE(NULLIF(p.categoria_label, ''), p.categoria)
                FROM produtos p
                LEFT JOIN categorias c ON p.categoria = c.id
                WHERE c.id IS NULL AND p.categoria IS NOT NULL
                ON CONFLICT (id) DO NOTHING;
            """)

            fks = inspector.get_foreign_keys('produtos')
            fk_names = [fk['name'] for fk in fks]
            if 'fk_produtos_categoria' not in fk_names:
                op.create_foreign_key(
                    'fk_produtos_categoria',
                    source_table='produtos',
                    referent_table='categorias',
                    local_cols=['categoria'],
                    remote_cols=['id'],
                    ondelete='RESTRICT',
                    onupdate='CASCADE'
                )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'produtos' in tables:
        fks = inspector.get_foreign_keys('produtos')
        fk_names = [fk['name'] for fk in fks]
        if 'fk_produtos_categoria' in fk_names:
            op.drop_constraint('fk_produtos_categoria', 'produtos', type_='foreignkey')

        indexes = inspector.get_indexes('produtos')
        index_names = [idx['name'] for idx in indexes]
        if 'uq_produtos_codigo' in index_names:
            op.drop_index('uq_produtos_codigo', table_name='produtos')
            op.create_index('ix_produtos_codigo', 'produtos', ['codigo'], unique=False)

