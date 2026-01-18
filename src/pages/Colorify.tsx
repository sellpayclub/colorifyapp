import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Sparkles, Download, Printer, RotateCcw, Loader2, ImageIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import colorifyLogo from "@/assets/colorify-logo.webp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GeneratedColoringImage {
  id: string;
  image_url: string;
  original_image_url: string;
  created_at: string;
  config: {
    type?: string;
    [key: string]: unknown;
  };
}

const Colorify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedImages, setSavedImages] = useState<GeneratedColoringImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState("criar");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, selecione uma imagem menor que 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gerar desenho - Envia DataURL diretamente para a API (igual ao Fashion)
  const handleTransform = async () => {
    if (!imagePreview) {
      toast({
        title: "Nenhuma imagem",
        description: "Por favor, selecione ou tire uma foto primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Por favor, faça login novamente",
          variant: "destructive",
        });
        navigate("/colorify-login");
        return;
      }

      // Enviar DataURL diretamente para a API (igual ao Fashion)
      const response = await supabase.functions.invoke("generate-coloring-page", {
        body: { imageUrl: imagePreview },
      });

      if (response.error) {
        const errorMessage = response.error.message || "Erro ao gerar desenho";
        
        // Mensagens de erro mais amigáveis
        let userMessage = errorMessage;
        if (errorMessage.includes('Subscription not found')) {
          userMessage = "Você precisa ter uma assinatura ativa para gerar desenhos.";
        } else if (errorMessage.includes('No credits remaining')) {
          userMessage = "Você não tem créditos suficientes. Por favor, adquira um plano.";
        } else if (errorMessage.includes('User not authenticated')) {
          userMessage = "Sua sessão expirou. Por favor, faça login novamente.";
        } else if (errorMessage.includes('timeout')) {
          userMessage = "A geração está demorando mais que o esperado. Tente novamente.";
        }
        
        throw new Error(userMessage);
      }

      if (response.data?.generatedImageUrl) {
        setGeneratedImage(response.data.generatedImageUrl);
        toast({
          title: "Desenho gerado! 🎨",
          description: "Seu desenho para colorir está pronto!",
        });
        
        // Atualizar a lista de desenhos salvos
        setTimeout(() => {
          fetchSavedImages();
        }, 1500);
      } else {
        throw new Error("Nenhuma imagem foi gerada. Por favor, tente novamente.");
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro desconhecido ao gerar desenho";
      
      toast({
        title: "Erro ao gerar desenho",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `colorify-desenho-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado! 💾",
        description: "Seu desenho está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!generatedImage) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>COLORIFY - Imprimir Desenho</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: white;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                object-fit: contain;
              }
              @media print {
                body { background: white; }
                img { max-width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${generatedImage}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setGeneratedImage(null);
  };

  // Buscar desenhos gerados salvos
  const fetchSavedImages = async () => {
    try {
      setLoadingImages(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoadingImages(false);
        return;
      }

      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filtrar apenas desenhos para colorir (coloring-page)
      const coloringImages = (data || []).filter((img: any) => {
        const config = img.config as { type?: string };
        return config?.type === 'coloring-page';
      }).map((img: any) => ({
        ...img,
        config: typeof img.config === 'object' && img.config !== null 
          ? img.config as { type?: string; [key: string]: unknown }
          : { type: 'coloring-page' }
      })) as GeneratedColoringImage[];

      setSavedImages(coloringImages);
    } catch (error: any) {
      console.error("Error fetching saved images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Carregar desenhos salvos quando muda para a aba de desenhos
  useEffect(() => {
    if (activeTab === "desenhos") {
      fetchSavedImages();
    }
  }, [activeTab]);

  // Atualizar lista quando um novo desenho é gerado
  useEffect(() => {
    if (generatedImage && activeTab === "desenhos") {
      fetchSavedImages();
    }
  }, [generatedImage, activeTab]);

  const handlePrintFromGallery = (imageUrl: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>COLORIFY - Imprimir Desenho</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: white;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                object-fit: contain;
              }
              @media print {
                body { background: white; }
                img { max-width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadFromGallery = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `colorify-desenho-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado! 💾",
        description: "Seu desenho está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 to-blue-100">
      {/* Header colorido */}
      <header className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={colorifyLogo} alt="Colorify" className="w-12 h-12 rounded-xl shadow-md" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              COLORIFY
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Transforme Fotos em Desenhos! 🎨
          </h2>
          <p className="text-gray-600 text-lg">
            Tire ou faça upload de uma foto e transforme em desenho para colorir!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border-4 border-purple-300 gap-2">
              <button
                onClick={() => setActiveTab("criar")}
                className={`
                  flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 min-w-[140px]
                  ${activeTab === "criar"
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-xl scale-105 transform"
                    : "text-gray-700 hover:text-purple-600 hover:bg-white/60"
                  }
                `}
              >
                <Sparkles className={`w-5 h-5 ${activeTab === "criar" ? "text-white" : "text-purple-500"}`} />
                <span className="hidden sm:inline">Criar Novo</span>
                <span className="sm:hidden">Criar</span>
              </button>
              <button
                onClick={() => setActiveTab("desenhos")}
                className={`
                  flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 min-w-[140px]
                  ${activeTab === "desenhos"
                    ? "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-xl scale-105 transform"
                    : "text-gray-700 hover:text-blue-600 hover:bg-white/60"
                  }
                `}
              >
                <History className={`w-5 h-5 ${activeTab === "desenhos" ? "text-white" : "text-blue-500"}`} />
                <span className="hidden sm:inline">Meus Desenhos</span>
                <span className="sm:hidden">Desenhos</span>
              </button>
            </div>
          </div>

          <TabsContent value="criar" className="mt-0">
            {!generatedImage ? (
              <>
                {/* Upload Section */}
                {!imagePreview ? (
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-4 border-dashed border-rainbow shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <p className="text-xl text-gray-600 font-medium">
                        Escolha como enviar sua foto:
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <Camera className="w-6 h-6" />
                            Tirar Foto
                          </div>
                        </label>

                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <Upload className="w-6 h-6" />
                            Fazer Upload
                          </div>
                        </label>
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* Preview e Botão Transformar */
                  <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl">
                    <div className="space-y-6">
                      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-lg">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          className="text-lg py-6 px-8 border-2"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Trocar Foto
                        </Button>

                        <Button
                          onClick={handleTransform}
                          disabled={isLoading}
                          className="text-lg py-6 px-8 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white font-bold shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Transformando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Transformar em Desenho
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              /* Resultado */
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      ✨ Desenho Pronto! ✨
                    </h3>
                    <p className="text-gray-600">
                      Salve ou imprima para colorir!
                    </p>
                  </div>

                  <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-green-400 shadow-lg bg-white">
                    <img
                      src={generatedImage}
                      alt="Desenho para colorir"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleSave}
                      className="text-lg py-6 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Salvar Imagem
                    </Button>

                    <Button
                      onClick={handlePrint}
                      className="text-lg py-6 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Imprimir
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="text-lg py-4 px-6 border-2"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Nova Foto
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="p-8 bg-white text-center max-w-sm mx-4">
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto relative">
                      <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-yellow-500 border-b-green-500 border-l-blue-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-red-500 border-b-orange-500 border-l-cyan-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Criando seu desenho... 🎨
                    </h3>
                    <p className="text-gray-600">
                      Isso pode levar alguns segundos
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="desenhos" className="mt-0">
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    📚 Meus Desenhos Gerados
                  </h3>
                  <p className="text-gray-600">
                    Acesse, baixe e imprima seus desenhos salvos
                  </p>
                </div>

                {loadingImages ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-500 mb-4" />
                    <p className="text-gray-600">Carregando seus desenhos...</p>
                  </div>
                ) : savedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg font-medium">
                      Você ainda não gerou nenhum desenho
                    </p>
                    <p className="text-gray-500 mt-2">
                      Crie seu primeiro desenho na aba "Criar Novo"!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedImages.map((image) => (
                      <Card key={image.id} className="bg-white border-2 border-purple-300 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="relative aspect-square bg-gray-50">
                          <img
                            src={image.image_url}
                            alt="Desenho para colorir"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-xs text-gray-500">
                            {new Date(image.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDownloadFromGallery(image.image_url)}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Baixar
                            </Button>
                            <Button
                              onClick={() => handlePrintFromGallery(image.image_url)}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              Imprimir
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Colorify;
