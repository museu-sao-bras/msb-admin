# Museum Admin Dashboard

A modern, responsive dashboard for managing museum collections, inventory, donations, and users. Built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Dashboard Overview:** Visual summary of inventory, donations, users, and items on display.
- **Inventory Management:** Track, search, and categorize museum items.
- **Donations:** Manage donor information and donation records.
- **User Management:** Add, view, and manage system users.
- **Settings:** Configure API endpoints and application settings.
- **Responsive UI:** Clean, accessible design with sidebar navigation.
- **404 Handling:** Friendly not-found page for invalid routes.

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
# or
yarn build
```

### Lint

```bash
npm run lint
# or
yarn lint
```

## Project Structure

- `src/pages/` — Main app pages (Dashboard, Inventory, Donations, Users, Settings, NotFound)
- `src/components/layout/` — Layout and sidebar navigation
- `src/components/ui/` — Reusable UI components (cards, buttons, forms, etc.)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions

## Customization

- **Branding:** Update `public/favicon.ico` and meta tags in `index.html`.
- **Theme:** Modify Tailwind and shadcn/ui configs for custom colors and styles.

## License

MIT
