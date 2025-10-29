import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function OrderForm() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Formulaire de Commande</h1>
            <p className="text-muted-foreground">
              Remplissez le formulaire ci-dessous pour passer votre commande
            </p>
          </div>

          <form
            action="https://formspree.io/f/xyzbwkar"
            method="POST"
            className="bg-card border border-border rounded-lg p-8 shadow-lg space-y-6"
          >
            {/* Redirect to thank you page */}
            <input
              type="hidden"
              name="_next"
              value={`${window.location.origin}/merci`}
            />
            {/* Custom subject */}
            <input type="hidden" name="_subject" value="Nouvelle commande - Chez Khelti Mina" />

            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Votre nom complet"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="votre@email.com"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="06 12 34 56 78"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Détails de votre commande..."
                rows={5}
                className="bg-background"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Envoyer la commande
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
