import { createInvite } from './auth'
import { all, audit, run, type UserRow } from './db'

// Server-side administration, run inside the container (docs/MODERACE.md):
//   node moderator/dist-server/cli.mjs invite "Jméno" [admin|moderator]   a single-use invite link (72 h)
//   node moderator/dist-server/cli.mjs users                                 accounts
//   node moderator/dist-server/cli.mjs disable <user-id>                     switch an account off and sign it out
// The first admin is created with `invite "<name>" admin`; everything else is done in the app.

const [cmd, ...args] = process.argv.slice(2)

switch (cmd) {
  case 'invite': {
    const name = (args[0] ?? '').trim()
    const role = args[1] === 'admin' ? 'admin' : 'moderator'
    if (name.length < 2) { console.error('Usage: invite "<name>" [admin|moderator]'); process.exit(1) }
    const { url, expiresAt } = createInvite(null, 'user', name, role)
    audit('invite.created', null, { name, role, via: 'cli' })
    console.log(`Invite for ${name} (${role}), valid until ${new Date(expiresAt).toISOString()}, single use:\n${url}`)
    break
  }
  case 'users':
    for (const u of all<UserRow>('SELECT * FROM users ORDER BY name')) console.log(`${u.id}  ${u.active ? 'active  ' : 'disabled'}  ${u.role.padEnd(9)}  ${u.name}`)
    break
  case 'disable': {
    const n = run('UPDATE users SET active = 0 WHERE id = ?', args[0] ?? '').changes
    run('DELETE FROM sessions WHERE user_id = ?', args[0] ?? '')
    run("DELETE FROM invites WHERE user_id = ? AND used_at IS NULL", args[0] ?? '')
    audit('user.disabled', null, { user: args[0], via: 'cli' })
    console.log(n ? 'Disabled and signed out.' : 'No such user.')
    break
  }
  default:
    console.log('Commands: invite "<name>" [admin|moderator] · users · disable <user-id>')
}
