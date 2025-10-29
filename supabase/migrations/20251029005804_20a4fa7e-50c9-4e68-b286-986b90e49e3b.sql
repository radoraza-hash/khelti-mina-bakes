-- Mettre à jour tous les statuts existants vers les valeurs autorisées actuellement
UPDATE public.orders SET status = 'pending' WHERE status NOT IN ('pending', 'in_progress', 'completed');

-- Maintenant modifier la contrainte pour accepter les statuts en français
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'en attente', 'en préparation', 'validé'));

-- Mettre à jour les statuts vers le français
UPDATE public.orders SET status = 'en attente' WHERE status = 'pending';
UPDATE public.orders SET status = 'en préparation' WHERE status = 'in_progress';
UPDATE public.orders SET status = 'validé' WHERE status = 'completed';

-- Maintenant restreindre uniquement aux statuts français
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('en attente', 'en préparation', 'validé'));

-- Modifier la valeur par défaut
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'en attente';