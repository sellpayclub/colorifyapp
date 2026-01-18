# Colorify

Transforme suas fotos em desenhos para colorir usando IA! O Colorify é uma aplicação web que converte qualquer foto em uma página de colorir personalizada.

## 🚀 Funcionalidades

- 📸 Upload de fotos ou captura direta pela câmera
- 🎨 Conversão automática em desenhos para colorir usando IA
- 💾 Histórico de imagens geradas
- 📥 Download das imagens geradas
- 🖨️ Imprimir diretamente da aplicação
- 🔐 Autenticação de usuários
- 📊 Sistema de créditos e assinaturas

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Supabase** - Backend (Auth, Database, Storage)
- **Radix UI** - Componentes acessíveis
- **React Router** - Roteamento

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta Supabase configurada
- Variáveis de ambiente configuradas

## ⚙️ Configuração

1. Clone o repositório:
```bash
git clone https://github.com/sellpayclub/colorifyapp.git
cd colorifyapp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

## 🏗️ Build

Para criar uma build de produção:

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
colorify/
├── src/
│   ├── pages/          # Páginas da aplicação
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e funções
│   ├── integrations/   # Integrações com serviços externos
│   └── assets/         # Imagens e assets estáticos
├── public/             # Arquivos públicos
└── supabase/           # Funções Edge e configurações
```

## 🔐 Autenticação

O Colorify usa Supabase Auth para autenticação de usuários. Os usuários precisam se cadastrar/login para gerar desenhos.

## 💳 Sistema de Créditos

O aplicativo usa um sistema de créditos baseado em assinaturas. Cada geração de desenho consome um crédito.

## 📚 Documentação Adicional

Consulte `COLORIFY_IMAGES_SETUP.md` para instruções sobre como configurar as imagens da landing page.

## 📄 Licença

Este projeto é privado e propriedade de sellpayclub.