import { Label } from "./label";

interface TimeValue {
    hour: string;
    minute: string;
    period: "AM" | "PM";
}

export const TimePicker = ({ value, onChange, label }: { value: TimeValue; onChange: (val: TimeValue) => void; label: string }) => {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-sm w-10">{label}</Label>

            {/* Hour Input */}
            <input
                type="text"
                value={value.hour}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val === "") {
                        onChange({ ...value, hour: "" });
                    } else {
                        const num = parseInt(val);
                        if (num >= 1 && num <= 12) {
                            onChange({ ...value, hour: val });
                        } else if (val.length === 1 && num === 0) {
                            // Cho phép nhập số 0 đầu tiên (để có thể nhập 01, 02, etc)
                            onChange({ ...value, hour: val });
                        }
                    }
                }}
                placeholder="12"
                maxLength={2}
                className="w-10 h-8 bg-transparent border-2 border-gray-600 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <span className="text-base">:</span>

            {/* Minute Input */}
            <input
                type="text"
                value={value.minute}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val === "") {
                        onChange({ ...value, minute: "" });
                    } else {
                        const num = parseInt(val);
                        if (num <= 59) {
                            onChange({ ...value, minute: val });
                        }
                    }
                }}
                placeholder="00"
                maxLength={2}
                className="w-10 h-8 bg-transparent border-2 border-gray-600 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* AM/PM Toggle */}
            <div className="flex rounded-lg overflow-hidden border-2 border-gray-600">
                <button
                    onClick={() => onChange({ ...value, period: "AM" })}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                        value.period === "AM" ? "bg-purple-500 text-white" : "bg-transparent text-gray-400"
                    }`}
                >
                    AM
                </button>
                <button
                    onClick={() => onChange({ ...value, period: "PM" })}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                        value.period === "PM" ? "bg-purple-500 text-white" : "bg-transparent text-gray-400"
                    }`}
                >
                    PM
                </button>
            </div>
        </div>
    );
};
