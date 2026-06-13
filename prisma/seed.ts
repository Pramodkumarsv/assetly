import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@company.com',
      password,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', user.email)
  console.log('📧 Email:    admin@company.com')
  console.log('🔑 Password: admin123')
  console.log('')
  console.log('⚠️  Change the password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
