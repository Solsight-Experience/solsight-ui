import type { Metadata } from "next";
import { StakingPage } from "./StakingPage";

export const metadata: Metadata = {
    title: "Stake SOL | SolSight",
    description: "Stake SOL and earn protocol trading fees on SolSight."
};

export default function Page() {
    return <StakingPage />;
}
