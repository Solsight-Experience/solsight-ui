import { cn } from "@/lib/utils";
import { ShieldCheck, Flame, Link2, LockKeyhole } from "lucide-react";
import { FilterFormData, FilterListProps } from "../FilterDialog.types";

type AuditColor = "emerald" | "blue" | "violet" | "orange";

interface AuditItem {
    field: keyof FilterFormData;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: AuditColor;
    checked: boolean;
}

const colorMap: Record<AuditColor, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 data-[active=true]:border-emerald-500/50 data-[active=true]:bg-emerald-500/10",
    blue: "border-blue-500/30 bg-blue-500/5 data-[active=true]:border-blue-500/50 data-[active=true]:bg-blue-500/10",
    violet: "border-violet-500/30 bg-violet-500/5 data-[active=true]:border-violet-500/50 data-[active=true]:bg-violet-500/10",
    orange: "border-orange-500/30 bg-orange-500/5 data-[active=true]:border-orange-500/50 data-[active=true]:bg-orange-500/10"
};

const iconColorMap: Record<AuditColor, string> = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    violet: "text-violet-400",
    orange: "text-orange-400"
};

/** Static indicator dot classes — dynamic template literals don't work with Tailwind JIT */
const indicatorCheckedMap: Record<AuditColor, string> = {
    emerald: "border-emerald-400 bg-emerald-400",
    blue: "border-blue-400 bg-blue-400",
    violet: "border-violet-400 bg-violet-400",
    orange: "border-orange-400 bg-orange-400"
};

export function AuditsFilterList({ formData, onFormChange }: FilterListProps) {
    const handleCheckboxChange = (field: keyof FilterFormData, checked: boolean) => {
        onFormChange({ [field]: checked });
    };

    const auditItems: AuditItem[] = [
        {
            field: "mint_authority_disabled",
            label: "Mint Auth Disabled",
            description: "Token cannot mint new supply",
            icon: <LockKeyhole className="w-4 h-4" />,
            color: "emerald",
            checked: formData.mint_authority_disabled
        },
        {
            field: "freeze_authority_disabled",
            label: "Freeze Disabled",
            description: "Wallets cannot be frozen",
            icon: <ShieldCheck className="w-4 h-4" />,
            color: "blue",
            checked: formData.freeze_authority_disabled
        },
        {
            field: "has_social_links",
            label: "Has Social Links",
            description: "At least one social presence",
            icon: <Link2 className="w-4 h-4" />,
            color: "violet",
            checked: formData.has_social_links
        },
        {
            field: "lp_burnt",
            label: "LP Burnt",
            description: "Liquidity pool tokens burned",
            icon: <Flame className="w-4 h-4" />,
            color: "orange",
            checked: formData.lp_burnt
        }
    ];

    return (
        <div className="py-4 grid grid-cols-2 gap-2.5">
            {auditItems.map((item) => (
                <button
                    key={item.field}
                    type="button"
                    data-active={item.checked}
                    onClick={() => handleCheckboxChange(item.field, !item.checked)}
                    className={cn(
                        "relative flex flex-col gap-2 p-3.5 rounded-xl border cursor-pointer text-left",
                        "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                        colorMap[item.color]
                    )}
                >
                    <div className="flex items-start justify-between">
                        <span className={cn("opacity-80", iconColorMap[item.color])}>{item.icon}</span>
                        <div
                            className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                item.checked ? indicatorCheckedMap[item.color] : "border-white/20 bg-transparent"
                            )}
                        >
                            {item.checked && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-[12px] font-semibold text-white/90 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{item.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
