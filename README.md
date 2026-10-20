# datos — front

Web app of a portal that puts Spanish regional political news in context. It reads the API of
the sibling repository `../back` and shows, for each autonomous community, its government, the
latest news and official indicators. Work in progress; decisions are in `docs/adr/`.

## MAIN DEPENDENCIES
![Node JS](https://img.shields.io/badge/NODE.JS-22.22+-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/REACT-19.3.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/VITE-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/REACT%20ROUTER-8.4.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TANSTACK%20QUERY-5.104.0-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![OpenAPI Fetch](https://img.shields.io/badge/OPENAPI%20FETCH-0.17.0-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)
![Zod](https://img.shields.io/badge/ZOD-4.6.5-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![D3 Geo](https://img.shields.io/badge/D3%20GEO-3.1.1-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=white)
![Vitest](https://img.shields.io/badge/VITEST-5.0.4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/TESTING%20LIBRARY-16.3.3-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)
![MSW](https://img.shields.io/badge/MSW-3.0.3-FF6A33?style=for-the-badge)
![ESLint](https://img.shields.io/badge/ESLINT-9.39.5-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/PRETTIER-3.9.10-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![pnpm](https://img.shields.io/badge/PNPM-12.11.2-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Docker](https://img.shields.io/badge/DOCKER-NGINX-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Types of the API (`src/api/schema.d.ts`) are generated from the back's OpenAPI document.

## Commands

```bash
pnpm install
pnpm dev            # Vite dev server
pnpm test           # Vitest
pnpm lint
pnpm typecheck
pnpm build
```

To run the whole stack with the API and the database, see the back repository's README.
