// usage: node qa.mjs [--style=hf]   (bin/validate.mjs runs this)
import { runQa } from '../../hf/bin/qa.mjs';
runQa(import.meta.dirname);
