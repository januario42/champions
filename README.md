# Champions API + Dashboard

API em Node.js + TypeScript para gerenciamento de jogadores e clubes, com dashboard web integrado para consulta visual, filtros e ranking.

## Preview

- API REST com CRUD de jogadores
- Filtros, ordenacao e limite por querystring
- Ranking por metrica (`Overall`, `Pace`, `Shooting`, etc.)
- Resumo estatistico da base
- Frontend responsivo em HTML/CSS/JS puro

## Stack

- Node.js
- TypeScript
- Express
- CORS
- TSX / TSUP

## Estrutura

```txt
src/
  controllers/
  services/
  repositories/
  models/
  data/
  public/       # dashboard web
  app.ts
  routes.ts
  server.ts
```

## Como rodar

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar ambiente

Crie/edite o arquivo `.env`:

```env
PORT=3000
```

### 3) Iniciar em desenvolvimento

```bash
npm run start:dev
```

Servidor:

- API: `http://localhost:3000/api`
- Dashboard: `http://localhost:3000/`

## Scripts

- `npm run start:dev` inicia com TSX
- `npm run start:watch` modo watch
- `npm run dist` build com TSUP
- `npm run start:dist` build + run de dist

## Endpoints

Base URL: `http://localhost:3000/api`

### Players

- `GET /players`
- `GET /players/:id`
- `POST /players`
- `PATCH /players/:id`
- `DELETE /players/:id`
- `GET /players/top?metric=Overall&limit=5`
- `GET /players/summary`

### Clubs

- `GET /clubs`

## Query params em `GET /players`

- `name`
- `club`
- `nationality`
- `position`
- `sort` (`name` | `overall`)
- `order` (`asc` | `desc`)
- `limit` (numero > 0)

Exemplo:

```http
GET /api/players?club=liverpool&sort=overall&order=desc&limit=3
```

## Exemplos de payload

### Criar jogador

```json
{
  "name": "Jude Bellingham",
  "club": "Real Madrid",
  "nationality": "England",
  "position": "Midfielder",
  "statistics": {
    "Overall": 90,
    "Pace": 80,
    "Shooting": 83,
    "Passing": 86,
    "Dribbling": 88,
    "Defending": 78,
    "Physical": 84
  }
}
```

### Atualizar estatisticas

```json
{
  "Overall": 91,
  "Pace": 82,
  "Shooting": 85,
  "Passing": 87,
  "Dribbling": 89,
  "Defending": 79,
  "Physical": 85
}
```

## Dashboard web

A interface em `src/public` permite:

- visualizar resumo da base
- filtrar jogadores
- ver top jogadores por metrica
- criar novos jogadores

## Possiveis melhorias

- persistencia em banco de dados (PostgreSQL/MongoDB)
- autenticacao (JWT)
- testes automatizados (unitarios e integracao)
- paginacao e cache
- Docker para deploy

## Licenca

Projeto sob licenca ISC.
