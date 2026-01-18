/**
 * Script para verificar se as imagens estão disponíveis no Supabase Storage
 * Use este script no console do navegador para verificar
 */

import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'colorify-landing';

export const verifyColorifyImages = async () => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      return null;
    }

    console.log('📁 Arquivos encontrados no bucket:', data);
    
    const expectedFiles = [
      'hero-demo.gif',
      'example-1.jpg',
      'example-2.jpg',
      'example-3.jpg',
      'example-4.jpg',
    ];

    const foundFiles = data?.map(file => file.name) || [];
    
    console.log('\n✅ Arquivos esperados vs encontrados:');
    expectedFiles.forEach(file => {
      const found = foundFiles.includes(file);
      console.log(`${found ? '✅' : '❌'} ${file} - ${found ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    });

    return data;
  } catch (error) {
    console.error('Erro ao verificar imagens:', error);
    return null;
  }
};

// Para usar no console: import { verifyColorifyImages } from '@/lib/verifyColorifyImages'; verifyColorifyImages();

