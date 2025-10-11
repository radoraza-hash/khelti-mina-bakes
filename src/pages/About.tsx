import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            ← Retour à l'accueil
          </Button>
        </Link>

        <Card className="max-w-2xl mx-auto bg-card border-border">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-primary mb-4">
                À propos
              </h1>
              <div className="flex justify-center">
                <Heart className="w-16 h-16 text-primary fill-primary animate-pulse" />
              </div>
              <p className="text-xl text-foreground leading-relaxed">
                Bienvenue <span className="font-semibold text-primary">Chez Khelti Mina</span>,
              </p>
              <p className="text-lg text-muted-foreground">
                vos délices faits maison avec amour 💛
              </p>
              <div className="pt-6 border-t border-border">
                <p className="text-foreground">
                  Nous préparons avec passion des produits traditionnels marocains
                  faits maison, pour vous faire découvrir ou redécouvrir les saveurs
                  authentiques de notre cuisine.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;