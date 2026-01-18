import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import colorifyLogo from "@/assets/colorify-logo.webp";

const ColorifyAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/colorify");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/colorify");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email ou senha incorretos");
          }
          throw error;
        }

        toast({
          title: "Bem-vindo! 🎨",
          description: "Vamos colorir!",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/colorify`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este email já está cadastrado");
          }
          throw error;
        }

        toast({
          title: "Conta criada! 🎉",
          description: "Você já pode usar o Colorify!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-yellow-100 via-green-100 to-blue-200 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 right-10 w-14 h-14 bg-blue-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-purple-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "2s" }} />
      </div>

      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-4 border-transparent bg-clip-padding relative">
        {/* Rainbow border effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-xl blur-sm" />
        
        <div className="space-y-6">
          {/* Logo */}
          <div className="text-center">
            <img 
              src={colorifyLogo} 
              alt="Colorify" 
              className="w-24 h-24 mx-auto rounded-2xl shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
              COLORIFY
            </h1>
            <p className="text-gray-600 mt-2">
              Transforme fotos em desenhos para colorir! 🎨
            </p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white rounded-xl shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Entrar 🎨"
              ) : (
                "Criar Conta ✨"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            {isLogin ? "Não tem conta? " : "Já tem conta? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-medium hover:underline"
            >
              {isLogin ? "Criar agora" : "Entrar"}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ColorifyAuth;
