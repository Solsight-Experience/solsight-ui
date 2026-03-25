import { ArrowLeftRight, CheckCircle, XCircle, TrendingUp, Shield, Info } from "lucide-react";
import { NotificationEventType } from "../types/notification.types";

interface NotificationIconProps {
    type: NotificationEventType;
    size?: number;
}

export function NotificationIcon({ type, size = 16 }: NotificationIconProps) {
    switch (type) {
        case NotificationEventType.SWAP_EXECUTED:
            return <ArrowLeftRight size={size} className="text-green-400" />;
        case NotificationEventType.SWAP_FAILED:
            return <ArrowLeftRight size={size} className="text-red-400" />;
        case NotificationEventType.TRANSACTION_CONFIRMED:
            return <CheckCircle size={size} className="text-green-400" />;
        case NotificationEventType.TRANSACTION_FAILED:
            return <XCircle size={size} className="text-red-400" />;
        case NotificationEventType.PRICE_ALERT_TRIGGERED:
            return <TrendingUp size={size} className="text-yellow-400" />;
        case NotificationEventType.SECURITY_ALERT:
            return <Shield size={size} className="text-red-400" />;
        case NotificationEventType.SYSTEM_ANNOUNCEMENT:
            return <Info size={size} className="text-violet-400" />;
        default:
            return <Info size={size} className="text-white/40" />;
    }
}
