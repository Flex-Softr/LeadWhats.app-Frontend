"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  findCountryByIso2,
  PHONE_COUNTRY_PREFIXES,
} from "@/features/shared/lib/phone-country-prefixes";
import { cn } from "@/lib/utils";

type PhoneNumberWithCountryInputProps = {
  countryIso2: string;
  onCountryIso2Change: (iso2: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function PhoneNumberWithCountryInput({
  countryIso2,
  onCountryIso2Change,
  localNumber,
  onLocalNumberChange,
  id = "phone-local",
  disabled = false,
  placeholder = "Enter phone number",
  className,
}: PhoneNumberWithCountryInputProps) {
  const selectedCountry = React.useMemo(
    () => findCountryByIso2(countryIso2) ?? PHONE_COUNTRY_PREFIXES[0],
    [countryIso2]
  );
  const selectedCountryFlag = `https://flagcdn.com/w80/${selectedCountry.iso2.toLowerCase()}.png`;

  return (
    <div
      className={cn(
        "flex h-11 w-full items-stretch overflow-hidden rounded-lg border border-input bg-transparent shadow-xs transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "dark:bg-input/30 dark:hover:bg-input/50",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <Select
        value={selectedCountry.iso2}
        onValueChange={(value) => onCountryIso2Change(value ?? selectedCountry.iso2)}
        disabled={disabled}
        items={PHONE_COUNTRY_PREFIXES.map((item) => ({
          value: item.iso2,
          label: `${item.name} (${item.dialCode})`,
        }))}
      >
        <SelectTrigger
          size="default"
          className="h-full w-auto min-w-[5.75rem] shrink-0 rounded-none border-0 border-r border-input bg-slate-50/70 px-2.5 shadow-none hover:bg-slate-100/80 focus-visible:border-r focus-visible:ring-0 data-[size=default]:h-full data-[size=default]:rounded-none dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
        >
          <SelectValue className="flex items-center gap-1.5 pl-0.5">
            <span className="inline-flex items-center gap-2">
              <img
                src={selectedCountryFlag}
                alt={`${selectedCountry.name} flag`}
                className="h-5 w-7 shrink-0 rounded-[3px] border border-black/10 object-cover shadow-xs dark:border-white/15"
                loading="lazy"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {selectedCountry.dialCode}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {PHONE_COUNTRY_PREFIXES.map((item) => (
            <SelectItem key={`${item.iso2}-${item.dialCode}`} value={item.iso2}>
              <span className="inline-flex items-center gap-2.5">
                <img
                  src={`https://flagcdn.com/w80/${item.iso2.toLowerCase()}.png`}
                  alt={`${item.name} flag`}
                  className="h-4.5 w-6.5 shrink-0 rounded-[3px] border border-black/10 object-cover shadow-xs dark:border-white/15"
                  loading="lazy"
                />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {item.dialCode}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        id={id}
        type="tel"
        value={localNumber}
        onChange={(e) => onLocalNumberChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-none border-0 bg-transparent px-3 text-sm leading-none shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        disabled={disabled}
        inputMode="numeric"
      />
    </div>
  );
}
