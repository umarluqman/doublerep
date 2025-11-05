# DoubleRep

A web application for tracking bodyweight training progress.

## About

DoubleRep helps you track your bodyweight training sessions based on structured workout plans. Monitor your progress, log exercises, and stay motivated on your fitness journey.

## Tech Stack

- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Convex](https://www.convex.dev/) - Serverless backend
- [Better Auth](https://www.better-auth.com/) - Authentication

## Getting Started

We're using **bun** by default, but you can modify the scripts in [package.json](./package.json) to use your preferred package manager.

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a `.env.local` file based on [`.env.local.example`](./.env.local.example).

3. Generate the schema to your database with convex:

   ```bash
   bun generate
   ```

4. Run the development server:

   ```bash
   bun dev
   ```

   The development server should now be running at [http://localhost:3000](http://localhost:3000).

## Available Scripts

These scripts in [package.json](./package.json#L5) use **bun** by default, but you can modify them to use your preferred package manager.

- **`dev`** - Run the development server
- **`build`** - Build for production
- **`start`** - Start the production server
- **`ui`** - The shadcn/ui CLI (e.g. `bun ui add button` to add the button component)
- **`format`** - Run Ultracite for formatting your code
- **`deps`** - Selectively upgrade dependencies via taze

## Building for Production

Read the [hosting docs](https://tanstack.com/start/latest/docs/framework/react/hosting) for information on how to deploy your TanStack Start app.

## License

MIT

---

Built with [react-tanstarter](https://github.com/melkir/react-tanstarter) template.
