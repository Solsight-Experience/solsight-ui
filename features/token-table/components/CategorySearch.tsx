import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CategorySearchProps {
    value: string;
    onChange: (value: string) => void;
}

/**
 * CategorySearch Component
 * Search input for filtering categories in the Categories tab
 */
export const CategorySearch = memo<CategorySearchProps>(function CategorySearch({ value, onChange }) {
    return (
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search category"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 rounded-full border-border bg-background"
            />
        </div>
    );
});
