import { STYLES } from '../styles';
import { Loader2, AlertCircle, Clock, Instagram } from 'lucide-react';

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

interface AfterHoursScreenProps {
    hours: string;
}

export function AfterHoursScreen({ hours }: AfterHoursScreenProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Center Closed</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Mining Industry Study Center<br/>
                    Operation hours are between<br/>
                    <span className="font-bold text-slate-800 mt-1 block">{hours}</span>
                </p>

                <a 
                    href={import.meta.env.VITE_INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-full text-sm font-medium transition-all group lg:hidden"
                >
                    <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Find latest operational info on Instagram</span>
                </a>
            </div>
        </div>
    );
}
