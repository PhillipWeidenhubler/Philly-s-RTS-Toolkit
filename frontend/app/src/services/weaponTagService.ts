import type { WeaponTagMap } from "../types";
import { hostBridge } from "../lib/hostBridge";
import { deepClone } from "../lib/helpers";

type TagEnvelope = WeaponTagMap | undefined;

const emptyMap = (): WeaponTagMap => ({ categories: {}, calibers: {} });

class WeaponTagService {
  private tags: WeaponTagMap = emptyMap();
  private readonly subscribers = new Set<(tags: WeaponTagMap) => void>();

  constructor() {
    hostBridge.on<TagEnvelope>("weapon-tags-data", (payload) => {
      this.tags = payload ? deepClone(payload) : emptyMap();
      this.publish();
    });
  }

  async loadTags(): Promise<WeaponTagMap> {
    if (!hostBridge.isAvailable) {
      return this.getTags();
    }
    const payload = await hostBridge.request<undefined, TagEnvelope>(
      "get-weapon-tags",
      undefined,
      "weapon-tags-data"
    );
    this.tags = payload ? deepClone(payload) : emptyMap();
    this.publish();
    return this.getTags();
  }

  async saveTags(tags: WeaponTagMap): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist weapon tags.");
    }
    await hostBridge.request<WeaponTagMap, TagEnvelope>("save-weapon-tags", tags, "weapon-tags-data");
  }

  getTags(): WeaponTagMap {
    return deepClone(this.tags);
  }

  subscribe(callback: (tags: WeaponTagMap) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getTags());
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.getTags();
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const weaponTagService = new WeaponTagService();
