# Daniel Vieira Fernandes — Portfólio

Portfólio em HTML, CSS e JavaScript, com apresentação pessoal, projetos, habilidades, currículo e contato. A ilustração em Three.js é opcional: a navegação e o conteúdo continuam disponíveis sem WebGL ou sem acesso à biblioteca.

## Arquivos

- `index.html`: conteúdo e links.
- `styles.css`: estilos originais da branch main, com ajustes para os textos atuais e a seção de currículo.
- `portfolio.js`: navegação, botão de copiar e-mail e ilustração 3D.
- `Daniel_Vieira_Desenvolvedor.pdf`: currículo para abrir ou baixar.
- `Daniel_Vieira_Desenvolvedor.tex`: fonte LaTeX principal para as próximas edições do currículo.

Abra `index.html` no navegador ou use um servidor HTTP local. A ilustração de cubos e cristal respeita a preferência de movimento reduzido e suspende a animação fora da tela. Os contatos são apresentados em botões com ícones.

## Publicar no GitHub Pages

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Selecione a branch **main**, pasta **/ (root)**, e salve.

Após a publicação, o endereço será https://danielvieirafernandes.github.io/portfolio/.

Para atualizar o currículo, edite `Daniel_Vieira_Desenvolvedor.tex` neste projeto e compile com `pdflatex Daniel_Vieira_Desenvolvedor.tex`. Confira o PDF gerado antes de publicar, mantendo o nome `Daniel_Vieira_Desenvolvedor.pdf` usado pelos links do site.
