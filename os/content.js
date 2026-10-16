'use strict';

/* Everything the "OS" shows lives here, so the content is easy to edit
   without touching the window manager. Text mirrors classic.html. */

const LINKS = {
  email: 'fernandesdanielvieira@gmail.com',
  github: 'https://github.com/DanielVieiraFernandes',
  linkedin: 'https://www.linkedin.com/in/danielvieiradev/',
  resume: 'Daniel_Vieira_Desenvolvedor.pdf'
};

const PROJECTS = [
  {
    id: 'health-check-monitor',
    name: 'Health Check Monitor',
    kicker: 'Monitoramento de serviços',
    color: 'mint',
    lede: 'Um painel para saber, a qualquer momento, se suas APIs, bancos e Redis estão respondendo, e quão rápido.',
    points: [
      'Worker em .NET 10 com até 20 verificações simultâneas, intervalos e timeouts configuráveis',
      'Histórico de disponibilidade e latência salvo em PostgreSQL, com limpeza periódica',
      'Login com cookies, sessões e revogação de tokens JWT via Redis',
      'Logs estruturados com Serilog e Seq'
    ],
    tags: ['.NET 10', 'Blazor Server', 'PostgreSQL', 'Redis', 'Docker'],
    url: 'https://github.com/DanielVieiraFernandes/Health-Check-Monitor'
  },
  {
    id: 'cashflow',
    name: 'CashFlow',
    kicker: 'Gestão financeira',
    color: 'violet',
    lede: 'Orçamento e transações financeiras com as regras de negócio separadas do acesso aos dados e cobertas por testes automatizados.',
    points: [
      'Regras de negócio isoladas da camada de dados',
      'Testes automatizados com xUnit'
    ],
    tags: ['.NET', 'PostgreSQL', 'xUnit'],
    url: 'https://github.com/DanielVieiraFernandes/CashFlow'
  },
  {
    id: 'nest-clean',
    name: 'Nest Clean',
    kicker: 'Arquitetura de backend',
    color: 'blue',
    lede: 'Backend modular em NestJS seguindo Clean Architecture: o domínio não conhece o banco nem o framework. Desenvolvido guiado por testes.',
    points: [
      'Domínio independente de banco e framework',
      'Desenvolvido guiado por testes com Vitest'
    ],
    tags: ['NestJS', 'TypeScript', 'Vitest'],
    url: 'https://github.com/DanielVieiraFernandes/05-NEST-CLEAN'
  }
];

const JOBS = [
  {
    company: 'Automahelp',
    role: 'Estagiário em desenvolvimento C# e Blazor',
    period: 'ago. 2025 até hoje',
    current: true,
    items: [
      'Migração de um ERP legado em VB para ASP.NET Core e Blazor. Desenvolvi o módulo fiscal de NF-e, com integração direta à SEFAZ, serialização de XML e validações tributárias.',
      'Módulo de entrada de mercadorias integrando estoque, custos, margens e contas a pagar, com cancelamento que reverte as alterações e trilha de auditoria.',
      'Leitura de XMLs locais na web com File System Access API e IndexedDB, em blocos de até 50 MB e carregamento progressivo.'
    ]
  },
  {
    company: 'Axion IT',
    role: 'Desenvolvedor React Native e NestJS',
    period: 'dez. 2024 a jul. 2025',
    items: [
      'Funcionalidades de ponta a ponta, transformando requisitos de negócio em APIs e telas mobile.',
      'Liderei o front-end de sistemas de gestão, com Zustand e integração de leitores de código.'
    ]
  }
];

const EDUCATION = 'Análise e Desenvolvimento de Sistemas: tecnólogo na UNIP, conclusão prevista em 2028. Técnico pela Etec, concluído em 2024.';

const SKILLS = [
  { group: 'Backend', note: 'APIs, regras de negócio e serviços em segundo plano', items: ['C#', '.NET', 'ASP.NET Core', 'Worker Service', 'NestJS', 'TypeScript', 'JWT'] },
  { group: 'Interfaces', note: 'Telas web e mobile interativas', items: ['Blazor', 'MudBlazor', 'Syncfusion', 'React Native', 'JS interop'] },
  { group: 'Dados', note: 'Persistência, cache e integrações', items: ['PostgreSQL', 'Redis', 'EF Core', 'Dapper', 'REST', 'SOAP'] },
  { group: 'Qualidade', note: 'Testes, observabilidade e deploy', items: ['xUnit', 'Vitest', 'Serilog', 'Seq', 'Docker', 'Azure DevOps'] },
  { group: 'IA', note: 'Modelos e agentes integrados às aplicações', items: ['Agentes de IA', 'Integração com modelos', 'Orquestração'] }
];

/* ------------------------------------------------ Source files shown in the editor */
const projectMarkdown = p => `# ${p.name}

> ${p.kicker}

${p.lede}

## Destaques
${p.points.map(x => `- ${x}`).join('\n')}

## Stack
${p.tags.map(t => `\`${t}\``).join(' ')}

[Ver código no GitHub](${p.url})
`;

const FILES = {
  'README.md': {
    lang: 'markdown',
    preview: 'readme',
    source: `# Daniel Vieira

![Retrato de Daniel Vieira](assets/daniel-avatar.webp)

**Desenvolvedor full stack .NET** · Hortolândia, SP

Do backend à experiência. Construo aplicações com **C#, ASP.NET Core e Blazor**:
APIs, telas que as pessoas usam todos os dias e as integrações que mantêm
tudo conversando.

## Agora
Migrando um ERP legado em VB para ASP.NET Core e Blazor, com módulo fiscal
de NF-e integrado à SEFAZ.

## Explore este projeto
- [projetos/](projetos/) o que eu construo quando o problema é meu
- [experiencia.json](experiencia.json) onde coloquei código em produção
- [Habilidades.cs](Habilidades.cs) as ferramentas do dia a dia
- [contato.ts](contato.ts) vamos conversar?
- [curriculo.pdf](${LINKS.resume})
`
  },
  'projetos/health-check-monitor.md': { lang: 'markdown', preview: 'project:health-check-monitor', source: projectMarkdown(PROJECTS[0]) },
  'projetos/cashflow.md': { lang: 'markdown', preview: 'project:cashflow', source: projectMarkdown(PROJECTS[1]) },
  'projetos/nest-clean.md': { lang: 'markdown', preview: 'project:nest-clean', source: projectMarkdown(PROJECTS[2]) },
  'experiencia.json': {
    lang: 'json',
    preview: 'experience',
    source: JSON.stringify({
      experiencia: JOBS.map(j => ({ empresa: j.company, cargo: j.role, periodo: j.period, ...(j.current ? { atual: true } : {}), entregas: j.items })),
      formacao: EDUCATION
    }, null, 2)
  },
  'Habilidades.cs': {
    lang: 'csharp',
    preview: 'skills',
    source: `namespace DanielVieira.Portfolio;

// As ferramentas que uso no dia a dia, agrupadas pelo que resolvem.
public static class Habilidades
{
${SKILLS.map(s => `    // ${s.note}
    public static readonly string[] ${s.group.replace(/\s/g, '')} =
    [
        ${s.items.map(i => `"${i}"`).join(', ')}
    ];`).join('\n\n')}
}
`
  },
  'contato.ts': {
    lang: 'typescript',
    preview: 'contact',
    source: `// Tem uma vaga ou um projeto? Vamos conversar.
export const contato = {
  email: "${LINKS.email}",
  linkedin: "${LINKS.linkedin}",
  github: "${LINKS.github}",
  curriculo: "${LINKS.resume}",
  local: "Hortolândia, SP",
} as const;

export async function falarComDaniel(mensagem: string): Promise<void> {
  window.location.href = \`mailto:\${contato.email}?body=\${encodeURIComponent(mensagem)}\`;
}
`
  }
};

/* Folder tree for the editor's explorer (order matters). */
const TREE = [
  { folder: 'projetos', children: ['projetos/health-check-monitor.md', 'projetos/cashflow.md', 'projetos/nest-clean.md'] },
  'contato.ts',
  'curriculo.pdf',
  'experiencia.json',
  'Habilidades.cs',
  'README.md'
];
