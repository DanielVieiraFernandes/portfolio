# Daniel Vieira Fernandes — Portfólio

Landing page pessoal em HTML, CSS e JavaScript, sem build. Apresentação focada em .NET, três projetos, experiência, habilidades e contato. O currículo fica disponível no cabeçalho, na abertura e na seção de contato.

## Estrutura

- `index.html`: conteúdo semântico (abertura, projetos, experiência, habilidades, contato).
- `styles.css`: identidade visual, layout responsivo e animações.
- `portfolio.js`: menu móvel, seção ativa, cabeçalho ao rolar, inclinação do cartão, prévia animada do Health Check e cópia do e-mail.
- `assets/daniel-avatar.webp`: retrato otimizado para a web (gerado a partir de `daniel-avatar.png`; prompt em `assets/avatar-prompt.md`).
- `Daniel_Vieira_Desenvolvedor.pdf` / `.tex`: currículo e sua fonte LaTeX.

## Direção visual

- Paleta tirada do próprio retrato: fundo ameixa profundo, luz de contorno violeta e menta, e o azul do headset.
- Uma única família tipográfica, Bricolage Grotesque, usando o eixo de tamanho óptico para títulos enormes e texto corrido.
- Retícula de pontos (halftone) como referência ao traço de quadrinho do retrato.
- Um único elemento ousado: o cartão holográfico na abertura, que inclina e reflete conforme o ponteiro.
- Uma única sequência de entrada ao carregar a página; o resto fica parado. A prévia do Health Check se atualiza apenas quando está visível.
- Cada projeto tem sua própria ilustração (painel de monitoramento, gráfico financeiro, camadas da Clean Architecture). Os dados são ilustrativos.

## Acessibilidade e robustez

- `prefers-reduced-motion` desativa entrada, inclinação e a prévia animada.
- Sem JavaScript, todo o conteúdo, links e currículo continuam disponíveis.
- Foco visível em todos os elementos interativos; menu móvel fecha com Escape.
- Impressão exibe o conteúdo em preto e branco, sem ilustrações.

## Validação

Conferir larguras de 320, 390, 768, 1024 e 1440 px; menu móvel e Escape; navegação por teclado; detalhes técnicos; links de currículo; cópia do e-mail; âncoras diretas; animações na rolagem; movimento reduzido; conteúdo sem JavaScript e sem IntersectionObserver.

## Publicar no GitHub Pages

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Selecione a branch **main**, pasta **/ (root)**, e salve.

Após a publicação, o endereço será https://danielvieirafernandes.github.io/portfolio/.

Para atualizar o currículo, edite `Daniel_Vieira_Desenvolvedor.tex` e compile com `pdflatex Daniel_Vieira_Desenvolvedor.tex`. Confira o PDF antes de publicar, mantendo o nome usado pelos links.
