# Daniel Vieira Fernandes — Portfólio

Portfólio pessoal em HTML, CSS e JavaScript, sem build.

A página principal (`index.html`) é o **DanielOS**, uma interface de sistema operacional: área de trabalho com ícones, dock, janelas que arrastam, minimizam e maximizam, e um "Visual Studio Code" em que abrir a pasta `portfolio` revela a apresentação (foto, projetos, experiência, habilidades e contato). Também há um terminal com comandos (`ajuda`, `projetos`, `contato`, `neofetch`…), um visualizador do currículo em PDF e um navegador que mostra a versão clássica.

A landing page anterior continua disponível em `classic.html`.

## Rodar localmente

Na pasta do projeto, suba qualquer servidor estático, por exemplo `python -m http.server 5500`, e abra http://localhost:5500.

## Estrutura do DanielOS

- `index.html`: casca do sistema (tela de boot, barra superior, área de trabalho e dock).
- `os/content.js`: todo o conteúdo (projetos, experiência, habilidades, contato e os arquivos que aparecem no editor). Edite aqui para atualizar textos.
- `os/os.js`: gerenciador de janelas e aplicativos (editor, projetos, terminal, currículo, contato, navegador e lixeira).
- `os/os.css`: visual do sistema, com a mesma paleta do retrato. No celular as janelas abrem em tela cheia.
- `index.html#terminal`, `#pdf`, `#contact`, `#files`: abrem direto um aplicativo.

## Estrutura da versão clássica

- `classic.html`: conteúdo semântico (abertura, projetos, experiência, habilidades, contato).
- `styles.css`: identidade visual, layout responsivo e animações.
- `portfolio.js`: menu móvel, seção ativa, cabeçalho ao rolar, inclinação do cartão, prévia animada do Health Check e cópia do e-mail.
- `assets/daniel-avatar.webp`: retrato otimizado para a web (gerado a partir de `daniel-avatar.png`; prompt em `assets/avatar-prompt.md`).
- `Daniel_Vieira_Desenvolvedor.pdf` / `.tex`: currículo e sua fonte LaTeX.

## Direção visual

- Paleta tirada do próprio retrato: fundo ameixa profundo, luz de contorno violeta e menta, e o azul do headset.
- Uma única família tipográfica, Bricolage Grotesque, usando o eixo de tamanho óptico para títulos enormes e texto corrido.
- Retícula de pontos (halftone) como referência ao traço de quadrinho do retrato.
- Um único elemento ousado: o cartão holográfico na abertura. No desktop ele inclina com o mouse; no celular, com o arrastar do dedo, voltando com efeito de mola ao soltar. Um toque, clique ou o botão "Virar cartão" mostra o verso com atalhos de contato. Em telas de toque, o cartão balança uma vez ao aparecer para indicar que é interativo.
- O cartão flutua devagar, subindo e descendo com uma leve rotação.
- Fora isso, uma única sequência de entrada ao carregar a página; o resto fica parado. A prévia do Health Check se atualiza apenas quando está visível.
- Cada projeto tem sua própria ilustração (painel de monitoramento, gráfico financeiro, camadas da Clean Architecture). Os dados são ilustrativos.

## Acessibilidade e robustez

- `prefers-reduced-motion` desativa entrada, flutuação, inclinação e a prévia animada; o cartão ainda vira, sem animação.
- O verso do cartão fica `inert` enquanto não está visível, e o botão de virar usa `aria-pressed`. Arrastar na vertical sobre o cartão continua rolando a página.
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
