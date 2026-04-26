export type DemoMessagingDevice = {
  id: string;
  /** Shown in the device select */
  label: string;
  /** Digits or E.164 — for display in label */
  phone: string;
};

export type DemoMessageTemplate = {
  id: string;
  name: string;
};

export const DEMO_MESSAGING_DEVICES: DemoMessagingDevice[] = [
  {
    id: "rahul",
    label: "Rahul (+917261902348)",
    phone: "+917261902348",
  },
  {
    id: "support",
    label: "Support line (+1 555 0100)",
    phone: "+15550100",
  },
];

export const DEMO_MESSAGE_TEMPLATES: DemoMessageTemplate[] = [
  { id: "welcome", name: "Welcome — new subscriber" },
  { id: "order", name: "Order confirmation" },
  { id: "appointment", name: "Appointment reminder" },
];
