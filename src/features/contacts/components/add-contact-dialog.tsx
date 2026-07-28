"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberWithCountryInput } from "@/features/shared/components/phone-number-with-country-input";
import {
  buildE164Phone,
  DEFAULT_PHONE_COUNTRY_ISO2,
  findCountryByIso2,
} from "@/features/shared/lib/phone-country-prefixes";

type AddContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onAdd: (input: { name: string; phone: string }) => Promise<void>;
};

export function AddContactDialog({
  open,
  onOpenChange,
  groupName,
  onAdd,
}: AddContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddContactDialogContent
          groupName={groupName}
          onAdd={onAdd}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

type AddContactDialogContentProps = {
  groupName: string;
  onAdd: (input: { name: string; phone: string }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

function AddContactDialogContent({
  groupName,
  onAdd,
  onOpenChange,
}: AddContactDialogContentProps) {
  const [name, setName] = React.useState("");
  const [phoneCountryIso2, setPhoneCountryIso2] = React.useState(
    DEFAULT_PHONE_COUNTRY_ISO2
  );
  const [localPhoneNumber, setLocalPhoneNumber] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const selectedCountry = React.useMemo(
    () => findCountryByIso2(phoneCountryIso2),
    [phoneCountryIso2]
  );
  const phone = React.useMemo(
    () => buildE164Phone(selectedCountry?.dialCode ?? "+", localPhoneNumber),
    [localPhoneNumber, selectedCountry?.dialCode]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!localPhoneNumber.trim() || saving) return;
    setSaving(true);
    try {
      await onAdd({ name: name.trim() || "Contact", phone });
      onOpenChange(false);
    } catch {
      // Parent shows toast; keep dialog open.
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="rounded-lg border-violet-100 sm:max-w-md" showCloseButton>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
            <UserPlus className="size-4" />
          </div>
          <DialogTitle>Add contact</DialogTitle>
        </div>
        <DialogDescription>
          Add one contact to <span className="font-medium">{groupName}</span>.
          Select a country code, then enter the local number.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="add-c-name">Name</Label>
          <Input
            id="add-c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact name"
            className="h-10 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="add-c-phone">Phone</Label>
          <PhoneNumberWithCountryInput
            id="add-c-phone"
            countryIso2={phoneCountryIso2}
            onCountryIso2Change={setPhoneCountryIso2}
            localNumber={localPhoneNumber}
            onLocalNumberChange={setLocalPhoneNumber}
            placeholder="Phone number without country code"
            className="h-10 rounded-md"
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="rounded-md"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
            disabled={!localPhoneNumber.trim() || saving}
          >
            {saving ? "Adding..." : "Add contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
