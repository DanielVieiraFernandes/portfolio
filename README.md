# Daniel Vieira Fernandes — Portfólio

Landing page pessoal em HTML, CSS e JavaScript. Apresentação focada em C# e .NET, três projetos, habilidades e contato. O currículo fica disponível na abertura, no cabeçalho e na seção de contato.

## Estrutura

- `index.html`: conteúdo semântico, links, projetos e detalhes técnicos expansíveis.
- `styles.css`: identidade escura com acentos em lavanda, layout responsivo e transições.
- `portfolio.js`: menu móvel, indicação da seção atual, entrada de conteúdo durante a rolagem e cópia do e-mail.
- `assets/daniel-avatar.png`: retrato ilustrado criado anteriormente com ImageGen. Prompt em `assets/avatar-prompt.md`.
- `Daniel_Vieira_Desenvolvedor.pdf`: currículo para visualizar ou baixar.
- `Daniel_Vieira_Desenvolvedor.tex`: fonte LaTeX do currículo.

Abra `index.html` no navegador ou utilize um servidor HTTP local. Não há dependências de build nem bibliotecas de animação. As fontes do Google Fonts têm alternativas locais.

## Decisões de UX

- Apresentação e ações principais sempre visíveis, sem tela de carregamento.
- Um projeto em destaque e dois projetos complementares, sem filtros para uma lista pequena.
- Informações técnicas adicionais em elementos `details` nativos, acessíveis por teclado e sem JavaScript.
- Habilidades de IA apresentadas como competências, junto das demais habilidades.
- A prévia do Health Check Monitor é conceitual, com dados ilustrativos.
- Entradas de 650 ms com deslocamento de 22 px, uma única vez por bloco. Sem animações contínuas, parallax ou alteração da rolagem do navegador.
- Conteúdo visível por padrão. A animação é um aprimoramento ativado apenas quando há suporte a IntersectionObserver. Links diretos e foco por teclado revelam os blocos imediatamente.
- `prefers-reduced-motion` desativa os movimentos, inclusive quando a preferência muda durante a visita. A impressão também exibe todo o conteúdo.
- Sem JavaScript, navegação, projetos, currículo, contatos e detalhes técnicos continuam disponíveis.

## Validação

Conferir larguras de 320, 390, 768, 1024 e 1440 px; menu móvel e Escape; navegação por teclado; detalhes técnicos; links de currículo; cópia do e-mail; âncoras diretas; animações na rolagem; movimento reduzido; conteúdo sem JavaScript e sem IntersectionObserver.

## Publicar no GitHub Pages

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Selecione a branch **main**, pasta **/ (root)**, e salve.

Após a publicação, o endereço será https://danielvieirafernandes.github.io/portfolio/.

Para atualizar o currículo, edite `Daniel_Vieira_Desenvolvedor.tex` e compile com `pdflatex Daniel_Vieira_Desenvolvedor.tex`. Confira o PDF antes de publicar, mantendo o nome usado pelos links.
