import { Button } from "@/components/ui/button";

interface BlockedScreenProps {
    creditsTotal?: number;
    onUpgradeClick: () => void;
}

export const BlockedScreen = ({ creditsTotal = 5, onUpgradeClick }: BlockedScreenProps) => {
    return (
        <div className="glass-effect p-8 sm:p-12 rounded-2xl border-2 border-red-500/50 bg-red-500/10 text-center space-y-6">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-4xl">🔒</span>
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-red-400 mb-3">
                    Seus créditos acabaram!
                </h3>
                <p className="text-lg text-slate-300 mb-2">
                    Você usou todas as suas {creditsTotal} imagens {creditsTotal === 5 ? 'grátis' : 'do plano'}.
                </p>
                <p className="text-slate-400">
                    Escolha um plano para continuar gerando desenhos para colorir com IA.
                </p>
            </div>
            <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-500 text-white text-lg px-8 py-6"
                onClick={onUpgradeClick}
            >
                Ver Planos Disponíveis
            </Button>
        </div>
    );
};