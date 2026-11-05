import random
import uuid
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, update, not_
from sqlalchemy.exc import IntegrityError

from ..models.product import Product
from ..schemas.product import ProductCreate, ProductUpdate


class ProductService:
    @staticmethod
    def list_products(
        db: Session,
        categoria: Optional[str] = None,
        busca: Optional[str] = None,
        ordenacao: Optional[str] = "destaque",
        pode_ver_inativos: bool = False
    ) -> List[Product]:
        query = db.query(Product)

        if not pode_ver_inativos:
            query = query.filter(Product.ativo == True)

        if categoria and categoria != "todos":
            query = query.filter(Product.categoria == categoria)

        if busca and busca.strip():
            term = f"%{busca.strip().lower()}%"
            query = query.filter(
                or_(
                    Product.nome.ilike(term),
                    Product.codigo.ilike(term),
                    Product.dimensoes.ilike(term),
                    Product.descricao_curta.ilike(term)
                )
            )

        if ordenacao == "destaque":
            query = query.order_by(desc(Product.destaque), asc(Product.nome))
        elif ordenacao == "nome-desc":
            query = query.order_by(desc(Product.nome))
        else:
            query = query.order_by(asc(Product.nome))

        return query.all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: str, pode_ver_inativos: bool = False) -> Optional[Product]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or (not product.ativo and not pode_ver_inativos):
            return None
        return product

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Tuple[Optional[Product], Optional[str]]:
        """
        Retorna (produto_criado_ou_existente, erro_se_houver).
        Se houver erro de integridade (ex: categoria inexistente ou duplicidade), retorna (None, mensagem_erro).
        """
        prod_id = product_in.id or f"prod-{uuid.uuid4().hex[:12]}"
        codigo = product_in.codigo or f"WD-{random.randint(1000, 9999)}"

        product = Product(
            id=prod_id,
            codigo=codigo,
            nome=product_in.nome,
            categoria=product_in.categoria,
            categoria_label=product_in.categoriaLabel,
            destaque=product_in.destaque,
            dimensoes=product_in.dimensoes,
            resistencia=product_in.resistencia,
            peso=product_in.peso,
            rendimento=product_in.rendimento,
            paletizacao=product_in.paletizacao,
            norma=product_in.norma,
            unidade=product_in.unidade,
            qtd_minima=product_in.qtdMinima,
            incremento=product_in.incremento,
            pronta_entrega=product_in.prontaEntrega,
            descricao_curta=product_in.descricaoCurta,
            descricao_longa=product_in.descricaoLonga,
            aplicacoes=product_in.aplicacoes or [],
            tipo_icone=product_in.tipoIcone,
            imagem_url=product_in.imagemUrl,
            ativo=product_in.ativo if product_in.ativo is not None else True
        )

        try:
            db.add(product)
            db.commit()
            db.refresh(product)
            return product, None
        except IntegrityError as e:
            db.rollback()
            orig_msg = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
            if "fk_produtos_categoria" in orig_msg or "violates foreign key" in orig_msg:
                return None, f"A categoria '{product_in.categoria}' informada não existe."

            # Idempotência: se for repetição de requisição com os mesmos dados, retorna o produto existente
            existing = db.query(Product).filter((Product.id == prod_id) | (Product.codigo == codigo)).first()
            if existing and existing.nome == product_in.nome and existing.categoria == product_in.categoria:
                return existing, None

            return None, f"Conflito de duplicidade: já existe um produto com o código '{codigo}' ou ID '{prod_id}'."

    @staticmethod
    def update_product(db: Session, product_id: str, product_in: ProductUpdate) -> Tuple[Optional[Product], Optional[str]]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None, "not_found"

        update_data = product_in.model_dump(exclude_unset=True)
        mapping = {
            "categoriaLabel": "categoria_label",
            "qtdMinima": "qtd_minima",
            "prontaEntrega": "pronta_entrega",
            "descricaoCurta": "descricao_curta",
            "descricaoLonga": "descricao_longa",
            "tipoIcone": "tipo_icone",
            "imagemUrl": "imagem_url"
        }

        for key, value in update_data.items():
            col_name = mapping.get(key, key)
            if hasattr(product, col_name):
                setattr(product, col_name, value)

        try:
            db.commit()
            db.refresh(product)
            return product, None
        except IntegrityError:
            db.rollback()
            return None, "conflict"

    @staticmethod
    def toggle_pronta_entrega(db: Session, product_id: str, valor: Optional[bool] = None) -> Optional[Dict[str, Any]]:
        target_val = valor if valor is not None else not_(Product.pronta_entrega)
        stmt = (
            update(Product)
            .where(Product.id == product_id)
            .values(pronta_entrega=target_val)
            .returning(Product.id, Product.pronta_entrega)
        )
        result = db.execute(stmt).first()
        if not result:
            return None

        db.commit()
        return {"id": result[0], "prontaEntrega": result[1]}

    @staticmethod
    def toggle_ativo(db: Session, product_id: str, valor: Optional[bool] = None) -> Optional[Dict[str, Any]]:
        target_val = valor if valor is not None else not_(Product.ativo)
        stmt = (
            update(Product)
            .where(Product.id == product_id)
            .values(ativo=target_val)
            .returning(Product.id, Product.ativo)
        )
        result = db.execute(stmt).first()
        if not result:
            return None

        db.commit()
        return {"id": result[0], "ativo": result[1]}

    @staticmethod
    def delete_product(db: Session, product_id: str) -> bool:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False

        db.delete(product)
        db.commit()
        return True

