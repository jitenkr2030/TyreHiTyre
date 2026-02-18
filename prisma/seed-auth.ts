import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tyrehityre.com' },
    update: {},
    create: {
      email: 'admin@tyrehityre.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  })

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@tyrehityre.com' },
    update: {},
    create: {
      email: 'staff@tyrehityre.com',
      name: 'Staff User',
      password: staffPassword,
      role: 'staff',
    },
  })

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@tyrehityre.com' },
    update: {},
    create: {
      email: 'customer@tyrehityre.com',
      name: 'Customer User',
      password: customerPassword,
      role: 'customer',
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin: admin@tyrehityre.com / admin123')
  console.log('Staff: staff@tyrehityre.com / staff123')
  console.log('Customer: customer@tyrehityre.com / customer123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })