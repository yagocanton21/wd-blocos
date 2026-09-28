from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List

class ProductBase(BaseModel):
    codigo: Optional[str] = None
    nome: str
    categoria: str
    categoriaLabel: str = Field(alias="categoria_label")
    destaque: Optional[bool] = False
    dimensoes: Optional[str] = ""
    resistencia: Optional[str] = ""
    peso: Optional[str] = ""
    rendimento: Optional[str] = ""
    paletizacao: Optional[str] = ""
    norma: Optional[str] = "ABNT NBR 6136"
    unidade: Optional[str] = "un"
    qtdMinima: Optional[int] = Field(default=10, alias="qtd_minima")
    incremento: Optional[int] = 10
    prontaEntrega: Optional[bool] = Field(default=True, alias="pronta_entrega")
    descricaoCurta: Optional[str] = Field(default="", alias="descricao_curta")
    descricaoLonga: Optional[str] = Field(default="", alias="descricao_longa")
    aplicacoes: Optional[List[str]] = []
    tipoIcone: Optional[str] = Field(default="bloco-padrao", alias="tipo_icone")
    imagemUrl: Optional[str] = Field(default=None, alias="imagem_url")
    ativo: Optional[bool] = True

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class ProductCreate(ProductBase):
    id: Optional[str] = None

class ProductUpdate(BaseModel):
    codigo: Optional[str] = None
    nome: Optional[str] = None
    categoria: Optional[str] = None
    categoriaLabel: Optional[str] = Field(default=None, alias="categoria_label")
    destaque: Optional[bool] = None
    dimensoes: Optional[str] = None
    resistencia: Optional[str] = None
    peso: Optional[str] = None
    rendimento: Optional[str] = None
    paletizacao: Optional[str] = None
    norma: Optional[str] = None
    unidade: Optional[str] = None
    qtdMinima: Optional[int] = Field(default=None, alias="qtd_minima")
    incremento: Optional[int] = None
    prontaEntrega: Optional[bool] = Field(default=None, alias="pronta_entrega")
    descricaoCurta: Optional[str] = Field(default=None, alias="descricao_curta")
    descricaoLonga: Optional[str] = Field(default=None, alias="descricao_longa")
    aplicacoes: Optional[List[str]] = None
    tipoIcone: Optional[str] = Field(default=None, alias="tipo_icone")
    imagemUrl: Optional[str] = Field(default=None, alias="imagem_url")
    ativo: Optional[bool] = None

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class ProductResponse(ProductBase):
    id: str

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        # Serializa por padrão usando os nomes camelCase
        serialize_by_alias=False
    )
