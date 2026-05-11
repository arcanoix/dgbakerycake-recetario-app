import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: recetas, error } = await supabase.from('recetas').select('*').limit(1);
  if (error || !recetas || recetas.length === 0) {
    console.log("No recipes found or error", error);
    return;
  }
  const receta = recetas[0];
  console.log("Original name:", receta.nombre);
  console.log("Original id:", receta.id);
  
  const { error: updateError } = await supabase.from('recetas').update({
    nombre: receta.nombre + " - Editado"
  }).eq('id', receta.id);
  
  console.log("Update error:", updateError);
  
  const { data: updated, error: fetchError } = await supabase.from('recetas').select('*').eq('id', receta.id).single();
  console.log("Updated data:", updated, "Fetch error:", fetchError);
}
run();
