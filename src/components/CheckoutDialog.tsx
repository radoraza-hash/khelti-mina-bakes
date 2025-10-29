import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  name: string;
  options: string;
  quantity: number;
  price: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onSuccess: () => void;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  items,
  onSuccess,
}: CheckoutDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderId = crypto.randomUUID();

      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          total_price: total,
          status: "pending",
        });

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_name: item.name,
        options: item.options,
        quantity: item.quantity,
        unit_price: item.price / item.quantity,
        total_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Envoyer l’email via Formspree (notification admin + éventuelle confirmation)
      try {
        const fs = new FormData();
        fs.append("name", formData.name);
        fs.append("email", formData.email || "no-reply@example.com");
        fs.append("phone", formData.phone);
        const details = items
          .map((item) => `${item.quantity}x ${item.name}${item.options ? ` (${item.options})` : ""} - ${item.price.toFixed(2)}€`)
          .join("\n");
        fs.append("message", `Commande en ligne:\n${details}\nTotal: ${total.toFixed(2)}€`);
        await fetch("https://formspree.io/f/xyzbwkar", {
          method: "POST",
          body: fs,
          headers: { Accept: "application/json" },
        });
      } catch (err) {
        console.error("Formspree send failed", err);
      }

      toast.success(
        formData.email
          ? `Commande enregistrée ! Vous recevrez une confirmation à ${formData.email} si configurée.`
          : `Commande enregistrée !`
      );

      setFormData({ name: "", phone: "", email: "" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Finaliser la commande</DialogTitle>
          <DialogDescription>
            Remplissez vos informations pour valider votre commande
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de GSM *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              className="bg-background"
            />
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-primary">{total.toFixed(2)}€</span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "En cours..." : "Valider la commande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};