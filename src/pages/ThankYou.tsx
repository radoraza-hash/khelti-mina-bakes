import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Merci !</h1>
            <p className="text-muted-foreground">
              Votre commande a été envoyée avec succès
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <p className="text-sm">
              Vous allez recevoir un email de confirmation à l'adresse que vous avez fournie.
              Nous vous contacterons bientôt pour finaliser votre commande.
            </p>
          </div>

          <Link to="/">
            <Button className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
