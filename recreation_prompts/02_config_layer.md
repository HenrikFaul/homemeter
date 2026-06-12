# 02_config_layer — generátor prompt

Hozd létre PONTOSAN az alábbi fájlokat a(z) TypeScript / Node (Express + SQLite adatbázis + statikus frontend) projektben. A tartalom a source-of-truth — karakterre pontosan ezt add vissza, kivéve ha a master kontextus kifejezetten módosítást kér.

## FILE: package.json
Cél: Defines project metadata, sets "type": "commonjs", lists express dependency and devDependencies like typescript with correct versions per stack constraints.

```
{
  "name": "industrial-maintenance-command-center",
  "version": "1.0.0",
  "type": "commonjs",
  "description": "Industrial Maintenance Command Center - Cross-platform desktop application for Windows and macOS, optimized for large monitors.",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "typescript": "^5.5.0"
  }
}

```

## FILE: tsconfig.json
Cél: Configures TypeScript compiler options including strict: false, noImplicitAny: false to allow loose typing as requested in brief instructions.

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": false,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}

```
