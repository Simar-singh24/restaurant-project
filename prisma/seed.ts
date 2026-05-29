import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const menuItems = [
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato and cream sauce with aromatic spices',
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBjaGlja2VuJTIwY3Vycnl8ZW58MXx8fHwxNzY5NzU5NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    trending: true,
  },
  {
    name: 'Hyderabadi Biryani',
    description: 'Fragrant basmati rice layered with marinated meat and aromatic spices',
    price: '₹550',
    image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcmljZSUyMGRpc2h8ZW58MXx8fHwxNzY5ODMzMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5.0,
    trending: true,
  },
  {
    name: 'Tandoori Platter',
    description: 'Assorted grilled meats marinated in yogurt and spices, cooked in a clay oven',
    price: '₹650',
    image: 'https://images.unsplash.com/photo-1657205937708-0672f0d532a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YW5kb29yaSUyMGNoaWNrZW4lMjBpbmRpYW58ZW58MXx8fHwxNzY5ODgwMDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    trending: false,
  },
];

const cocktails = [
  {
    name: 'Mango Lassi',
    description: 'Fresh mango blended with yogurt and cardamom',
    price: '₹180',
    image: 'https://images.unsplash.com/photo-1655074084308-901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGxhc3NpJTIwZHJpbmt8ZW58MXx8fHwxNzY5Nzk0MDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: true,
  },
  {
    name: 'Masala Chai',
    description: 'Traditional spiced tea with ginger, cardamom, and cinnamon',
    price: '₹120',
    image: 'https://images.unsplash.com/photo-1698619952010-3bc850cbcb3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNhbGElMjBjaGFpJTIwdGVhfGVufDF8fHx8MTc2OTc5NDAyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: false,
  },
  {
    name: 'Spiced Mojito',
    description: 'Classic mojito with a hint of cumin and mint',
    price: '₹350',
    image: 'https://images.unsplash.com/photo-1730390772308-0ae7f139d042?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2ppdG8lMjBjb2NrdGFpbCUyMGdsYXNzfGVufDF8fHx8MTc2OTg3OTQzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: true,
  },
  {
    name: 'Tamarind Margarita',
    description: 'Tequila with sweet and tangy tamarind and lime',
    price: '₹400',
    image: 'https://images.unsplash.com/photo-1580775174971-149b403a7e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGNvY2t0YWlscyUyMGRyaW5rc3xlbnwxfHx8fDE3Njk4Nzk0MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: true,
  },
];

async function main() {
  console.log('Seeding database...');
  
  // Clear existing records to ensure idempotent fresh seeding
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.cocktail.deleteMany({});

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
  }
  for (const drink of cocktails) {
    await prisma.cocktail.create({
      data: drink,
    });
  }

  // Seed default admin account
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('adminpassword123', salt);
  await prisma.user.create({
    data: {
      name: 'Executive Admin',
      email: 'admin@icecube.com',
      passwordHash,
      role: 'admin',
      aiCredits: 99,
    },
  });

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
