# Bio Sén — Frontend

Ce dossier contient l'application React de Bio Sén.

## Structure
- `public/` : fichiers statiques et `index.html`
- `src/` : code React
  - `components/`
  - `pages/`
  - `context/`
  - `hooks/`
  - `lib/`
  - `utils/`
- `package.json` : dépendances React
- `.env.example` : variables d'environnement à configurer

## Installation
```bash
cd frontend
npm install
```

## Développement
```bash
cd frontend
npm start
```

## Production
```bash
cd frontend
npm run build
```

## Variables d'environnement
Copiez `.env.example` en `.env` et renseignez :
```bash
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```
