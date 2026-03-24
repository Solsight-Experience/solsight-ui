import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Layers, History, Star } from "lucide-react";

const quickLinkItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "token_explorer", icon: Layers, label: "Token Explorer" },
    { id: "txn_history", icon: History, label: "Transaction History" },
    { id: "watch_list", icon: Star, label: "Watch list" }
];

export const QuickLinks: React.FC = () => {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-base">Quick links</Label>
            <div className="flex flex-col gap-2">
                {quickLinkItems.map((item) => (
                    <Button variant="outline" key={item.id} className="rounded-full flex justify-start hover:cursor-pointer">
                        <item.icon className="size-4" />
                        {item.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
