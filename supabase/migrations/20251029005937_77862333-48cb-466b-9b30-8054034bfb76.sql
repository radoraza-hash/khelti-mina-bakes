-- Supprimer la contrainte actuelle
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Ajouter une nouvelle contrainte qui accepte TOUS les statuts (anciens et nouveaux)
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'en attente', 'en préparation', 'validé'));

-- Modifier la valeur par défaut
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'en attente';