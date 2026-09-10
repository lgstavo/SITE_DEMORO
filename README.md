# Site da República Demorô

Site institucional da República Demorô, república universitária de São Carlos
fundada em 2005. Site estático: HTML, CSS e JavaScript sem build.

Aluno: Luiz Gustavo da Silva Barros
RA: 800225

## Como rodar

Não há passo de build. Basta servir a pasta:

```bash
python -m http.server 5599
```

E abrir <http://localhost:5599>. Abrir o `index.html` direto pelo `file://`
também funciona, mas o vídeo do YouTube e as fontes podem falhar.

## Antes de publicar

```bash
python verificar.py
```

Checa referências de arquivo (respeitando maiúsculas/minúsculas, porque o
GitHub Pages diferencia e o Windows não), âncoras sem `id` correspondente,
`<img>` sem `alt` ou sem `width`/`height`, `clamp()` degenerado e `border`
sem estilo. Sai com código 1 se achar problema.

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | Página inicial: sobre, eventos, moradores |
| `casa.html` | Página da casa: cômodos e contato |
| `404.html` | Página de erro (o GitHub Pages usa automaticamente) |
| `comum.css` | **Paleta e o que as duas páginas compartilham** |
| `base.css` | Só do `index.html` |
| `casa.css` | Só do `casa.html` e da `404.html` |
| `script.js` | Menu, animações, carrossel e player do vídeo |
| `verificar.py` | Verificação pré-publicação |

Pastas de mídia: `Background/`, `fonts/`, `images/`, `FOTOS_CASA/`,
`FOTOS_CHURRAS_PAIS/`, `FOTO_REENCONTRO/`, `Fotos_InterREP/`,
`Fotos_InterREP_A_Festa/`, `Fotos_Moradores/`.

## Decisões que valem saber antes de mexer

**A paleta vive em `comum.css`, no `:root`.** Toda cor sai de uma variável
(`--cor-texto`, `--cor-marca`, etc). Para mudar o visual, mexa lá — não
espalhe `#hex` pelas folhas. O tema claro do desktop funciona redefinindo
esses tokens dentro do `@media (min-width: 768px)` do `base.css`.

**O que é compartilhado fica em `comum.css`.** Fontes, menu, hambúrguer,
hero e animações moravam duplicados em `base.css` e `casa.css`. As duas
cópias divergiram e isso quebrou o menu do celular. Não duplique de novo.

**O breakpoint é 768px**, igual ao `md:` do Tailwind. Ele aparece em
`comum.css`, `base.css`, `casa.css` e no `script.js` — se mudar, mude nos
quatro.

**O `<iframe>` do vídeo não está no HTML de propósito.** `display: none` não
impede o navegador de baixar o embed, então o desktop pagaria por um player
que nunca vê. O `script.js` cria o player só no mobile, a partir do
`<div class="video-slot" data-youtube-id="..." data-scroll-para="...">`.

**As animações de entrada estão sob `.js`.** Um script no `<head>` adiciona
essa classe. Sem JavaScript nada fica com `opacity: 0`, então o conteúdo
continua visível.

**Imagens são servidas em ~2× o tamanho de exibição.** Ao trocar uma foto,
redimensione antes: as dos moradores aparecem a 200×300 (arquivo 400px de
largura), as de eventos a 400×300 (arquivo 800px). E atualize os atributos
`width`/`height`, senão a página salta ao carregar.

## Publicação

GitHub Pages a partir da raiz do repositório. O `index.html` precisa
continuar na raiz para ser servido como página inicial.
