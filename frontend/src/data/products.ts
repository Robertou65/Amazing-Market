export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  image: string;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Orange Juice 1L",
    category: "Beverages",
    price: 3.99,
    description: "Fresh and natural orange juice with no added sugar.",
    stock: 28,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 2.49,
    description: "Soft whole wheat bread loaf baked daily.",
    stock: 34,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    name: "Organic Bananas",
    category: "Produce",
    price: 1.59,
    description: "Organic bananas sold per bundle.",
    stock: 52,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "4",
    name: "Tomato Sauce",
    category: "Pantry",
    price: 1.99,
    description: "Classic tomato sauce for pasta and recipes.",
    stock: 40,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "5",
    name: "Greek Yogurt",
    category: "Dairy",
    price: 4.2,
    description: "Plain Greek yogurt rich in protein.",
    stock: 20,
    image: "https://images.unsplash.com/photo-1571212515416-fca88ec2fd25?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "6",
    name: "Chicken Breast",
    category: "Meat",
    price: 7.5,
    description: "Fresh boneless chicken breast per pack.",
    stock: 17,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80"
  }
];
