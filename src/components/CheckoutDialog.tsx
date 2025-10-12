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

      // Send email confirmation
      const { error: emailError } = await supabase.functions.invoke("send-order-confirmation", {
        body: {
          customer_name: formData.name,
          customer_email: formData.email || "non-fourni@email.com",
          items: items.map((item) => ({
            productName: item.name,
            options: item.options,
            quantity: item.quantity,
            totalPrice: item.price,
          })),
          total_amount: total,
        },
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
        toast.error("Commande enregistrée mais l'email de confirmation n'a pas pu être envoyé");
      } else {
        toast.success(
          `Commande enregistrée ! Vous serez informé sur ${formData.phone} par SMS avec la date pour récupérer la commande.`
        );
      }

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