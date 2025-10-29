import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  status: string;
  total_price: number;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  options: string;
  quantity: number;
  total_price: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        loadOrders();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Erreur de connexion: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.session) {
      setSession(data.session);
      toast.success("Connexion réussie !");
      await loadOrders();
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      toast.error(`Erreur d'inscription: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Inscription réussie ! Veuillez vous connecter.");
      setIsSignup(false);
      setPassword("");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      // First, ensure current user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user already has admin role
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        // If no admin role exists, create one
        if (!existingRole) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: user.id, role: "admin" });
          
          if (roleError) {
            console.error("Error creating admin role:", roleError);
            toast.error("Erreur: Vous devez avoir le rôle admin pour accéder à cette page");
            await supabase.auth.signOut();
            setSession(null);
            setLoading(false);
            return;
          }
          toast.success("Rôle admin créé avec succès !");
        }
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Load items for each order
      const itemsMap: Record<string, OrderItem[]> = {};
      for (const order of ordersData || []) {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        if (!itemsError && items) {
          itemsMap[order.id] = items;
        }
      }
      setOrderItems(itemsMap);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      toast.success("Statut mis à jour !");
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center">
              {isSignup ? "Inscription Admin" : "Connexion Admin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rado.raza@gmail.com"
                  className="bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="bg-background"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isSignup ? "Inscription..." : "Connexion...") : (isSignup ? "S'inscrire" : "Se connecter")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const inProgressOrders = orders.filter((o) => o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const OrderCard = ({ order }: { order: Order }) => {
    const items = orderItems[order.id] || [];

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-start">
            <div>
              <p className="text-foreground">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground font-normal">
                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="text-primary">{order.total_price.toFixed(2)}€</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm">
              <strong>Téléphone:</strong> {order.phone}
            </p>
            {order.email && (
              <p className="text-sm">
                <strong>Email:</strong> {order.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-sm">Produits:</p>
            {items.map((item, idx) => (
              <div key={idx} className="text-sm bg-secondary/30 p-2 rounded">
                <p>
                  {item.product_name} {item.options && `(${item.options})`}
                </p>
                <p className="text-muted-foreground">
                  Quantité: {item.quantity} - {item.total_price.toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {order.status === "pending" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "in_progress")}
                variant="outline"
                className="flex-1"
              >
                Commencer à préparer
              </Button>
            )}
            {order.status === "in_progress" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "completed")}
                className="flex-1"
              >
                Valider
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Gestion des commandes
          </h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              {loading ? "Chargement..." : "Actualiser"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Revenir en utilisateur
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="pending">
              En attente ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              En cours ({inProgressOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Validées ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingOrders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Aucune commande en attente
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4 mt-6">
            {inProgressOrders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Aucune commande en cours
                </CardContent>
              </Card>
            ) : (
              inProgressOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedOrders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Aucune commande validée
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;