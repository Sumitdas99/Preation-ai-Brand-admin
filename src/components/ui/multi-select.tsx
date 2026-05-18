import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
    emptyMessage?: string;
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className,
    triggerClassName,
    emptyMessage = "No options",
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const selectedSet = React.useMemo(() => new Set(value), [value]);

    const toggle = (optValue: string) => {
        const next = selectedSet.has(optValue)
            ? value.filter((v) => v !== optValue)
            : [...value, optValue].sort();
        onChange(next);
    };

    const label =
        value.length === 0
            ? placeholder
            : value.length <= 2
              ? value.join(", ")
              : `${value.length} selected`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className={cn(
                        "min-h-10 w-full justify-between font-normal",
                        !value.length && "text-muted-foreground",
                        triggerClassName
                    )}
                >
                    <span className="truncate">{label}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("z-[100] min-w-[14rem] max-w-[var(--radix-popover-trigger-width)] p-0", className)}
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="max-h-64 overflow-y-auto rounded-md p-1">
                    {options.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        <ul role="listbox" className="space-y-0">
                            {options.map((opt) => (
                                <li key={opt.value} role="option" aria-selected={selectedSet.has(opt.value)}>
                                    <label
                                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <Checkbox
                                            checked={selectedSet.has(opt.value)}
                                            onCheckedChange={() => toggle(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
