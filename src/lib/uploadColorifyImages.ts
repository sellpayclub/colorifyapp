/**
 * Script para fazer upload das imagens da landing page COLORIFY para o Supabase Storage
 * 
 * USO:
 * 1. Certifique-se de que o bucket 'colorify-landing' existe no Supabase Storage
 * 2. Configure as políticas de acesso para permitir leitura pública
 * 3. Execute este script no console do navegador ou crie uma página admin
 */

import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'colorify-landing';

interface UploadImageParams {
  file: File;
  fileName: string;
  onProgress?: (progress: number) => void;
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
export const uploadColorifyImage = async ({
  file,
  fileName,
  onProgress,
}: UploadImageParams): Promise<string | null> => {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Erro ao listar buckets:', bucketsError);
      return null;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.error(`Bucket '${BUCKET_NAME}' não existe. Crie-o no Supabase Dashboard primeiro.`);
      return null;
    }

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Substitui se já existir
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro inesperado:', error);
    return null;
  }
};

/**
 * Faz upload de múltiplas imagens
 */
export const uploadAllColorifyImages = async (
  images: { file: File; fileName: string }[]
): Promise<{ [key: string]: string | null }> => {
  const results: { [key: string]: string | null } = {};

  for (const { file, fileName } of images) {
    const url = await uploadColorifyImage({ file, fileName });
    results[fileName] = url;
  }

  return results;
};

/**
 * Verifica se uma imagem existe no storage
 */
export const checkImageExists = async (fileName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(fileName.split('/')[0] || '', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      return false;
    }

    const fileExists = data?.some(
      (item) => item.name === fileName.split('/').pop()
    );

    return fileExists || false;
  } catch {
    return false;
  }
};

