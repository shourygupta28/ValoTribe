import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {PrismaClient} from '@prisma/client';
import {readFile, readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {DEMO_PASSWORD, seedDemoAccounts} from './demo-data.mjs';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The fictional demo database is only available in development.');
}
const require = createRequire(import.meta.url);
const port = Number(process.env.DEMO_PORT || 3000);
const dbPort = Number(process.env.DEMO_DB_PORT || 55435);
for (const value of [port, dbPort]) {
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error('Demo ports must be integers between 1 and 65535.');
  }
}
const origin = `http://localhost:${port}`;
const env = {...process.env,
  NODE_ENV: 'development',
  DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${dbPort}/postgres?connection_limit=1&statement_cache_size=0&sslmode=disable`,
  APP_ORIGIN: origin,
  COOKIE_SECURE: 'false', PUBLIC_SIGNUP_ENABLED: 'false',
  RESEND_API_KEY: '', EMAIL_FROM: '', TEST_MAIL_OUT: '', TEST_MAIL_MODE: '',
};
let db, server, app;
let stopping;
function stop(code = 0) {
  return stopping ??= (async () => {
    if (app && app.exitCode === null && app.signalCode === null) {
      await new Promise(resolve => {
        app.once('exit', resolve);
        app.kill('SIGTERM');
      });
    }
    if (server) await server.stop();
    if (db) await db.close();
    process.exitCode = code;
  })();
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
try {
  db = await PGlite.create();
  const migrations = new URL('../prisma/migrations/', import.meta.url);
  for (const entry of (await readdir(migrations, {withFileTypes: true}))
    .filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    await db.exec(await readFile(new URL(`${entry.name}/migration.sql`, migrations), 'utf8'));
  }
  server = new PGLiteSocketServer({db, host: '127.0.0.1', port: dbPort});
  await server.start();
  const client = new PrismaClient({datasourceUrl: env.DATABASE_URL});
  try {
    const count = await seedDemoAccounts(client);
    console.log(`Fictional demo database ready: ${count} accounts. Data resets on shutdown.`);
  } finally {
    await client.$disconnect();
  }
  console.log(`Sign in at ${origin} with demo.controller@example.test`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  app = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {env, stdio: 'inherit'});
  app.once('error', error => {console.error(error.message); void stop(1);});
  app.once('exit', code => void stop(code ?? 0));
} catch (error) {
  console.error('Demo startup failed:', error.message);
  await stop(1);
}
