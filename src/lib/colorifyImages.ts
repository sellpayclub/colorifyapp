/**
 * URLs das imagens da landing page COLORIFY
 * As imagens devem ser hospedadas no Supabase Storage no bucket 'colorify-landing'
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'colorify-landing';

// URLs das imagens da landing page
// Usando as URLs completas fornecidas do Supabase Storage
// Nota: URLs codificadas para espaços e caracteres especiais
export const colorifyImages = {
  heroDemo: 'https://ioepxodalxceisydeita.supabase.co/storage/v1/object/public/colorify-landing//video colorify demonstracao.mp4',
  example1: 'https://ioepxodalxceisydeita.supabase.co/storage/v1/object/public/colorify-landing/exemplo1.png', // Crianças
  example2: 'https://ioepxodalxceisydeita.supabase.co/storage/v1/object/public/colorify-landing/exemplo2.png', // Pet
  example3: 'https://ioepxodalxceisydeita.supabase.co/storage/v1/object/public/colorify-landing/exemplo3.png', // Família
  example4: 'https://ioepxodalxceisydeita.supabase.co/storage/v1/object/public/colorify-landing/exemplo4.png', // Momentos especiais
};

export default colorifyImages;

