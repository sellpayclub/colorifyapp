/**
 * Componente para fazer upload das imagens da landing page COLORIFY
 * Use este componente em uma página admin para fazer upload das imagens
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadColorifyImage } from "@/lib/uploadColorifyImages";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadItem {
  name: string;
  label: string;
  description: string;
  fileName: string;
}

const IMAGES_TO_UPLOAD: ImageUploadItem[] = [
  {
    name: "heroDemo",
    label: "GIF de Demonstração",
    description: "GIF mostrando o app funcionando na prática",
    fileName: "hero-demo.gif",
  },
  {
    name: "example1",
    label: "Exemplo 1 - Crianças",
    description: "Foto de crianças transformada em desenho",
    fileName: "example-1.jpg",
  },
  {
    name: "example2",
    label: "Exemplo 2 - Pet",
    description: "Foto de pet transformada em desenho",
    fileName: "example-2.jpg",
  },
  {
    name: "example3",
    label: "Exemplo 3 - Família",
    description: "Foto de família transformada em desenho",
    fileName: "example-3.jpg",
  },
  {
    name: "example4",
    label: "Exemplo 4 - Momentos Especiais",
    description: "Momentos especiais transformados em desenho",
    fileName: "example-4.jpg",
  },
];

interface ImageUploadItemCardProps {
  item: ImageUploadItem;
  uploading: boolean;
  uploaded: string | null;
  preview: string | undefined;
  onFileSelect: (item: ImageUploadItem, file: File | null) => void;
}

const ImageUploadItemCard = ({ item, uploading, uploaded, preview, onFileSelect }: ImageUploadItemCardProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(item, file);
    }
  }, [item, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading
  });

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <p className="text-xs text-gray-500">
                Arquivo: <code className="bg-gray-100 px-2 py-1 rounded">{item.fileName}</code>
              </p>
              {uploaded && (
                <div className="mt-3">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    ✅ Upload realizado com sucesso!
                  </p>
                  <a
                    href={uploaded}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {uploaded}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Preview da imagem */}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${item.label}`}
                  className="w-full h-auto max-h-64 object-contain bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Área de drag and drop */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Solte a imagem aqui...</p>
              ) : (
                <>
                  <p className="text-gray-600 font-medium">
                    Arraste e solte a imagem aqui, ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF ou WEBP (máx. 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Botão de upload alternativo */}
          <div className="flex justify-center">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileSelect(item, file);
                  }
                }}
                disabled={uploading}
              />
              <Button
                asChild
                disabled={uploading}
                className="min-w-[200px]"
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : uploaded ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Reenviar Imagem
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar e Enviar
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ColorifyImageUploader = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploaded, setUploaded] = useState<{ [key: string]: string | null }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const processFile = useCallback((item: ImageUploadItem, file: File) => {
    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF ou WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 50MB",
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [item.name]: reader.result as string });
    };
    reader.readAsDataURL(file);
  }, [previews, toast]);

  const handleFileSelect = async (
    item: ImageUploadItem,
    file: File | null
  ) => {
    if (!file) return;

    processFile(item, file);

    setUploading({ ...uploading, [item.name]: true });

    try {
      const url = await uploadColorifyImage({
        file,
        fileName: item.fileName,
      });

      if (url) {
        setUploaded({ ...uploaded, [item.name]: url });
        toast({
          title: "Upload realizado com sucesso! ✅",
          description: `${item.label} foi enviado com sucesso`,
        });
      } else {
        toast({
          title: "Erro no upload",
          description: `Não foi possível fazer upload de ${item.label}. Verifique se o bucket existe.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading({ ...uploading, [item.name]: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Upload de Imagens - COLORIFY Landing Page
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Faça upload das imagens para o Supabase Storage. Certifique-se de que o bucket
            "colorify-landing" existe e está configurado como público.
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {IMAGES_TO_UPLOAD.map((item) => (
          <ImageUploadItemCard
            key={item.name}
            item={item}
            uploading={uploading[item.name]}
            uploaded={uploaded[item.name]}
            preview={previews[item.name]}
            onFileSelect={handleFileSelect}
          />
        ))}
      </div>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-blue-900 mb-2">📋 Instruções:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Certifique-se de que o bucket "colorify-landing" existe no Supabase Storage</li>
            <li>Configure o bucket como público (public)</li>
            <li>Selecione e faça upload de cada imagem acima</li>
            <li>As imagens aparecerão automaticamente na landing page</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorifyImageUploader;

