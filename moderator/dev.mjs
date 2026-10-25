// npm run moderator:dev – the server (tsx watch, :8095) and the editor (Vite, :5180) together.
import { spawn } from 'node:child_process'

const run = (cmd, args) => spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ORIGIN: process.env.ORIGIN ?? 'http://localhost:5180', PORT: process.env.API_PORT ?? '8095', API_PORT: process.env.API_PORT ?? '8095' } })
const children = [run('npx', ['tsx', 'watch', 'moderator/server/index.ts']), run('npx', ['vite', '--config', 'moderator/vite.config.ts'])]
const stop = () => { for (const c of children) c.kill(); process.exit() }
process.on('SIGINT', stop).on('SIGTERM', stop)
