import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Two lines to my past self. Line one warns about one specific moment —
// 2 a.m., the kitchen table, a text to Maya that was never sent. Line two
// traces the cause and effect: that one unsent message is why she still
// picks up, and why I learned to sleep on every word I can't take back.
const ENTRY =
  "Don't send that 2 a.m. text to Maya from the kitchen table — put the phone down and go to bed.\n" +
  "That one unsent message is why she still picks up when you call, and why you now sleep on every word you can't take back.";

const MAX_CHARS = 280;
const EXPECTED_CHARS = 216;
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function guard(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1 to ${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`entry must be exactly two lines, got ${lines.length}`);
  }
  for (const line of lines) {
    if (line.trim().length === 0) {
      throw new Error("each line must hold text");
    }
    // One sentence per line: exactly one sentence-ending mark, ignoring
    // the periods inside a time like "2 a.m.".
    const stripped = line.replace(/\b[ap]\.m\./gi, "");
    const ends = (stripped.match(/[.!?]/g) ?? []).length;
    if (ends !== 1) {
      throw new Error(`each line must be one sentence, got ${ends} ends in: ${line}`);
    }
  }
}

function main(): void {
  guard(ENTRY);
  // Create /output if needed; never delete the output directory itself.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Verify the write landed byte-identical, with no trailing newline.
  const written = readFileSync(OUT_FILE, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the two lines");
  }
  if (!Buffer.from(written, "utf8").equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt bytes do not match the two lines");
  }
  console.log(`${[...written].length} chars, ${written.split("\n").length} lines:`);
  console.log(written);
}

main();
