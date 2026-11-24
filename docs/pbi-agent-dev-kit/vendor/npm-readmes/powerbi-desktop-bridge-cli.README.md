# Power BI Desktop Bridge CLI

Command-line tooling for automating Power BI Desktop through the Desktop Bridge named
pipe. It is designed for agent workflows that edit PBIR/PBIP files, reload the
open report in Desktop, capture screenshots, and verify rendered output.

## Usage

```bash
npm install -g @microsoft/powerbi-desktop-bridge-cli
powerbi-desktop status
```

## Commands

| Command | Purpose |
|---------|---------|
| `powerbi-desktop open <path.pbip\|path.pbix>` | Launch Power BI Desktop with a report |
| `powerbi-desktop status [--pid <pid>]` | List bridge instances, current files, semantic model paths, Analysis Services server and database names, unsaved-change state, and PBIR pages resolved from each instance's current file |
| `powerbi-desktop manifest --pid <pid>` | Print the Desktop Bridge manifest for one Desktop instance |
| `powerbi-desktop reload --pid <pid>` | Reload the selected Desktop instance's current PBIP/PBIR report definition. For semantic model changes, use the semantic-model workflow and reopen the PBIP if changes are not reflected. |
| `powerbi-desktop screenshot <page-id> --pid <pid> [--scale <1-3>]` | Capture one report page from one selected Desktop instance; CLI default scale is `2` |
| `powerbi-desktop screenshot-all --pid <pid> --output-dir <dir> [--scale <1-3>]` | Capture every page listed in the selected Desktop instance's current PBIR `pages.json`; CLI default scale is `2` |

Most commands operate on a single Power BI Desktop process. When more than one
Desktop instance is available, run `powerbi-desktop status` first and pass the
desired bridge PID with `--pid`.

Commands write machine-readable JSON to stdout. Progress messages and
non-contract diagnostics are written to stderr so stdout can be piped safely to
other tools.

`reload` reloads the PBIP/PBIR report currently open in the selected Desktop
instance. It does not accept a separate report path; open the desired report in
Desktop first, then target that Desktop process with `--pid`.

Run reload and screenshot operations serially for a given PID. Discovery
commands such as `status` can run concurrently, but overlapping operations
against the same Desktop process may be cancelled or time out. Use
`--wait-seconds` when the report is still loading or immediately after a reload.

### Optional model metadata

`getApplicationState()` and each connected `status` instance expose these
Desktop-provided fields when available:

| Field | Meaning |
|-------|---------|
| `semanticModelDir` | Full path to the local semantic-model folder for an open Power BI project. Not every connected instance has a local folder. |
| `serverName` | Active Analysis Services endpoint, including the port for local models (for example, `localhost:49768`), not a source-data server. |
| `databaseName` | Name of the active Analysis Services database. |

The Desktop producer omits unavailable connection details and omits
`semanticModelDir` when its path is
null or empty. The CLI normalization preserves any received string, including
`""`, but omits null or missing values from `getApplicationState()` and
serialized status JSON. Treat an absent field as unavailable, not as evidence
that the instance is disconnected; an empty string is preserved but does not
provide a usable path or connection identifier.

### Unsaved changes

`reload` does not inspect `hasUnsavedChanges`. It reloads unconditionally, and
unsaved UI edits in Desktop are discarded — the behavior every released version
has had. Callers that need to protect in-progress edits should read the flag
themselves and decide before calling: `powerbi-desktop status` reports
`hasUnsavedChanges` per instance, and the library exposes it on
`getApplicationState()` and on the `applicationState` field of the `reload`
result.

> Reading the flag is a decision, not a formality. Power BI Desktop 2.157.627.0
> reports `hasUnsavedChanges: true` for a freshly-opened, untouched PBIP — with
> no user interaction — and the flag does not clear, even after a successful
> reload. Treating it as "there is real work to lose" will block on every
> instance on such builds.

## Programmatic API

The package ships two artifacts from one source tree:

| Specifier | Artifact | Contents |
|-----------|----------|----------|
| `@microsoft/powerbi-desktop-bridge-cli` | `dist/index.js` | The typed library. No commander, no side effects on import, nothing written to stdout or stderr. |
| `@microsoft/powerbi-desktop-bridge-cli/cli` | `dist/cli.js` | The `powerbi-desktop` binary and `createProgram()`. |

**Migrating from 0.1.x:** `createProgram()` is no longer exported from the root —
import it from `@microsoft/powerbi-desktop-bridge-cli/cli`. The `powerbi-desktop`
binary is unaffected. The CHANGELOG records why the split was made.

```ts
import { openSession, isDesktopBridgeError } from "@microsoft/powerbi-desktop-bridge-cli";

const session = await openSession({ pid: "12345", waitMs: 60_000 });
try {
  const state = await session.getApplicationState();
  if (state.hasUnsavedChanges) return;

  await session.reload({ waitMs: 60_000 });

  const result = await session.captureScreenshots({ outputDir: "screenshots", waitMs: 60_000 });
  if (!result.ok) {
    // Every page failed. This is an outcome, not a rejection.
    console.error(result.error.code, result.failures.length);
  } else if (result.status === "partial") {
    for (const failure of result.failures) {
      console.error(failure.page, failure.error.bridgeCode);
    }
  }
} catch (error) {
  if (isDesktopBridgeError(error)) console.error(error.code, error.details);
  throw error;
} finally {
  session.dispose();
}
```

### Reloading discards unsaved edits

> **`reload()` and `reloadReport()` reload unconditionally.** Neither reads
> `hasUnsavedChanges`, so unsaved UI edits in Desktop are discarded. Decide
> before you call: the flag is on `getApplicationState()`, on `status`, and on
> the `applicationState` field of the reload result. See
> [Unsaved changes](#unsaved-changes) for why the flag needs interpreting.

### Disposal ownership

**The caller owns the session.** `openSession()` returns a
`DesktopBridgeSession` holding a live named-pipe socket, and the caller must
call `dispose()` — it is idempotent, and `Symbol.dispose`/`Symbol.asyncDispose`
are implemented so `using`/`await using` work on Node 20.5+:

```ts
using session = await openSession({ pid: "12345" });
await session.reload();
```

The one-shot helpers (`getApplicationState`, `reloadReport`,
`captureScreenshot`, `captureScreenshots`, `readDesktopStatus`) are thin
wrappers over that model: they open a session, run one operation, and dispose it
in a `finally`, including when the operation throws. Multi-page capture must
hold a single connection across pages, which is why the session model is
primary rather than one-shot-only.

### Errors

Every failure is a `DesktopBridgeError` carrying `code`, `bridgeCode`,
`jsonRpcCode`, `retryable`, `retryAfterMs` and `details`. `code` is a
string-literal union (`DesktopBridgeErrorCode`), so a consumer can map it
exhaustively. Use `isDesktopBridgeError(value)` rather than `instanceof`: the
type carries an explicit `kind` brand, so the guard survives duplicate copies of
the package in a dependency tree. `CliError` remains as a deprecated alias, and
`error.name` is still `"CliError"`.

Library results and rejections always carry live typed errors. The flattened
`ErrorPayload` shape exists only for the CLI's JSON envelope.

### Retry budget

Every operation that can retry takes a caller-supplied `waitMs` budget. Retries
happen only when the server marks an error `retryable: true`, honouring
`retryAfterMs` (default 500ms). A budget of `0` means no retries. There is no
invented backoff policy.

### Multi-page capture is serial

`captureScreenshots` issues exactly one bridge request at a time and there is no
concurrency option. Overlapping operations against the same Desktop process are
cancelled or time out by Desktop itself, so this is a correctness constraint
rather than a performance choice.

Captures carry the PNG bytes in `image` only when you supply no destination.
Passing `outputPath`/`outputDir` makes the library write the file and release
the buffer, so a multi-page run holds roughly one page at a time rather than the
whole report; read the bytes back from `path` if you need them.

The result is an `ok`-first discriminated union so full success, partial
success, and total failure are all readable from the returned value: total
failure is `{ ok: false, error, failures }`; otherwise
`{ ok: true, status: "ok" | "partial", captures, failures }`.

If Desktop exits mid-run, the page in flight and every page after it fail with
`CONNECTION_LOST`, so the run ends as a partial or total failure naming the
cause rather than hanging.

### Capability introspection

`session.manifest` is the connected instance's raw manifest with each method's
`params` intact, alongside `METHODS`, `getMethodNames`, and `requireMethod`.
Per-argument capability checks ("does this method accept argument X?") are
deliberately **not** implemented here — consumers build them on top of
`manifest.methods[].params` without reaching around this API.

### Report identity

A PBIP project is a `Sales.pbip` file beside a `Sales.Report` folder. The
`.Report` folder is the canonical id a caller matches against a running Desktop
instance. String equality is the wrong comparison for it, so use the helpers
below.

```ts
import {
  resolveInstanceForReportFolder,
  resolveOwningPbip
} from "@microsoft/powerbi-desktop-bridge-cli";

// Reverse of resolveReportDir: .Report folder -> the .pbip Desktop can open.
const owner = resolveOwningPbip("C:\\Work\\Sales.Report");
if (owner.status === "missing") {
  // owner.searchedDir says where we looked — distinct from "several candidates".
} else if (owner.status === "ambiguous") {
  // owner.candidates — a project-layout problem, not a --pid problem.
}

// Folder -> running instance, discovery included. No pipe walk of your own.
const match = await resolveInstanceForReportFolder("C:\\Work\\Sales.Report");
if (match.status === "none") {
  // match.instances says what Desktop had open instead — and match.diagnostics
  // says whether discovery even ran: a non-empty array (UNSUPPORTED_OS,
  // PROCESS_DISCOVERY_FAILED) means the walk failed, not that nothing was open.
}
```

Both return discriminated unions, never a nullable string. `resolveOwningPbip`
reports `found`, `missing` (with `searchedDir`), or `ambiguous` (with
`candidates`). `resolveInstanceForReportFolder` reports `matched`, `none` (which
carries the `instances` Desktop had open instead), or `multiple` — never a silent
pick. `resolveOwningPbip`'s `ambiguous` is **not** `AMBIGUOUS_DESKTOP_INSTANCE`
(several running instances); it means several candidate project files.

`resolveInstanceForReportFolder` additionally carries `diagnostics` on its
result. An empty array means the pipe walk ran cleanly; an `UNSUPPORTED_OS` or
`PROCESS_DISCOVERY_FAILED` entry means it could not run at all, so a `none` from
a **failed** walk stays distinguishable from a `none` that walked and found no
matching report open — two states with opposite remediations. The synchronous
`matchReportFolderToInstance` does **not** carry diagnostics: it matches over
caller-supplied instances and never discovers, so it has nothing to report.

Some conditions are thrown faults rather than outcomes. An unreadable or
disconnected project directory throws `REPORT_PARENT_DIR_UNREADABLE`, a candidate
`.pbip` that cannot be inspected throws `OWNING_PBIP_UNREADABLE`, and empty or
whitespace-only input throws `REPORT_PATH_REQUIRED` (before any pipe walk).

**Comparison rules.** The `.Report` id is compared by these rules, not by string
equality:

| Rule | Behaviour |
|------|-----------|
| Windows case-insensitivity | `C:\Work\Sales.Report` == `c:\work\sales.report` on win32; case-**sensitive** on POSIX |
| Trailing separators | `...\Sales.Report\` == `...\Sales.Report`, for both `\` and `/` on Windows |
| Absolute vs. relative | resolved to absolute before comparing |

Pass a `.Report` folder — not a `.pbip` file or a bare project directory — to
`resolveInstanceForReportFolder` / `matchReportFolderToInstance`; anything else
yields `none`. You do not convert instances yourself: an instance whose open
file is `Sales.pbip` still matches the `Sales.Report` folder you pass, because
the two denote the same report. `resolveOwningPbip` searches the *parent* of the
path you give it, so pass the `.Report` folder, not the directory that contains
it.

**Relative paths** resolve against `process.cwd()`; pass absolute paths unless
you control the working directory. **Case folding runs on win32 only,** because
Power BI Desktop and its named-pipe bridge are Windows-only; macOS takes the
case-sensitive branch. The rules accept an optional `platform` argument.

**Symlinks and junctions.** Comparison is lexical first, then a `realpath`
fallback on the caller's folder that can only add matches, never remove one — so
an instance holding a junction path and another holding the real path both
match. Both exported entry points match identically. Two limitations worth
knowing: the reverse divergence (you pass the real path while Desktop reports a
junctioned or `subst`ed one) still misses, and a mapped drive and its UNC form
compare unequal because Windows does not rewrite drive letters to UNC.

**A page-read failure never erases identity.** `readDesktopStatus` (and the
`status` command) resolve each instance's `currentFilePath` and `.Report`
directory *before* loading its page list, so a missing or malformed `pages.json`
leaves the instance `connected` with its identity intact and surfaces the failure
as `pagesError` (a typed `DesktopBridgeError`) instead of collapsing the instance
to `bridgeStatus: "error"` and dropping `reportDir`. `resolveInstanceForReportFolder`
therefore still matches an instance whose report folder is being rewritten on
disk. Only a failure of the `application.state.get/v1` call itself — a genuinely
dead instance — yields an errored instance with no identity.

### Known limitation

Multi-page capture reads the page list from `definition/pages/pages.json` on
local disk while page ids are sent to the running Desktop instance. A PBIR
folder that has been edited but not reloaded can therefore ask Desktop for pages
it does not have; those pages come back as per-page failures. Reload before
capturing after editing page structure.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.

## Security

Microsoft takes the security of our software products and services seriously, which includes all source code repositories in our GitHub organizations.

**Please do not report security vulnerabilities through public GitHub issues.**

For security reporting information, locations, contact information, and policies, please review the latest guidance for Microsoft repositories at [https://aka.ms/SECURITY.md](https://aka.ms/SECURITY.md).

## Code of conduct

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

See the full [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
