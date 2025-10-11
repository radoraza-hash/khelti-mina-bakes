import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface CartItem {
  name: string;
  options: string;
  quantity: number;
  price: number;
}

interface CartSummaryProps {
  items: CartItem[];
  onRemove: (index: number) => void;
  onCheckout: () => void;
}

export const CartSummary = ({ items, onRemove, onCheckout }: CartSummaryProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Votre commande</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Votre panier est vide
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border sticky top-4">
      <CardHeader>
        <CardTitle>Votre commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              {item.options && (
                <p className="text-sm text-muted-foreground">{item.options}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Quantité: {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-primary">{item.price.toFixed(2)}€</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="w-full flex justify-between items-center text-lg font-bold border-t border-border pt-4">
          <span>Total</span>
          <span className="text-primary">{total.toFixed(2)}€</span>
        </div>
        <Button onClick={onCheckout} className="w-full" size="lg">
          Commander
        </Button>
      </CardFooter>
    </Card>
  );
};