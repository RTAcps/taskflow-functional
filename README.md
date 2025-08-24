# taskflow-functional

Micro Frontend Angular (Remote) focado em funcionalidades de Analytics/Relatórios. Expõe componentes e serviços para visualização de métricas, filtros e exportações, integrável em um Host Angular via Module Federation.

[![Angular](https://img.shields.io/badge/Angular-19-dd0031?logo=angular&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#licença)

Sumário
- Visão Geral
- Requisitos
- Instalação e Setup
- Scripts Disponíveis
- Desenvolvimento (Remote em 4203)
- Integração em Host Angular (Module Federation)
- Configuração (Tokens e Endpoints)
- Theming e Estilos (SCSS/Tailwind)
- Testes e Qualidade
- Contribuição
- Licença

## Visão Geral
Este remote encapsula:
- Componentes de UI para relatórios analíticos e dashboards
- Filtros dinâmicos (datas, status, responsáveis, etc.)
- Exportações (p.ex. CSV/PDF) e interações com SweetAlert2
- Pronto para integração com Hosts Angular via Module Federation

Stack e arquitetura:
- Angular 19 (CLI puro), TypeScript, RxJS
- Angular Material/CDK
- Module Federation (@angular-architects/module-federation, ngx-build-plus)
- SCSS e Tailwind CSS

## Requisitos
- Node.js 18.19+ ou 20.11+ (recomendado LTS) ou 22+
- npm 9+ (ou pnpm/yarn; note que o script clean usa pnpm)
- Angular CLI 19+ (global opcional)
- Navegador Chrome/Chromium (Karma)

## Instalação e Setup
Clone e instale dependências:
```bash
git clone https://github.com/RTAcps/taskflow-functional.git
cd taskflow-functional
npm install
```

Ambiente limpo (opcional):
```bash
# requer pnpm instalado (npm i -g pnpm) ou troque o script para npm
npm run clean
```

## Scripts Disponíveis

- Desenvolvimento (serve na porta 4203):
  - `pnpm start` → `ng serve --port 4203`
  - `pnpm start:clean` → limpa caches locais e inicia em 4203
- Builds:
  - `pnpm build` → build padrão (dev)
  - `pnpm build:prod` → build com `--configuration production`
  - `pnpm watch` → build contínuo em desenvolvimento
- Testes:
  - `pnpm test` → `ng test`
- Limpeza:
  - `pnpm clean` → remove dist, caches, node_modules, limpa cache npm/ng e executa `pnpm install`
    - Observação: requer pnpm instalado globalmente ou use `npx pnpm install`
  - `pnpm clean:local` → remove dist e cache do Angular local

Dica: use `npm run ou pnpm` para listar todos os scripts disponíveis.


## Desenvolvimento (Remote em 4203)
Suba o remote:
```bash
npm start
# http://localhost:4203
```

Se precisar (re)configurar o Module Federation:
```bash
# ajuste o nome do projeto se diferente
ng add @angular-architects/module-federation --project taskflow-functional --type remote --port 4203
```

Isso cria/atualiza arquivos como:
- module-federation.config.js (ou .ts)
- ajustes no angular.json para o builder de MF
- bootstrap e entradas de remote

Exemplo (genérico) de configuração do remote:
```js
// module-federation.config.js (exemplo - ajuste caminhos)
module.exports = {
  name: 'functional',
  exposes: {
    './Module': './src/app/remote-entry/remote-entry.module.ts',
    // ou, se expor standalone:
    // './AnalyticsComponent': './src/app/features/analytics/analytics.component.ts',
  },
  // shared: { ... } // compartilhe @angular/*, rxjs, etc. conforme schematic
};
```

## Integração em Host Angular (Module Federation)
No Host (Angular CLI), referencie o remote.

1) module-federation.config.js do Host:
```js
module.exports = {
  remotes: {
    functional: 'functional@http://localhost:4203/remoteEntry.js',
  },
};
```

2) Rotas do Host usando loadRemoteModule:
```ts
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: 'analytics',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4203/remoteEntry.js',
        exposedModule: './Module', // ajuste conforme exposto no remote
      }).then((m) => m.RemoteEntryModule),
    // Alternativa (standalone):
    // loadComponent: () =>
    //   loadRemoteModule({
    //     type: 'module',
    //     remoteEntry: 'http://localhost:4203/remoteEntry.js',
    //     exposedModule: './AnalyticsComponent',
    //   }).then((m) => m.AnalyticsComponent),
  },
];
```

Observações:
- Se rodar vários remotes (ex.: taskflow-component, taskflow-functional), use portas diferentes (4201, 4203, …).
- Para produção, considere resolver o remoteEntry de forma dinâmica (manifesto/variáveis de ambiente).

## Configuração (Tokens e Endpoints)
Utilize InjectionTokens para configurar endpoints e flags.

Exemplo:
```ts
// src/app/core/tokens.ts
import { InjectionToken } from '@angular/core';

export interface FunctionalConfig {
  apiBaseUrl: string;
  exportEnabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const FUNCTIONAL_CONFIG = new InjectionToken<FunctionalConfig>('FUNCTIONAL_CONFIG');
```

Forneça no Host ou no App do remote:
```ts
providers: [
  {
    provide: FUNCTIONAL_CONFIG,
    useValue: {
      apiBaseUrl: 'https://api.seudominio.com/analytics',
      exportEnabled: true,
      logLevel: 'info',
    },
  },
];
```

Uso em serviços (exemplo simplificado):
```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FUNCTIONAL_CONFIG } from './tokens';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly cfg = inject(FUNCTIONAL_CONFIG);
  private readonly http = inject(HttpClient);

  getReport(params: Record<string, string | number>) {
    return this.http.get(`${this.cfg.apiBaseUrl}/reports`, { params: params as any });
  }
}
```

## Theming e Estilos (SCSS/Tailwind)
- Tailwind CSS 3.3.5 + PostCSS 8.4.31 + Autoprefixer (conforme devDependencies)
- Inclua as diretivas no estilo global:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- Garanta que tailwind.config.js aponte para templates do Angular (src/**/*.html, src/**/*.ts).
- Use SCSS para tokens e variáveis locais; se o Host fornecer tema, exponha CSS variables para override.

## Testes e Qualidade
- Unit tests: Jasmine + Karma
```bash
npm test
# cobertura (exemplo)
ng test --code-coverage
```
- Lint/Format (se configurados): recomenda-se ESLint e Prettier.

## Contribuição
1. Abra uma issue descrevendo bug/feature
2. Crie uma branch `feat/nome-curto` ou `fix/nome-curto`
3. Use Conventional Commits
4. Adicione/atualize testes e documentação
5. Abra um PR relacionando a issue

## Licença
Defina a licença conforme a estratégia do projeto (ex.: MIT, Apache-2.0, GPL, etc.). Caso escolha MIT/Apache-2.0, inclua um arquivo LICENSE na raiz e referencie aqui.

---
Notas:
- O script `clean` usa pnpm. Instale pnpm (`npm i -g pnpm`) ou ajuste o script para usar npm/yarn.
- SweetAlert2 e Angular Material/CDK estão disponíveis para interações e UI.
- css-minimizer-webpack-plugin e terser-webpack-plugin podem ser empregados para otimizações de build.
