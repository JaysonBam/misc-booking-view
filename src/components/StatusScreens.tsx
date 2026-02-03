import { STYLES } from '../styles';
import { Loader2, AlertCircle } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className={STYLES.loading}>
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
            <h2 className="text-xl font-medium text-slate-700">Loading availability...</h2>
        </div>
    );
}

interface ErrorScreenProps {
    error: string;
    onRetry: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
    return (
        <div className={STYLES.error}>
            <AlertCircle className="w-12 h-12 mb-4 mx-auto" />
            <h2 className="text-xl font-medium text-slate-900 mb-2">Unavailable</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
                onClick={onRetry}
                className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium active:scale-95 transition-transform"
            >
                Try Again
            </button>
        </div>
    );
}
