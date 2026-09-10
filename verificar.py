#!/usr/bin/env python3
"""
Verificacao do site antes de publicar.

Por que existe: o Windows nao diferencia maiusculas de minusculas em nomes
de arquivo, mas o GitHub Pages (Linux) diferencia. Entao um src="Foto.JPG"
apontando para "foto.jpg" funciona na sua maquina e da 404 no ar. Foi
exatamente o que aconteceu com Fotos_InterREP_A_Festa/TPD.jpeg.

Uso:
    python verificar.py

Sai com codigo 1 se achar problema, para poder virar hook de pre-commit.
"""

import os
import re
import sys
import urllib.parse

RAIZ = os.path.dirname(os.path.abspath(__file__))
IGNORAR_PASTAS = {'.git', 'node_modules', '.claude', '__pycache__'}
PAGINAS = ['index.html', 'casa.html']
FOLHAS = ['comum.css', 'base.css', 'casa.css']

def sem_comentarios(css):
    """Apaga o conteudo dos comentarios /* */ mas preserva as quebras de
    linha, para os numeros de linha continuarem batendo."""
    def branquear(m):
        return re.sub(r'[^\n]', ' ', m.group(0))
    return re.sub(r'/\*.*?\*/', branquear, css, flags=re.S)


PADRAO_REF = re.compile(
    r'(?:src|href|srcset)\s*=\s*"([^"]+)"'
    r'|url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)'
)

problemas = []


def arquivos_reais():
    """Todos os arquivos do projeto, com a grafia exata do disco."""
    encontrados = set()
    for pasta, subpastas, arquivos in os.walk(RAIZ):
        subpastas[:] = [d for d in subpastas if d not in IGNORAR_PASTAS]
        for nome in arquivos:
            caminho = os.path.join(pasta, nome)
            encontrados.add(os.path.relpath(caminho, RAIZ).replace(os.sep, '/'))
    return encontrados


REAIS = arquivos_reais()
REAIS_MINUSCULO = {r.lower(): r for r in REAIS}


def resolver(ref):
    """None se a referencia esta certa; senao, a descricao do problema."""
    caminho = urllib.parse.unquote(ref).replace('\\', '/')
    if caminho in REAIS:
        return None
    correto = REAIS_MINUSCULO.get(caminho.lower())
    if correto:
        return 'maiusculas/minusculas erradas -> o certo e "%s"' % correto
    return 'arquivo nao existe'


def checar_referencias():
    for arquivo in PAGINAS + FOLHAS:
        texto = open(os.path.join(RAIZ, arquivo), encoding='utf-8').read()
        vistos = set()
        for achado in PADRAO_REF.finditer(texto):
            ref = (achado.group(1) or achado.group(2)).strip()
            candidatos = [ref]
            if ',' in ref and resolver(ref):          # provavel srcset
                candidatos = [c.strip().split(' ')[0] for c in ref.split(',')]
            for cand in candidatos:
                if not cand or cand.startswith(('http', '#', 'mailto', 'data:')):
                    continue
                if cand in vistos:
                    continue
                vistos.add(cand)
                erro = resolver(cand)
                if erro:
                    problemas.append('%s: "%s" -- %s' % (arquivo, cand, erro))


def checar_ancoras():
    """Todo href="#alvo" precisa de um id correspondente na mesma pagina."""
    for pagina in PAGINAS:
        texto = open(os.path.join(RAIZ, pagina), encoding='utf-8').read()
        ids = set(re.findall(r'id="([^"]+)"', texto))
        for alvo in re.findall(r'href="#([^"]+)"', texto):
            if alvo and alvo not in ids:
                problemas.append('%s: ancora "#%s" nao tem id correspondente' % (pagina, alvo))


def checar_imagens():
    """width/height ausentes causam salto de layout; alt ausente quebra leitor de tela."""
    for pagina in PAGINAS:
        texto = open(os.path.join(RAIZ, pagina), encoding='utf-8').read()
        for tag in re.findall(r'<img\b[^>]*>', texto):
            src = re.search(r'src="([^"]*)"', tag)
            nome = src.group(1) if src else '(sem src)'
            if 'alt=' not in tag:
                problemas.append('%s: <img> sem alt -- %s' % (pagina, nome))
            if 'width=' not in tag or 'height=' not in tag:
                problemas.append('%s: <img> sem width/height (causa salto de layout) -- %s' % (pagina, nome))


def checar_clamps():
    """clamp(min, ideal, max) com max <= min nao faz o que aparenta."""
    for folha in FOLHAS:
        texto = sem_comentarios(open(os.path.join(RAIZ, folha), encoding='utf-8').read())
        for linha_num, linha in enumerate(texto.split('\n'), 1):
            for m in re.finditer(r'clamp\(\s*([\d.]+)px\s*,[^,]+,\s*([\d.]+)px\s*\)', linha):
                minimo, maximo = float(m.group(1)), float(m.group(2))
                if maximo < minimo:
                    problemas.append('%s:%d: clamp com maximo MENOR que o minimo -- %s' % (folha, linha_num, m.group(0)))
                elif maximo == minimo:
                    problemas.append('%s:%d: clamp com minimo igual ao maximo (nao escala) -- %s' % (folha, linha_num, m.group(0)))


def checar_border_sem_estilo():
    """'border: cor' sozinho nao pinta nada: falta espessura e estilo."""
    for folha in FOLHAS:
        texto = sem_comentarios(open(os.path.join(RAIZ, folha), encoding='utf-8').read())
        for linha_num, linha in enumerate(texto.split('\n'), 1):
            m = re.search(r'border:\s*([^;]+);', linha)
            if m:
                valor = m.group(1).strip()
                tem_estilo = re.search(r'\b(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)\b', valor)
                # 'border: 0' e 'border: none' sao resets legitimos
                eh_reset = valor in ('0', '0px', 'none')
                # so e erro quando o valor e SO uma cor: #hex, rgb(), var() ou nome
                so_cor = re.fullmatch(r'#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|var\(--[\w-]+\)|[a-z]+', valor)
                if not tem_estilo and not eh_reset and so_cor:
                    problemas.append('%s:%d: "border: %s" nao pinta nada (falta espessura e estilo, ex: 2px solid) '
                                     % (folha, linha_num, valor))


def main():
    checar_referencias()
    checar_ancoras()
    checar_imagens()
    checar_clamps()
    checar_border_sem_estilo()

    if problemas:
        print('%d problema(s) encontrado(s):\n' % len(problemas))
        for p in problemas:
            print('  - ' + p)
        return 1

    print('Tudo certo: referencias, ancoras, imagens, clamps e bordas.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
