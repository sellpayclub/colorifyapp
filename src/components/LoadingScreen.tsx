import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
    withHeader?: boolean;
    HeaderComponent?: React.ComponentType;
}

export const LoadingScreen = ({
    message = "Carregando seus créditos...",
    withHeader = false,
    HeaderComponent
}: LoadingScreenProps) => {
    const content = (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-effect p-8 rounded-2xl border-2 border-primary/30 animate-pulse">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-lg font-semibold text-muted-foreground">{message}</p>
                </div>
            </div>
        </div>
    );

    if (withHeader && HeaderComponent) {
        return (
            <>
                <HeaderComponent />
                {content}
            </>
        );
    }

    return content;
};