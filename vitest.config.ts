import fs from 'fs-extra'; // удобный fs с промисами и копированием
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';


// Для __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAliasFromTsconfig(tsconfigPath = 'tsconfig.json') {
  const tsconfig = await fs.readJson(tsconfigPath);
  const paths = tsconfig.compilerOptions?.paths || {};
  const baseUrl = tsconfig.compilerOptions?.baseUrl || '.';

  const alias: Record<string, any> = {};

  for (const key in paths) {
    const cleanKey = key.replace(/\/\*$/, ''); // "@api/*" → "@api"
    const target = paths[key][0]?.replace(/\/\*$/, ''); // "src/api/*" → "src/api"

    if (cleanKey && target) {
      alias[cleanKey] = path.resolve(baseUrl, target);
    }
  }

  return alias;
}

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts']
    }
  },
  optimizeDeps: {
    noDiscovery: true, // не трогаем зависимости
    include: ['@imranbarbhuiya/mongoose-fuzzy-searching'],
  },
  resolve: {
    alias: await getAliasFromTsconfig(),
  },
  plugins: [
    tsconfigPaths()
  ],
  build: {
    target: 'node18',
    outDir: 'build',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
  // плагин для копирования папок и файлов после сборки
});
