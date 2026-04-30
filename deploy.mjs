import { execSync } from 'child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DEPLOY_DIR = 'deploy'

console.log('🧪 Running tests...')
try {
  execSync('npm run test:run', { stdio: 'inherit' })
} catch {
  console.error('\n❌ Tests failed — aborting deploy.')
  process.exit(1)
}

console.log('\n🔨 Building Vue app...')
execSync('npm run build', { stdio: 'inherit' })

console.log('\n📁 Preparing deploy folder...')
if (existsSync(DEPLOY_DIR)) rmSync(DEPLOY_DIR, { recursive: true })
mkdirSync(DEPLOY_DIR)

// Vue built files
cpSync('dist', DEPLOY_DIR, { recursive: true })

// PHP API
cpSync('api', join(DEPLOY_DIR, 'api'), { recursive: true })

// Root .htaccess
cpSync('.htaccess', join(DEPLOY_DIR, '.htaccess'))

// Data directory — skeleton only, not real data
mkdirSync(join(DEPLOY_DIR, 'data', 'wishlists'), { recursive: true })
cpSync('data/.htaccess', join(DEPLOY_DIR, 'data', '.htaccess'))
writeFileSync(join(DEPLOY_DIR, 'data', 'users.json'), '[]')

console.log(`
✅ Deploy folder ready: ./${DEPLOY_DIR}/

Upload the full contents of ./${DEPLOY_DIR}/ to your server webroot.

⚠️  First deploy?  Upload the data/ folder too.
⚠️  Updating?      Skip the data/ folder — it has your live users and wishlists.
`)
