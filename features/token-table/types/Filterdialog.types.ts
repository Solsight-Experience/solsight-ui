export interface FilterFormData {
    // Metrics
    age_min_minutes: number | null;
    age_max_minutes: number | null;
    liquidity_min: number | null;
    liquidity_max: number | null;
    market_cap_min: number | null;
    market_cap_max: number | null;
    volume_24h_min: number;
    volume_24h_max: number | null;
    txns_24h_min: number;
    txns_24h_max: number | null;

    // Audits
    mint_authority_disabled: boolean;
    freeze_authority_disabled: boolean;
    lp_burnt: boolean;
    has_social_links: boolean;

    // Categories
    categories: string[];
}

export interface FilterDialogProps {
    formData: FilterFormData;
    onFormChange: (data: Partial<FilterFormData>) => void;
}

export interface FilterListProps {
    formData: FilterFormData;
    onFormChange: (data: Partial<FilterFormData>) => void;
}
