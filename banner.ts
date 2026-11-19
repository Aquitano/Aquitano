export {};

const themes = {
  dark: { bg: "#0a0a0b", fg: "#ededf0", muted: "#88888f", accent: "#e8874a" },
  light: { bg: "#f5f4f0", fg: "#141416", muted: "#63636a", accent: "#b3541a" },
} as const;

type Theme = (typeof themes)[keyof typeof themes];

const jobs = [
  { name: "element", status: "Running", since: "2026-10", what: "working student" },
  { name: "cloudflare", status: "Completed", since: "2026-07", what: "Go, 100M events/s pipeline" },
  { name: "itestra", status: "Completed", since: "2025-03", what: "COBOL to Java/Quarkus" },
  { name: "check24", status: "Completed", since: "2025-08", what: "async pipeline, P95 -50%" },
] as const;

const projects = [
  { name: "aqt-sync", lang: "Go", since: "2026-06", what: "zero-knowledge file sync" },
  { name: "aqt-health", lang: "Kotlin", since: "2026-04", what: "health data API" },
  { name: "chill-flow", lang: "Rust", since: "2025-02", what: "terminal focus player" },
] as const;

const GLYPHS: Record<string, ReadonlyArray<string>> = {
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  I: ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
  N: ["#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};

const WIDTH = 1200;
const LEFT = 72;
const LINE = 35;
const BLOCK = 13;
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const TAGLINE = "Backend and systems engineer. CS student at the University of Passau.";
const COLUMNS = [LEFT, 290, 460, 600] as const;

const layout = (() => {
  const whoami = 86;
  const nameTop = whoami + 22;
  const tagline = nameTop + BLOCK * 7 + 38;
  const jobsCommand = tagline + LINE * 2;
  const projectsCommand = jobsCommand + LINE * (jobs.length + 3);
  const prompt = projectsCommand + LINE * (projects.length + 2) + 8;
  return { whoami, nameTop, tagline, jobsCommand, projectsCommand, prompt, height: prompt + 54 };
})();

function blockName(name: string, theme: Theme): string {
  const blocks: Array<{ x: number; y: number }> = [];
  let column = 0;
  for (const letter of name) {
    const glyph = GLYPHS[letter] ?? [];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((cell, cellIndex) => {
        if (cell === "#") {
          blocks.push({ x: LEFT + (column + cellIndex) * BLOCK, y: layout.nameTop + rowIndex * BLOCK });
        }
      });
    });
    column += (glyph[0]?.length ?? 0) + 1;
  }

  return blocks
    .map((block, index) => {
      const arriving = index % 17 === 5;
      const motion = arriving ? ` class="arriving" style="animation-delay:${(index % 5) * 400}ms"` : "";
      return `<rect${motion} x="${block.x}" y="${block.y}" width="${BLOCK}" height="${BLOCK}" fill="${arriving ? theme.accent : theme.fg}"/>`;
    })
    .join("");
}

function render(theme: Theme): string {
  const text = (x: number, y: number, fill: string, content: string) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-family="${MONO}" font-size="20" xml:space="preserve">${content}</text>`;
  const prompt = (y: number, command: string) =>
    text(LEFT, y, theme.fg, `<tspan fill="${theme.accent}">$</tspan> ${command}`);

  const table = (
    top: number,
    command: string,
    second: string,
    rows: ReadonlyArray<{ name: string; second: string; highlight: boolean; since: string; what: string }>,
  ) =>
    [
      prompt(top, command),
      ...["NAME", second, "SINCE", "WHAT"].map((heading, index) =>
        text(COLUMNS[index] ?? LEFT, top + LINE, theme.muted, heading),
      ),
      ...rows.map((row, index) => {
        const y = top + LINE * (index + 2);
        return [
          text(COLUMNS[0], y, theme.fg, row.name),
          text(COLUMNS[1], y, row.highlight ? theme.accent : theme.muted, row.second),
          text(COLUMNS[2], y, theme.muted, row.since),
          text(COLUMNS[3], y, theme.fg, row.what),
        ].join("");
      }),
    ].join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${layout.height}" viewBox="0 0 ${WIDTH} ${layout.height}" role="img" aria-label="Terminal session. whoami prints Thomas Breindl in block letters, then: ${TAGLINE} kubectl get jobs lists Element as running and Cloudflare, itestra and CHECK24 as completed. kubectl get projects lists aqt-sync in Go, aqt-health in Kotlin and chill-flow in Rust.">
  <style>
    .arriving{animation:arrive 2.8s ease-in-out infinite}
    .cursor{animation:blink 1.1s steps(1) infinite}
    @keyframes arrive{50%{opacity:.25}}
    @keyframes blink{50%{opacity:0}}
    @media (prefers-reduced-motion:reduce){.arriving,.cursor{animation:none}}
  </style>
  <defs>
    <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${theme.fg}" fill-opacity="0.09"/>
    </pattern>
  </defs>

  <rect width="${WIDTH}" height="${layout.height}" fill="${theme.bg}"/>
  <rect width="${WIDTH}" height="${layout.height}" fill="url(#dots)"/>
  <rect x="20.5" y="20.5" width="${WIDTH - 41}" height="${layout.height - 41}" fill="none" stroke="${theme.fg}" stroke-opacity="0.24" stroke-dasharray="6 6"/>
  <g fill="${theme.fg}" fill-opacity="0.45">
    <rect x="16" y="16" width="9" height="9"/><rect x="${WIDTH - 25}" y="16" width="9" height="9"/>
    <rect x="16" y="${layout.height - 25}" width="9" height="9"/><rect x="${WIDTH - 25}" y="${layout.height - 25}" width="9" height="9"/>
  </g>

  ${prompt(layout.whoami, "whoami")}
  ${blockName("THOMAS BREINDL", theme)}
  ${text(LEFT, layout.tagline, theme.fg, TAGLINE)}

  ${table(
    layout.jobsCommand,
    "kubectl get jobs.thomasbreindl.me",
    "STATUS",
    jobs.map((job) => ({ ...job, second: job.status, highlight: job.status === "Running" })),
  )}

  ${table(
    layout.projectsCommand,
    "kubectl get projects.thomasbreindl.me",
    "LANG",
    projects.map((project) => ({ ...project, second: project.lang, highlight: true })),
  )}

  ${prompt(layout.prompt, "")}
  <rect class="cursor" x="${LEFT + 26}" y="${layout.prompt - 17}" width="11" height="21" fill="${theme.fg}"/>
</svg>
`;
}

for (const [name, theme] of Object.entries(themes)) {
  await Bun.write(`assets/banner-${name}.svg`, render(theme));
}
