import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CartSummary } from "@/components/CartSummary";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

import heroImage from "@/assets/hero-bakery.jpg";
import msemenImage from "@/assets/msemen.jpg";
import batboutImage from "@/assets/batbout.jpg";
import baghririImage from "@/assets/baghrir.jpg";
import melouiPetitImage from "@/assets/meloui-petit.jpg";
import melouiNormalImage from "@/assets/meloui-normal.jpg";
import baghririMiniImage from "@/assets/baghrir-mini.jpg";
import msemenFarciImage from "@/assets/msemen-farci.jpg";
import miniMsemenFarciImage from "@/assets/mini-msemen-farci.jpg";
import msemenPetitImage from "@/assets/msemen-petit.jpg";
import khobzGrisImage from "@/assets/khobz-gris.jpg";
import msamenGrisImage from "@/assets/msamen-gris.jpg";

interface CartItem {
  name: string;
  options: string;
  quantity: number;
  price: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const products = [
    {
      name: "Meloui petit (11cm)",
      image: melouiPetitImage,
      price: 1.00,
    },
    {
      name: "Meloui format normal",
      image: melouiNormalImage,
      price: 2.00,
    },
    {
      name: "Baghrir format normal",
      image: baghririImage,
      price: 0.80,
    },
    {
      name: "Baghrir mini format",
      image: baghririMiniImage,
      price: 0.70,
    },
    {
      name: "Batbout mini",
      image: batboutImage,
      price: 0.70,
    },
    {
      name: "Msemen format normal",
      image: msemenImage,
      price: 1.30,
    },
    {
      name: "Msemen petit format",
      image: msemenPetitImage,
      price: 0.80,
    },
    {
      name: "Msemen farci",
      image: msemenFarciImage,
      price: 2.60,
    },
    {
      name: "Mini msemen farci",
      image: miniMsemenFarciImage,
      price: 1.60,
    },
    {
      name: "Krichlat",
      image: batboutImage,
      price: 0.80,
    },
    {
      name: "Khobz gris",
      image: khobzGrisImage,
      price: 1.10,
    },
    {
      name: "Msamen gris",
      image: msamenGrisImage,
      price: 1.50,
    },
  ];

  const handleAddToCart = (product: CartItem) => {
    setCartItems([...cartItems, product]);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Chez Khelti Mina"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-background/30 to-background/70">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 drop-shadow-lg">
            Chez Khelti Mina
          </h1>
          <p className="text-xl md:text-2xl text-foreground flex items-center gap-2 drop-shadow-md">
            Les délices faits maison avec amour <Heart className="fill-primary text-primary inline animate-pulse" />
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-card border-b border-border shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Nos Produits</h2>
          <div className="flex gap-4">
            <Link to="/about">
              <Button variant="outline">À propos</Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline">Accès Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.name}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              items={cartItems}
              onRemove={handleRemoveFromCart}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cartItems}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default Index;