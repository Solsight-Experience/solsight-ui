export { slippageItem, SlippageItem } from "./slippage-item";
export { priorityFeeItem, PriorityFeeItem } from "./priority-fee-item";
export { tipFeeItem, TipFeeItem } from "./tip-fee-item";
export { maxAutoFeeItem, MaxAutoFeeItem } from "./max-auto-fee-item";
export { antiMevItem, AntiMevItem } from "./anti-mev-item";
export { gaslessItem, GaslessItem } from "./gasless-item";

import { slippageItem } from "./slippage-item";
import { priorityFeeItem } from "./priority-fee-item";
import { tipFeeItem } from "./tip-fee-item";
import { maxAutoFeeItem } from "./max-auto-fee-item";
import { antiMevItem } from "./anti-mev-item";
import { gaslessItem } from "./gasless-item";

export const SWAP_CONFIG_ITEMS = [slippageItem, priorityFeeItem, tipFeeItem, maxAutoFeeItem, antiMevItem, gaslessItem] as const;
