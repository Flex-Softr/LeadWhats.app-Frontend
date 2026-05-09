"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
};

export function PhoneNumberWithCountryInput({
  countryIso2,
  onCountryIso2Change,
  localNumber,
  onLocalNumberChange,
  id = "phone-local",
  disabled = false,
  placeholder = "Enter phone number",
}: PhoneNumberWithCountryInputProps) {
  const selectedCountry = React.useMemo(
    () => findCountryByIso2(countryIso2) ?? PHONE_COUNTRY_PREFIXES[0],
    [countryIso2]
  );
  const selectedCountryFlag = `https://flagcdn.com/w40/${selectedCountry.iso2.toLowerCase()}.png`;

  return (
    <div
      className={cn(
        "flex h-11 w-full items-stretch overflow-hidden rounded-lg border border-input bg-transparent transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "dark:bg-input/30 dark:hover:bg-input/50",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <Select
        value={selectedCountry.iso2}
        onValueChange={(value) => onCountryIso2Change(value ?? selectedCountry.iso2)}
        disabled={disabled}
      >
        <SelectTrigger
          size="default"
          className="h-full w-[4rem] min-w-[4rem] rounded-none border-0 border-r border-input bg-transparent px-1.5 pr-1 shadow-none hover:bg-transparent focus-visible:border-r focus-visible:ring-0 data-[size=default]:h-full"
        >
          <SelectValue className="items-center pl-1">
            <span className="inline-flex items-center">
              <img
                src={selectedCountryFlag}
                alt={`${selectedCountry.name} flag`}
                className="h-4 w-6 rounded-[2px] object-cover"
                loading="lazy"
              />
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PHONE_COUNTRY_PREFIXES.map((item) => (
            <SelectItem key={`${item.iso2}-${item.dialCode}`} value={item.iso2}>
              <span className="inline-flex items-center gap-2">
                <img
                  src={`https://flagcdn.com/w40/${item.iso2.toLowerCase()}.png`}
                  alt={`${item.name} flag`}
                  className="h-4 w-6 rounded-[2px] object-cover"
                  loading="lazy"
                />
                <span className="text-sm">{item.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        id={id}
        type="tel"
        value={localNumber}
        onChange={(e) => onLocalNumberChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full border-0 bg-transparent px-3 text-sm leading-none outline-none placeholder:text-muted-foreground"
        disabled={disabled}
        inputMode="numeric"
      />
    </div>
  );
}
