// Episode thumbnail (used by `hf.mjs thumb` and bin/validate.mjs): the shared HyperFrames cover with this
// episode's hero drawing (scenes/thumb-hero.html), hook and name from the database.
import { renderThumb } from '../../hf/lib/thumb.mjs';

export default async function thumbnail(outPath, { item }) {
  return renderThumb(import.meta.dirname, { item }, outPath);
}
