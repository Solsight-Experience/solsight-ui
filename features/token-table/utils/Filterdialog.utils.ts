import { TokenFilterRequest } from "@/types/filter";
import { FilterFormData } from "../types/Filterdialog.types";

/**
 * if min > max, swap them
 * null / 0 is "no limit"
 */
export function normalizeMinMax<T extends number | null>(min: T, max: T): [T, T] {
    if (min != null && max != null && min > 0 && max > 0 && min > max) {
        return [max, min];
    }
    return [min, max];
}

export function getFilterRequestBody(formData: FilterFormData): TokenFilterRequest {
    const tokenRequest: TokenFilterRequest = {};

    // Metrics — each bound is independent; 0 means "not set"
    const metrics: TokenFilterRequest["metrics"] = {};

    const [ageMin, ageMax] = normalizeMinMax(formData.age_min_minutes, formData.age_max_minutes);
    if (ageMin) metrics.age_min_minutes = ageMin;
    if (ageMax) metrics.age_max_minutes = ageMax;

    const [liquidityMin, liquidityMax] = normalizeMinMax(formData.liquidity_min, formData.liquidity_max);
    if (liquidityMin) metrics.liquidity_min = liquidityMin;
    if (liquidityMax) metrics.liquidity_max = liquidityMax;

    const [marketCapMin, marketCapMax] = normalizeMinMax(formData.market_cap_min, formData.market_cap_max);
    if (marketCapMin) metrics.market_cap_min = marketCapMin;
    if (marketCapMax) metrics.market_cap_max = marketCapMax;

    const [volumeMin, volumeMax] = normalizeMinMax(formData.volume_24h_min, formData.volume_24h_max);
    if (volumeMin) metrics.volume_24h_min = volumeMin;
    if (volumeMax) metrics.volume_24h_max = volumeMax;

    const [txnsMin, txnsMax] = normalizeMinMax(formData.txns_24h_min, formData.txns_24h_max);
    if (txnsMin) metrics.txns_24h_min = txnsMin;
    if (txnsMax) metrics.txns_24h_max = txnsMax;

    if (Object.keys(metrics).length > 0) {
        tokenRequest.metrics = metrics;
    }

    // Audits
    const audit_filters: TokenFilterRequest["audit_filters"] = {};
    if (formData.mint_authority_disabled) {
        audit_filters.mint_authority_disabled = true;
    }
    if (formData.freeze_authority_disabled) {
        audit_filters.freeze_authority_disabled = true;
    }
    if (formData.lp_burnt) {
        audit_filters.lp_burnt = true;
    }
    if (formData.has_social_links) {
        audit_filters.has_social_links = true;
    }

    if (Object.keys(audit_filters).length > 0) {
        tokenRequest.audit_filters = audit_filters;
    }

    return tokenRequest;
}
