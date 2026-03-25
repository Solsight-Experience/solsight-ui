import TransferForm from "@/features/transfers/components/TransferForm";
import { Toaster } from "sonner";

export default function TransferPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Transfer SOL</h1>
                <p className="text-muted-foreground mt-2">Send SOL tokens securely to any Solana wallet address</p>
            </div>

            <TransferForm />
            <Toaster position="top-right" />
        </div>
    );
}
