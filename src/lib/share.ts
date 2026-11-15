// One way out for every share image in the app: the native sheet in the Android app,
// the system sheet on phones (where Instagram, WhatsApp and the rest appear), downloads on laptops.
import { shareBlob, shareBlobs } from "./native";
import { isPhone } from "./site";

export type Delivered = "shared" | "downloaded" | "cancelled";

export async function deliverImages(blobs: Blob[], names: string[]): Promise<Delivered> {
  try {
    if (blobs.length === 1 ? await shareBlob(blobs[0], names[0]) : await shareBlobs(blobs, names)) return "shared";
    const files = blobs.map((b, i) => new File([b], names[i], { type: "image/png" }));
    if (isPhone() && navigator.canShare?.({ files })) { await navigator.share({ files }); return "shared"; }
    for (let i = 0; i < blobs.length; i++) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blobs[i]); a.download = names[i]; a.click();
      const href = a.href;
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      if (blobs.length > 1) await new Promise((r) => setTimeout(r, 250));
    }
    return "downloaded";
  } catch (e) {
    if (e instanceof Error && /abort|cancel/i.test(e.name + e.message)) return "cancelled";
    throw e;
  }
}
