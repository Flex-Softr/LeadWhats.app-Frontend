export type LiveChatThreadApi = {
  id: string;
  deviceId: string;
  deviceName: string;
  peerPhone: string;
  peerLabel: string;
  displayTitle: string;
  lastPreview: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LiveChatMessageRowApi = {
  id: string;
  direction: "inbound" | "outbound";
  bodyText: string;
  createdAt: string;
  kind?:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "sticker"
    | "location"
    | "contact"
    | "unknown";
  assetId?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  deliveryStatus?: "queued" | "sent" | "failed" | "simulated";
};

export type LiveChatThreadsListResponse = {
  threads: LiveChatThreadApi[];
};

export type LiveChatThreadMutationResponse = {
  thread: LiveChatThreadApi;
};

export type LiveChatMessagesListResponse = {
  messages: LiveChatMessageRowApi[];
  nextCursor: string | null;
};

export type LiveChatSendMessageResponse = {
  message: LiveChatMessageRowApi;
  outbound: {
    id: string;
    status: string;
    note?: string;
  };
};
