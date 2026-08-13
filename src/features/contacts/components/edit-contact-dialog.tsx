"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import type { ContactRow, ContactRowStatus } from "@/types/contacts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneNumberWithCountryInput } from "@/features/shared/components/phone-number-with-country-input";
import {
  buildE164Phone,
  findCountryByIso2,
  splitE164Phone,
} from "@/features/shared/lib/phone-country-prefixes";

type EditContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  contact: ContactRow | null;
  onSave: (input: {
    name: string;
    phone: string;
    status: ContactRowStatus;
  }) => Promise<void>;
};

export function EditContactDialog({
  open,
  onOpenChange,
  groupName,
  contact,
  onSave,
}: EditContactDialogProps) {
  const isOpen = Boolean(open && contact);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && contact ? (
        <EditContactDialogContent
          key={contact.id}
          groupName={groupName}
          contact={contact}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

type EditContactDialogContentProps = {
  groupName: string;
  contact: ContactRow;
  onSave: (input: {
    name: string;
    phone: string;
    status: ContactRowStatus;
  }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

function EditContactDialogContent({
  groupName,
  contact,
  onSave,
  onOpenChange,
}: EditContactDialogContentProps) {
  const initialPhone = splitE164Phone(contact.phone);
  const [name, setName] = React.useState(contact.name);
  const [phoneCountryIso2, setPhoneCountryIso2] = React.useState(
    initialPhone.iso2
  );
  const [localPhoneNumber, setLocalPhoneNumber] = React.useState(
    initialPhone.localNumber
  );
  const [status, setStatus] = React.useState<ContactRowStatus>(contact.status);
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
    const n = name.trim();
    if (!localPhoneNumber.trim() || !n || saving) return;
    setSaving(true);
    try {
      await onSave({ name: n || "Contact", phone, status });
      onOpenChange(false);
    } catch {
      // Parent shows toast; keep dialog open.
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="rounded-lg border-border sm:max-w-md" showCloseButton>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground dark:bg-muted dark:text-foreground">
            <Pencil className="size-4" />
          </div>
          <DialogTitle>Edit contact</DialogTitle>
        </div>
        <DialogDescription>
          Update this contact in{" "}
          <span className="font-medium">{groupName}</span>. Phone is
          normalized to E.164 on save.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-c-name">Name</Label>
          <Input
            id="edit-c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact name"
            className="h-10 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-c-phone">Phone</Label>
          <PhoneNumberWithCountryInput
            id="edit-c-phone"
            countryIso2={phoneCountryIso2}
            onCountryIso2Change={setPhoneCountryIso2}
            localNumber={localPhoneNumber}
            onLocalNumberChange={setLocalPhoneNumber}
            placeholder="Phone number without country code"
            className="h-10 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-c-status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus((v ?? "unverified") as ContactRowStatus)
            }
            items={[
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
              { value: "invalid", label: "Invalid" },
            ]}
          >
            <SelectTrigger id="edit-c-status" className="h-10 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
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
            className="rounded-md bg-primary font-semibold text-white hover:bg-primary/90"
            disabled={!localPhoneNumber.trim() || !name.trim() || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
