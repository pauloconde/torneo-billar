import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { id } = params;

  // 1. Buscar el path de la planilla en la base de datos
  const { data: partida, error } = await supabase
    .from('partidas')
    .select('planilla_path')
    .eq('id', id)
    .single();

  if (error || !partida) {
    return NextResponse.json({ error: 'Partida no encontrada o sin planilla' }, { status: 404 });
  }

  if (!partida.planilla_path) {
    return NextResponse.json({ error: 'No hay planilla para esta partida' }, { status: 404 });
  }

  // 2. Obtener una URL firmada de Supabase Storage (válida por 2 minutos)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('planillas')
    .createSignedUrl(partida.planilla_path, 120);

  if (urlError || !urlData?.signedUrl) {
    return NextResponse.json({ error: 'No se pudo obtener la imagen de la planilla' }, { status: 404 });
  }

  // 3. Redirigir temporalmente a la URL firmada
  return NextResponse.redirect(urlData.signedUrl, 302);
}