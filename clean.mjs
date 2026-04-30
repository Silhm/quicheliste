import { writeFileSync, readdirSync, unlinkSync } from 'fs'

writeFileSync('data/users.json', '[]')

for (const file of readdirSync('data/wishlists')) {
  if (file.endsWith('.json')) unlinkSync(`data/wishlists/${file}`)
}

console.log('Data reset — users.json cleared, all wishlists deleted.')
