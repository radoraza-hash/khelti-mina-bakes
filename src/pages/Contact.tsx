import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="outline" className="mb-6">
              ← Retour à l'accueil
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-foreground mb-8">
            Contactez-nous
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <a
                      href="mailto:kheltimina31024@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      kheltimina31024@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Téléphone</h3>
                    <div className="space-y-1">
                      <a
                        href="tel:0451016360"
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        0451 01 63 60
                      </a>
                      <a
                        href="tel:0470951788"
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        0470 95 17 88
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Pickup</h3>
                    <p className="text-muted-foreground">
                      Courcelles, Wallonie
                      <br />
                      Belgique
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Facebook className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Facebook</h3>
                    <p className="text-muted-foreground">Mina Rita</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-muted/50 border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Horaires & Commandes</h3>
              <p className="text-muted-foreground">
                Pour passer commande, veuillez nous contacter par téléphone ou
                par email. Nous vous confirmerons la disponibilité et l'heure de
                récupération.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
