import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProductOption {
  label: string;
  value: string;
}

interface ProductCardProps {
  name: string;
  image: string;
  options?: ProductOption[];
  secondaryOptions?: ProductOption[];
  price: number;
  onAddToCart: (product: {
    name: string;
    options: string;
    quantity: number;
    price: number;
  }) => void;
}

export const ProductCard = ({
  name,
  image,
  options,
  secondaryOptions,
  price,
  onAddToCart,
}: ProductCardProps) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedSecondaryOption, setSelectedSecondaryOption] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (options && !selectedOption) {
      toast.error("Veuillez sélectionner une option");
      return;
    }
    if (secondaryOptions && !selectedSecondaryOption) {
      toast.error("Veuillez sélectionner toutes les options");
      return;
    }

    const optionsText = [selectedOption, selectedSecondaryOption]
      .filter(Boolean)
      .join(" - ");

    onAddToCart({
      name,
      options: optionsText,
      quantity,
      price: price * quantity,
    });

    toast.success("Produit ajouté au panier !");
    setQuantity(1);
    setSelectedOption("");
    setSelectedSecondaryOption("");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-2xl font-bold text-primary">{price}€</p>

        {options && (
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choisir une option" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {secondaryOptions && (
          <Select
            value={selectedSecondaryOption}
            onValueChange={setSelectedSecondaryOption}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choisir une option" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {secondaryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Quantité:
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-center"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full">
          Ajouter à la commande
        </Button>
      </CardFooter>
    </Card>
  );
};