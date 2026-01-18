import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Shield } from "lucide-react";
import colorifyLogo from "@/assets/colorify-logo.webp";
import colorifyImages from "@/lib/colorifyImages";

// IDs dos Pixels do Facebook para o Colorify
const COLORIFY_PIXEL_IDS = ['1213873464037322', '1778757636137022'];

const ColorifyLanding = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scriptLoadedRef = useRef(false);
  const pixelsLoadedRef = useRef(false);

  // Carregar Facebook Pixels do Colorify
  useEffect(() => {
    if (pixelsLoadedRef.current) return;
    
    // Inicializar os pixels do Colorify
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      COLORIFY_PIXEL_IDS.forEach(pixelId => {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
      });
      pixelsLoadedRef.current = true;
    }
  }, []);

  // Carregar script do ConverteAI apenas uma vez
  useEffect(() => {
    if (scriptLoadedRef.current) return;
    
    // Verificar se o script já foi carregado
    if (document.querySelector('script[src*="smartplayer-wc"]')) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.head.appendChild(script);
    scriptLoadedRef.current = true;
  }, []);

  // Carregar iframe apenas uma vez
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    if (iframe.src.includes('embed.html')) return;

    const search = window.location.search || '?';
    const href = window.location.href;
    iframe.src = `https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/6953347590b70171e383b9dc/v4/embed.html${search}&vl=${encodeURIComponent(href)}`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 to-blue-100">
      {/* Header/Navbar */}
      <header className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={colorifyLogo} alt="Colorify" className="w-12 h-12 rounded-xl shadow-md" loading="eager" fetchPriority="high" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              COLORIFY
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
            🖍️ Transforme suas fotos em desenhos para colorir em 1 minuto
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 font-semibold">
            Crie atividades personalizadas para seus filhos usando fotos reais da sua família
          </p>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            Com o COLORIFY, você transforma qualquer foto do seu celular em um desenho pronto para imprimir e colorir — simples, rápido e divertido.
          </p>

          {/* Problemas que resolve */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mt-8 border-2 border-gray-200">
            <p className="text-lg font-semibold text-gray-900 mb-4">Pare de gastar dinheiro com:</p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-center gap-2 text-gray-800 font-medium">
                <span className="text-red-600 text-xl">✗</span>
                Livros de colorir genéricos
              </li>
              <li className="flex items-center gap-2 text-gray-800 font-medium">
                <span className="text-red-600 text-xl">✗</span>
                Atividades que não prendem a atenção das crianças
              </li>
              <li className="flex items-center gap-2 text-gray-800 font-medium">
                <span className="text-red-600 text-xl">✗</span>
                Impressões repetidas que não têm significado
              </li>
            </ul>
          </div>

          {/* Vídeo de Demonstração - ConverteAI Player */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="bg-white border-4 border-purple-400 shadow-xl overflow-hidden">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-800 mb-2 font-semibold">Veja o COLORIFY em ação:</p>
                <div 
                  id="ifr_6953347590b70171e383b9dc_wrapper" 
                  style={{ margin: '0 auto', width: '100%', maxWidth: '400px' }}
                >
                  <div 
                    style={{ 
                      position: 'relative', 
                      padding: '177.77777777777777% 0 0 0' 
                    }} 
                    id="ifr_6953347590b70171e383b9dc_aspect"
                  >
                    <iframe
                      ref={iframeRef}
                      frameBorder="0"
                      allowFullScreen
                      src="about:blank"
                      id="ifr_6953347590b70171e383b9dc"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }}
                      referrerPolicy="origin"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Inicial */}
          <div className="pt-6">
            <Button
              asChild
              size="lg"
              className="text-xl py-6 px-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold shadow-lg"
            >
              <a href="#planos">Escolha seu plano agora</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Seção: O que pode ser transformado */}
      <section className="container mx-auto px-4 py-12 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
            O COLORIFY é um aplicativo que transforma fotos reais em desenhos para colorir automaticamente.
          </h2>
        </div>

        {/* Exemplos Visuais de Transformações */}
        <div className="text-center mb-6 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Veja exemplos reais de transformações:</h3>
          <p className="text-gray-800 font-medium">Foto colorida ➡️ Desenho para colorir</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Exemplo 1: Crianças */}
          <Card className="bg-white border-4 border-purple-400 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                <img 
                  src={colorifyImages.example1} 
                  alt="Exemplo: Crianças transformadas em desenho para colorir"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="high"
                  onError={(e) => {
                    const card = e.currentTarget.closest('.bg-white');
                    if (card) {
                      card.innerHTML = '<div class="p-8 text-center text-gray-700 font-medium">Carregando exemplo...</div>';
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  📸 Crianças
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo 2: Pet */}
          <Card className="bg-white border-4 border-blue-400 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                <img 
                  src={colorifyImages.example2} 
                  alt="Exemplo: Pet transformado em desenho para colorir"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const card = e.currentTarget.closest('.bg-white');
                    if (card) {
                      card.innerHTML = '<div class="p-8 text-center text-gray-700 font-medium">Carregando exemplo...</div>';
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🐶 Pet
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo 3: Família */}
          <Card className="bg-white border-4 border-green-400 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                <img 
                  src={colorifyImages.example3} 
                  alt="Exemplo: Família transformada em desenho para colorir"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const card = e.currentTarget.closest('.bg-white');
                    if (card) {
                      card.innerHTML = '<div class="p-8 text-center text-gray-700 font-medium">Carregando exemplo...</div>';
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  👨‍👩‍👧‍👦 Família
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo 4: Momentos Especiais */}
          <Card className="bg-white border-4 border-pink-400 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                <img 
                  src={colorifyImages.example4} 
                  alt="Exemplo: Momentos especiais transformados em desenho para colorir"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const card = e.currentTarget.closest('.bg-white');
                    if (card) {
                      card.innerHTML = '<div class="p-8 text-center text-gray-700 font-medium">Carregando exemplo...</div>';
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🎂 Momentos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-xl font-bold text-gray-900">
            ➡️ Tudo vira desenho para imprimir em até 1 minuto.
          </p>
        </div>
      </section>

      {/* Seção: Como Funciona */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
            ⚙️ COMO FUNCIONA (PASSO A PASSO)
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-white border-2 border-purple-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Você escolhe uma foto no celular</h3>
                  <p className="text-gray-700">Selecione qualquer foto da sua galeria ou tire uma nova</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-blue-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">O aplicativo transforma em desenho automaticamente</h3>
                  <p className="text-gray-700">Nossa IA converte sua foto em um desenho para colorir em segundos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-green-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Você baixa o arquivo</h3>
                  <p className="text-gray-700">Salve o desenho no seu celular ou computador</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-yellow-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Imprime quantas vezes quiser</h3>
                  <p className="text-gray-700">O arquivo fica salvo para você usar sempre que quiser</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-pink-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Seu filho colore um desenho feito da própria história dele</h3>
                  <p className="text-gray-700">Crie momentos únicos e personalizados para sua família</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-2xl font-semibold text-gray-700">Simples assim.</p>
        </div>
      </section>

      {/* Seção: Planos e Preços */}
      <section id="planos" className="container mx-auto px-4 py-12 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
            💰 PLANOS E PREÇOS (ESCOLHA O SEU)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Teste */}
          <Card className="bg-white border-4 border-yellow-400 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">PLANO TESTE</CardTitle>
              <div className="space-y-2">
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  R$ 9,90
                </p>
                <p className="text-lg text-gray-800 font-medium">Gere até 10 fotos</p>
                <p className="text-sm text-gray-700">R$ 0,99 por imagem</p>
                <p className="text-sm font-bold text-green-700">Ideal para testar o aplicativo</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                asChild
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
              >
                <a href="https://pay.lowify.com.br/go.php?offer=7k4lza2" target="_blank" rel="noopener noreferrer">
                  Escolher Plano Teste
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Plano Ilimitado */}
          <Card className="bg-white border-4 border-purple-400 shadow-xl hover:shadow-2xl transition-shadow relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
              ACESSO ILIMITADO
            </div>
            <CardHeader className="text-center pb-4 pt-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">PLANO ILIMITADO</CardTitle>
              <div className="space-y-2">
                <p className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  R$ 19,90
                </p>
                <p className="text-lg text-gray-800 font-bold">Acesso Ilimitado para sempre</p>
                <p className="text-base text-gray-700 font-medium">Imprima quantas fotos quiser</p>
                <p className="text-base text-gray-700 font-medium">Sem limites de geração</p>
                <p className="text-sm font-bold text-green-700">Acesso vitalício</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                asChild
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg"
              >
                <a href="https://pay.lowify.com.br/go.php?offer=m5r10vy" target="_blank" rel="noopener noreferrer">
                  Garantir Acesso Ilimitado
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-white border-2 border-green-400 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-900">Benefícios incluídos em ambos os planos:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Funciona em todos os celulares</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Funciona em todos os celulares</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Não precisa instalar nada complicado</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Resultado em até 1 minuto por foto</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Você pode imprimir quantas vezes quiser</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">Arquivo fica salvo para usar depois</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção: Garantia */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-300 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🔒 GARANTIA
            </h2>
            <p className="text-xl text-gray-900 font-semibold">
              Teste o COLORIFY sem risco.
            </p>
            <p className="text-lg text-gray-800 mt-2 font-medium">
              Se não gostar, você pode solicitar reembolso dentro do prazo de <span className="font-bold text-green-700">7 Dias</span>.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Seção: FAQ */}
      <section className="container mx-auto px-4 py-12 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
            ❓ PERGUNTAS FREQUENTES (FAQ)
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white border-2 border-gray-300 rounded-lg px-4 shadow-md">
              <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-gray-700">
                Preciso saber mexer em tecnologia?
              </AccordionTrigger>
              <AccordionContent className="text-gray-800">
                Não. O aplicativo é simples e intuitivo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white border-2 border-gray-300 rounded-lg px-4 shadow-md">
              <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-gray-700">
                Funciona em qualquer celular?
              </AccordionTrigger>
              <AccordionContent className="text-gray-800">
                Sim, compatível com todos os smartphones.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white border-2 border-gray-300 rounded-lg px-4 shadow-md">
              <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-gray-700">
                Posso imprimir mais de uma vez?
              </AccordionTrigger>
              <AccordionContent className="text-gray-800">
                Sim. Depois de gerar o desenho, você pode imprimir quantas vezes quiser.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white border-2 border-gray-300 rounded-lg px-4 shadow-md">
              <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-gray-700">
                O acesso é imediato?
              </AccordionTrigger>
              <AccordionContent className="text-gray-800">
                Sim. Comprou, acessou na hora.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white border-2 border-gray-300 rounded-lg px-4 shadow-md">
              <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-gray-700">
                As fotos ficam salvas?
              </AccordionTrigger>
              <AccordionContent className="text-gray-800">
                Sim, você pode baixar e guardar os desenhos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer/CTA Final */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-purple-400">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
              Transforme fotos comuns em momentos criativos inesquecíveis para seus filhos.
            </h2>
            <p className="text-xl text-gray-800 font-medium mb-8">
              👉 Escolha seu plano agora e comece a criar seus próprios desenhos para colorir.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="py-6 px-8 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
              >
                <a href="https://pay.lowify.com.br/go.php?offer=7k4lza2" target="_blank" rel="noopener noreferrer">
                  Plano Teste - R$ 9,90
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="py-6 px-8 text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg"
              >
                <a href="https://pay.lowify.com.br/go.php?offer=m5r10vy" target="_blank" rel="noopener noreferrer">
                  Plano Ilimitado - R$ 19,90
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer simples */}
      <footer className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 p-6 mt-12">
        <div className="container mx-auto text-center text-white">
          <p className="font-semibold">© 2025 COLORIFY. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ColorifyLanding;

