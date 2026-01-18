# Configuração de Imagens COLORIFY Landing Page

Este guia explica como configurar e fazer upload das imagens da landing page COLORIFY usando Supabase Storage.

## 📋 Pré-requisitos

1. Acesso ao Supabase Dashboard do projeto
2. Permissões de administrador no projeto

## 🚀 Passo a Passo

### 1. Criar o Bucket no Supabase Storage

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá para **Storage** no menu lateral
3. Clique em **"New bucket"**
4. Configure:
   - **Name**: `colorify-landing`
   - **Public bucket**: ✅ Marque como público (importante!)
   - **File size limit**: 50 MB (ou o valor que preferir)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/gif, image/webp`
5. Clique em **"Create bucket"**

### 2. Configurar Políticas de Acesso

O bucket precisa ter políticas que permitam:
- **Leitura pública** (qualquer pessoa pode ver as imagens)
- **Upload apenas para usuários autenticados** (opcional, para segurança)

As políticas podem ser configuradas no dashboard ou através da migration SQL em:
```
supabase/migrations/20250101000000_create_colorify_storage_bucket.sql
```

### 3. Fazer Upload das Imagens

#### Opção A: Via Interface Admin (Recomendado)

1. Acesse `/admin/colorify-images` no seu app (você precisa estar logado como admin)
2. Para cada imagem:
   - Clique em **"Enviar"**
   - Selecione o arquivo
   - Aguarde o upload ser concluído
   - Você verá a URL da imagem após o upload

#### Opção B: Via Supabase Dashboard

1. Acesse **Storage** > **colorify-landing** no dashboard
2. Clique em **"Upload file"**
3. Faça upload dos seguintes arquivos:
   - `hero-demo.gif` - GIF de demonstração
   - `example-1.jpg` - Exemplo: Crianças
   - `example-2.jpg` - Exemplo: Pet
   - `example-3.jpg` - Exemplo: Família
   - `example-4.jpg` - Exemplo: Momentos especiais

### 4. Verificar se as Imagens Estão Funcionando

1. Acesse a landing page: `/colorify-landing`
2. Verifique se todas as imagens estão sendo exibidas corretamente
3. Se alguma imagem não aparecer, verifique:
   - Se o bucket está público
   - Se o nome do arquivo está correto
   - Se a URL está acessível

## 📁 Estrutura de Arquivos

As imagens devem ter os seguintes nomes no bucket:

```
colorify-landing/
  ├── hero-demo.gif
  ├── example-1.jpg
  ├── example-2.jpg
  ├── example-3.jpg
  └── example-4.jpg
```

## 🔧 Arquivos Relacionados

- **Landing Page**: `src/pages/ColorifyLanding.tsx`
- **URLs Helper**: `src/lib/colorifyImages.ts`
- **Upload Helper**: `src/lib/uploadColorifyImages.ts`
- **Componente Uploader**: `src/components/ColorifyImageUploader.tsx`
- **Página Admin**: `src/pages/ColorifyImageAdmin.tsx`
- **Migration SQL**: `supabase/migrations/20250101000000_create_colorify_storage_bucket.sql`

## 🐛 Troubleshooting

### Imagens não aparecem na landing page

1. Verifique se o bucket está público
2. Verifique se os nomes dos arquivos estão corretos
3. Verifique as políticas RLS do bucket
4. Abra o console do navegador para ver erros de CORS ou 404

### Erro ao fazer upload

1. Verifique se você está logado como admin
2. Verifique se o bucket existe
3. Verifique o tamanho do arquivo (máximo 50MB)
4. Verifique o tipo do arquivo (deve ser imagem)

### URLs não funcionam

As URLs são geradas automaticamente no formato:
```
https://[seu-projeto].supabase.co/storage/v1/object/public/colorify-landing/[nome-arquivo]
```

Se as URLs não funcionarem, verifique:
- Se o bucket está público
- Se as políticas RLS estão corretas
- Se o nome do arquivo está correto

## 📝 Notas

- O bucket deve ser público para que as imagens apareçam na landing page
- As imagens são servidas via CDN do Supabase, então o carregamento é rápido
- Você pode substituir as imagens a qualquer momento fazendo upload novamente com o mesmo nome

