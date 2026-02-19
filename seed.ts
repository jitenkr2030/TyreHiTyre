import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample tyres
  const tyres = [
    {
      brand: 'MRF',
      model: 'Zapper C',
      size: '205/55 R16',
      type: 'Car',
      tubeType: 'Tubeless',
      mrp: 4500,
      sellingPrice: 3999,
      stock: 50,
      description: 'High performance tyre for cars'
    },
    {
      brand: 'CEAT',
      model: 'Milo Plus',
      size: '165/80 R14',
      type: 'Car',
      tubeType: 'Tubeless',
      mrp: 3200,
      sellingPrice: 2899,
      stock: 30,
      description: 'Fuel efficient tyre for compact cars'
    },
    {
      brand: 'Apollo',
      model: 'Acelere',
      size: '195/65 R15',
      type: 'Car',
      tubeType: 'Tubeless',
      mrp: 3800,
      sellingPrice: 3499,
      stock: 25,
      description: 'Comfortable ride with excellent grip'
    },
    {
      brand: 'Bridgestone',
      model: 'Turanza',
      size: '205/60 R16',
      type: 'Car',
      tubeType: 'Tubeless',
      mrp: 5200,
      sellingPrice: 4799,
      stock: 20,
      description: 'Premium touring tyre'
    },
    {
      brand: 'MRF',
      model: 'Nylogrip',
      size: '3.00-18',
      type: 'Bike',
      tubeType: 'Tube',
      mrp: 1800,
      sellingPrice: 1599,
      stock: 40,
      description: 'Durable tyre for motorcycles'
    },
    {
      brand: 'CEAT',
      model: 'Secura',
      size: '90/90 R19',
      type: 'Bike',
      tubeType: 'Tubeless',
      mrp: 2200,
      sellingPrice: 1999,
      stock: 35,
      description: 'Sport bike tyre with excellent grip'
    },
    {
      brand: 'Apollo',
      model: 'ActiGrip',
      size: '215/60 R17',
      type: 'SUV',
      tubeType: 'Tubeless',
      mrp: 6500,
      sellingPrice: 5999,
      stock: 15,
      description: 'All-terrain tyre for SUVs'
    },
    {
      brand: 'MRF',
      model: 'Wanderer',
      size: '235/65 R17',
      type: 'SUV',
      tubeType: 'Tubeless',
      mrp: 7200,
      sellingPrice: 6799,
      stock: 10,
      description: 'Off-road capable tyre for SUVs'
    }
  ];

  // Insert tyres
  for (const tyre of tyres) {
    await prisma.tyre.create({
      data: tyre
    });
  }

  // Create sample suppliers
  const suppliers = [
    {
      name: 'MRF Distributors',
      phone: '9876543210',
      email: 'mrf@tyresupply.com',
      address: '123 Industrial Area, Delhi'
    },
    {
      name: 'CEAT Wholesale',
      phone: '9876543211',
      email: 'ceat@tyresupply.com',
      address: '456 Market Road, Mumbai'
    },
    {
      name: 'Apollo Dealers',
      phone: '9876543212',
      email: 'apollo@tyresupply.com',
      address: '789 Commercial Street, Bangalore'
    }
  ];

  // Insert suppliers
  for (const supplier of suppliers) {
    await prisma.supplier.create({
      data: supplier
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });