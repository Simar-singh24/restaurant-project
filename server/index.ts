import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany();
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get all cocktails
app.get('/api/cocktails', async (req, res) => {
  try {
    const drinks = await prisma.cocktail.findMany();
    res.json(drinks);
  } catch (error) {
    console.error('Failed to fetch cocktails:', error);
    res.status(500).json({ error: 'Failed to fetch cocktails' });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const order = await prisma.order.create({
      data: {
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
