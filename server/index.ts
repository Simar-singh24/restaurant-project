import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (process.env.VERCEL) {
  const srcPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const destPath = '/tmp/dev.db';
  try {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log('Database successfully copied to /tmp');
    }
    databaseUrl = 'file:/tmp/dev.db';
  } catch (err) {
    console.error('Failed to copy database to /tmp:', err);
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});
const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ice-cube-super-secret-jwt-key-change-in-production-2024';

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields (email, password, name) are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with 10 free AI credits
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        aiCredits: 10,
      },
    });

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        aiCredits: user.aiCredits,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        aiCredits: user.aiCredits,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get Current User Profile & History
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      aiCredits: user.aiCredits,
      role: user.role,
      orders: user.orders,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

// Add AI Credits (Mock Stripe SaaS checkout top-up)
app.post('/api/auth/add-credits', authenticateToken, async (req: any, res) => {
  try {
    const { amount } = req.body; // e.g. 10 or 50 credits
    const creditAddition = parseInt(amount);

    if (isNaN(creditAddition) || creditAddition <= 0) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        aiCredits: {
          increment: creditAddition,
        },
      },
    });

    res.json({
      aiCredits: updatedUser.aiCredits,
      message: `Successfully added ${creditAddition} credits. Happy designing!`,
    });
  } catch (error) {
    console.error('Failed to add credits:', error);
    res.status(500).json({ error: 'Credit update failed' });
  }
});

// --- MENU & COCKTAILS ENDPOINTS ---

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

// Create a new order (Supports optional backend auth link)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, totalAmount, userId } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const orderData: any = {
      totalAmount,
      items: {
        create: items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
        })),
      },
    };

    // If userId exists and is a valid number, connect order to user
    if (userId && typeof userId === 'number') {
      orderData.userId = userId;
    }

    const order = await prisma.order.create({
      data: orderData,
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

// --- AI SAAS LAB ENDPOINTS ---

// Fallback dynamic generator for when no API key is present or AI service fails
function generateFallbackDish(prompt: string): any {
  const query = prompt.toLowerCase();
  
  const isCocktail = query.includes('drink') || query.includes('cocktail') || query.includes('juice') || query.includes('mocktail') || query.includes('lassi') || query.includes('sip') || query.includes('booze') || query.includes('glass');
  
  const foodImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Pizza/Cheese
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Gourmet Salad
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Paneer tikka
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Butter Chicken
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Curry
    'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Biryani
  ];

  const drinkImages = [
    'https://images.unsplash.com/photo-1550740843-08901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Mango drink
    'https://images.unsplash.com/photo-1580775174971-149b403a7e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Margarita
    'https://images.unsplash.com/photo-1730390772308-0ae7f139d042?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Mojito
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // Cocktail
  ];

  if (isCocktail) {
    // Generate cocktail recipe
    const name = query.includes('spicy') ? 'Spicy Crimson Sunrise' : 
                 query.includes('mint') ? 'Emerald Mint Cooler' :
                 query.includes('mango') ? 'Golden Mango Velvet' : 'Chef\'s Special Ice Cube Nectar';
    
    return {
      name,
      description: `A custom-blended, premium mocktail infusion designed to satisfy your specific craving for: "${prompt}". Blended with fresh artisanal juices, botanical syrups, and served over customized carved ice cubes.`,
      ingredients: [
        'Fresh squeezed citrus nectar',
        'House-infused botanical simple syrup',
        'Ice Cube special aromatic extracts',
        'Crushed organic mint leaves',
        query.includes('spicy') ? 'Chili-lime rim salt' : 'Fresh sugarcane shavings',
        'Sparkling artisanal club soda'
      ],
      price: 299,
      type: 'cocktail',
      image: drinkImages[Math.floor(Math.random() * drinkImages.length)]
    };
  } else {
    // Generate food recipe
    const name = query.includes('paneer') ? 'Royal Shahi Paneer Delight' :
                 query.includes('chicken') ? 'Smoky Tandoori Chicken Sensation' :
                 query.includes('spicy') ? 'Angara Fiery Masala Platter' : 'Chef\'s Signature Fusion Plate';

    return {
      name,
      description: `A masterfully designed culinary creation crafted from your craving: "${prompt}". Perfectly balance-spiced, slowly simmered, and finished with fresh cream, gourmet micro-greens, and served with a side of hot butter garlic naan.`,
      ingredients: [
        query.includes('chicken') ? 'Tender wood-fired chicken chunks' : 'Farm-fresh organic dairy paneer cubes',
        'Rich slow-simmered tomato and cashew reduction',
        'Ice Cube premium 14-spice garam masala blend',
        'Fresh double cream drizzle',
        'Fragrant fenugreek leaves (Kasuri Methi)',
        'Ginger-garlic confit'
      ],
      price: 499,
      type: 'food',
      image: foodImages[Math.floor(Math.random() * foodImages.length)]
    };
  }
}

// 1. Chef Lab custom dish generation with Credit Deductions
app.post('/api/ai/generate-dish', authenticateToken, async (req: any, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid recipe prompt' });
    }

    // Get user details
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify credits
    if (user.aiCredits <= 0) {
      return res.status(403).json({
        error: 'Insufficient AI credits. Please recharge your account in the user dashboard.',
        outOfCredits: true
      });
    }

    // Call Gemini API or fallback
    const apiKey = process.env.GEMINI_API_KEY;
    let customDish: any;

    if (apiKey) {
      try {
        const geminiPrompt = `
          You are a world-class professional master chef at the premium restaurant "ICE CUBE".
          Generate a high-end customized dish or drink based on the user's specific request: "${prompt}".
          
          You must return a single JSON object (with no markdown wrappers or formatting blocks) containing:
          - "name": A highly creative, enticing, premium gourmet name.
          - "description": A vivid, delicious, and engaging description highlighting ingredients and flavors (1-2 sentences).
          - "ingredients": An array of 5-7 high-quality ingredients.
          - "price": A realistic price in Indian Rupees as a number (e.g. between 250 and 650).
          - "type": Strictly either "food" or "cocktail".

          Example Output JSON Structure:
          {
            "name": "Smoked Cardamom Butter Paneer",
            "description": "Tender paneer cubes simmered in a velvet cardamom tomato curry, smoked with natural hickory wood.",
            "ingredients": ["Paneer", "Organic Butter", "Cardamom pods", "Tomato reduction", "Hickory smoke infusion", "Kasuri methi"],
            "price": 420,
            "type": "food"
          }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            customDish = JSON.parse(text.trim());
            // Add a fitting Unsplash image based on type & contents
            const foodImages = [
              'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
            ];
            const drinkImages = [
              'https://images.unsplash.com/photo-1550740843-08901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              'https://images.unsplash.com/photo-1580775174971-149b403a7e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              'https://images.unsplash.com/photo-1730390772308-0ae7f139d042?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
            ];
            
            customDish.image = customDish.type === 'cocktail' 
              ? drinkImages[Math.floor(Math.random() * drinkImages.length)]
              : foodImages[Math.floor(Math.random() * foodImages.length)];
          }
        }
      } catch (err) {
        console.error('Failed to fetch from Gemini, using chef fallback:', err);
      }
    }

    if (!customDish) {
      customDish = generateFallbackDish(prompt);
    }

    // Deduct 1 credit from user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { aiCredits: { decrement: 1 } }
    });

    res.json({
      ...customDish,
      aiCredits: updatedUser.aiCredits
    });
  } catch (error) {
    console.error('AI Dish Generation Failed:', error);
    res.status(500).json({ error: 'Culinary AI is taking a rest. Please try again later.' });
  }
});

// 2. Chat with AI Sommelier for food / cocktail pairings
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body; // history is optional array of {role, content}

    if (!message) {
      return res.status(400).json({ error: 'Please enter a message' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponse = '';

    if (apiKey) {
      try {
        const chatContext = `
          You are the elite "Sommelier & Chef Assistant" at "ICE CUBE" restaurant.
          We serve premium Indian foods like Butter Chicken, Hyderabadi Biryani, Tandoori Platter, and specials like Mango Lassi, Masala Chai, Tamarind Margaritas, and Spiced Mojitos.
          Give helpful, charming, and professional recommendations, cocktail pairings, dietary substitutions, or chef insights based on their message: "${message}".
          Keep your response within 3-4 lines and sound welcoming and gourmet.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: chatContext }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.error('Failed to get chat response from Gemini:', err);
      }
    }

    if (!aiResponse) {
      // Elegant Sommelier Fallback Responses
      const query = message.toLowerCase();
      if (query.includes('wine') || query.includes('drink') || query.includes('pairing') || query.includes('cocktail') || query.includes('beer')) {
        aiResponse = "For our rich items like Butter Chicken, I highly suggest pairing them with our tangy Tamarind Margarita or a chilled Spiced Mojito to cut through the creaminess. If you prefer non-alcoholic, our cardamom-spiced Mango Lassi is an absolute dream pairing!";
      } else if (query.includes('spicy') || query.includes('biryani') || query.includes('chili')) {
        aiResponse = "To complement the intense spices of our signature Hyderabadi Biryani, a refreshing mint-infused Spiced Mojito works wonders as a palate cleanser. A glass of cold cucumber infusion is also wonderful to soothe the spices.";
      } else if (query.includes('vegan') || query.includes('vegetarian') || query.includes('veg')) {
        aiResponse = "Welcome! We offer rich vegetarian options such as our artisanal Paneer dishes. Our chefs can also substitute cream with coconut milk to create a spectacular dairy-free vegan option. Just let us know when ordering!";
      } else {
        aiResponse = "Greetings from ICE CUBE! I'd be absolutely delighted to help you navigate our flavor notes. Our menu ranges from spiced rich curries to cold custom infusions. What flavor profiles (sweet, sour, fiery, smoky) do you enjoy most today?";
      }
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('AI Chat Failed:', error);
    res.status(500).json({ error: 'Sommelier is busy pouring drinks. Please check back shortly.' });
  }
});

// --- ADMIN ENDPOINTS ---

// Get all orders (Admin only)
app.get('/api/admin/orders', authenticateToken, async (req: any, res) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    });
    res.json(allOrders);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:id', authenticateToken, async (req: any, res) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
    res.json(updatedOrder);
  } catch (err) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Create menu item (Admin only)
app.post('/api/admin/menu', authenticateToken, async (req: any, res) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, price, image, type, rating, trending, isSpecial } = req.body;

    if (type === 'food') {
      const item = await prisma.menuItem.create({
        data: {
          name,
          description,
          price: price.toString(),
          image: image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          rating: parseFloat(rating) || 4.5,
          trending: !!trending,
        },
      });
      res.status(201).json({ ...item, type });
    } else {
      const item = await prisma.cocktail.create({
        data: {
          name,
          description,
          price: price.toString(),
          image: image || 'https://images.unsplash.com/photo-1550740843-08901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          isSpecial: !!isSpecial,
        },
      });
      res.status(201).json({ ...item, type });
    }
  } catch (err) {
    console.error('Failed to create menu item:', err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item (Admin only)
app.put('/api/admin/menu/:id', authenticateToken, async (req: any, res) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, price, image, type, rating, trending, isSpecial } = req.body;
    const itemId = parseInt(req.params.id);

    if (type === 'food') {
      const item = await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          name,
          description,
          price: price.toString(),
          image,
          rating: parseFloat(rating),
          trending: !!trending,
        },
      });
      res.json({ ...item, type });
    } else {
      const item = await prisma.cocktail.update({
        where: { id: itemId },
        data: {
          name,
          description,
          price: price.toString(),
          image,
          isSpecial: !!isSpecial,
        },
      });
      res.json({ ...item, type });
    }
  } catch (err) {
    console.error('Failed to update menu item:', err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (Admin only)
app.delete('/api/admin/menu/:id', authenticateToken, async (req: any, res) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const itemId = parseInt(req.params.id);
    const { type } = req.query; // 'food' or 'cocktail'

    if (type === 'food') {
      await prisma.menuItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cocktail.delete({ where: { id: itemId } });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Failed to delete menu item:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
