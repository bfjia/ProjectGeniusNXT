# 11: Environment, account and permission check (run by the implementation agent)

**Who runs this:** the implementation agent, on the implementation computer, as the **first task of M0**, before any code is written. Re-run it at M10 on the owner's Windows machine if that's a different computer.

**Why:** the owner shouldn't have to collect machine details by hand. The agent runs every check it can automatically, writes `ENVIRONMENT-CHECK.md` at the kit root (add it to `.gitignore`, since it contains machine details), and then asks the owner **only** about failures and the items marked *owner-confirm*.

**Rules:**
- **Checks are read-only.** Don't install, change settings or sign in during the check.
- **Never install or configure anything, at any point** (not only during the check). The owner has no admin rights. All remediation is done **by the owner**, using the per-user commands in `01-setup.md` §1–§4, or by IT. The agent's job is to report precisely and wait.
- **Run each command separately** and record its exact output, or "not found".
- **Don't print secrets.** For tokens, record only whether one was obtained.
- **Primary shell is PowerShell 7** (`pwsh`). The bash equivalents are for WSL/Linux dev machines; Windows-only checks are marked **[Win]**.

---

## 1. Machine

| ID | Check | PowerShell | bash (WSL/Linux) | Pass criteria / notes |
|---|---|---|---|---|
| M-01 | OS and version | `Get-ComputerInfo -Property OsName,OsVersion,OsArchitecture` | `uname -a; cat /etc/os-release` | Windows 10/11 x64 or arm64 for the full feature set. On WSL/Linux, record that Desktop-dependent steps must run on Windows. |
| M-02 | Running inside WSL? | n/a | `grep -qi microsoft /proc/version && echo WSL` | If WSL: note the Windows host is needed for Desktop, the MCP and the bridge (`01-setup.md` §10). |
| M-03 | PowerShell version | `$PSVersionTable.PSVersion` | `pwsh --version` | ≥ 6 is required by Copilot CLI on Windows; 7.x is recommended. |
| M-04 | Planned kit path length and OneDrive | `$p="$env:USERPROFILE\pbi\PowerBIAgent"; $p.Length; $env:OneDrive; $env:OneDriveCommercial` | `pwd` | The kit path should be ≤ 40 characters and **not** under `$env:OneDrive*` (260-char limit, sync locks). |
| M-05 **[Win]** | Long paths enabled | `Get-ItemPropertyValue 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' LongPathsEnabled` | n/a | 1 is nice to have; 0 is fine if paths are short. |
| M-06 | Free disk space | `Get-PSDrive C` | `df -h .` | ≥ 5 GB free (conda env + node modules + PBIP caches). |
| M-07 **[Win]** | Local admin? | `([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)` | `id` | **Expected: not admin.** That's fine: every required component has a per-user option. If the check finds a missing component that only has an admin installer (e.g. the data gateway, a machine-wide Node MSI), mark it "ask IT, or use the fallback" (conda Node; SharePoint mode instead of a gateway). |
| M-08 **[Win]** | Script execution policy | `Get-ExecutionPolicy -List` | n/a | The kit uses `.cmd` wrappers, so a restrictive policy is OK. Just record it. |

## 2. Network and proxies

| ID | Check | Command | Pass criteria / notes |
|---|---|---|---|
| N-01 | Proxy settings | **[Win]** `netsh winhttp show proxy`; env `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` | Record them. If a proxy is set, npm/conda/pip need it too (N-05). |
| N-02 | npm registry reachable | `npm ping` and `npm view @microsoft/powerbi-report-authoring-cli@0.5.0 version` | Prints `0.5.0`. If it fails → ask the owner for the internal npm mirror (`npm config set registry <url>`). |
| N-03 | conda-forge reachable | `conda search -c conda-forge duckdb --json` (just success or failure) | Success. On failure → the internal conda mirror (`conda config --add channels <url>`). |
| N-04 | PyPI reachable (fallback for pip) | `python -m pip download --no-deps --dest $env:TEMP\piptest jsonschema` (then delete the folder) | Optional. |
| N-05 | Package-manager proxy config | `npm config get proxy`, `npm config get https-proxy`, `npm config get registry`, `conda config --show proxy_servers channels`, `pip config list` | Consistent with N-01. |
| N-06 | VS Code Marketplace reachable | `curl.exe -sS -o NUL -w "%{http_code}" https://marketplace.visualstudio.com` | 200/302. |
| N-07 | Copilot service endpoints | `curl.exe -sS -o NUL -w "%{http_code}" https://api.githubcopilot.com` and `https://github.com/login` | **Copilot itself needs these for sign-in and model calls, even though the *agent* has no GitHub content access.** Any HTTP code means reachable (401/404 are fine); a timeout means blocked. Record "GitHub repo content blocked: expected". |
| N-08 | Power BI / Entra endpoints | `https://app.powerbi.com`, `https://api.powerbi.com`, `https://login.microsoftonline.com` | Reachable; needed for publishing and for Desktop sign-in. |
| N-09 | Microsoft schema/docs hosts (optional) | `https://developer.microsoft.com/json-schemas/`, `https://learn.microsoft.com` | Not required (everything is vendored). Record them for information. |
| N-10 | SharePoint tenant (when the owner has given a URL) | `curl.exe -sS -o NUL -w "%{http_code}" <site url>` | 200/302/403 all mean reachable (sign-in is required in the browser or Desktop). |

## 3. Software

| ID | Check | Command | Pass criteria |
|---|---|---|---|
| S-01 | winget | `winget --version` | Present (Windows). |
| S-02 | git | `git --version` | Any recent version. |
| S-03 | Node.js / npm | `node --version`, `npm --version`, `npm config get prefix` | Node ≥ 22, either on PATH or inside the `pbiagent` conda env once the owner has created it (`conda run -n pbiagent node --version`). Record the npm global prefix (S-12). |
| S-04 | conda | `conda --version`, `conda info --json` (record `platform`, `root_prefix`, `envs_dirs`) | Present. On Windows this must be the **Windows** conda if VS Code runs natively on Windows. |
| S-05 | Python (base) | `python --version` | Any; the kit uses its own env (3.11). |
| S-06 | VS Code | `code --version` | Present (for the VS Code host). |
| S-07 | VS Code extensions | `code --list-extensions --show-versions` | Look for `github.copilot`, `github.copilot-chat`, `analysis-services.tmdl`, `ms-python.python`, `redhat.vscode-yaml`, and optionally `analysis-services.powerbi-modeling-mcp` (note it to avoid a double MCP registration). |
| S-08 | Copilot CLI | `copilot --version` | Present (for the CLI host). |
| S-09 **[Win]** | Power BI Desktop (MSI) | `(Get-Item "$env:ProgramFiles\Microsoft Power BI Desktop\bin\PBIDesktop.exe").VersionInfo.FileVersion` | Found, or check S-10. |
| S-10 **[Win]** | Power BI Desktop (Store) | `Get-AppxPackage -Name *PowerBIDesktop* \| Select Name, Version` | One of S-09/S-10 is present; record the version (≥ the September 2026 release). |
| S-11 | Microsoft Power BI npm tools (already installed?) | `powerbi-report-author --version`, `powerbi-desktop --help` | Record present or absent (they're installed later in M0/M6). |
| S-12 | npm global install permission | `Test-Path -PathType Container (npm config get prefix)`, then try creating and deleting a temp file in that folder | Writable (with conda's Node the prefix is inside the env). If not → report it to the owner. Don't change the prefix yourself. |
| S-13 | Azure CLI | not needed | REST publishing is out of scope (no Fabric). Don't check or use it. |
| S-14 **[Win]** | On-premises data gateway (only relevant for local-mode production) | `Get-Service *gateway* -ErrorAction SilentlyContinue`; `Get-Process *gateway* -ErrorAction SilentlyContinue` | Record it. Not needed for development, or for SharePoint-mode production. |

## 4. Policies and settings

| ID | Check | Command | Pass criteria |
|---|---|---|---|
| P-01 **[Win]** | Desktop Bridge policy | `Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Power BI Desktop' -ErrorAction SilentlyContinue \| Select DesktopNamedPipeBridge` | Absent or 1. A 0 means the bridge is disabled: no reload or screenshots. |
| P-02 **[Win]** | Other Power BI Desktop policies | `Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Power BI Desktop' -ErrorAction SilentlyContinue` | Record every value (e.g. disabled preview features, blocked publishing). |
| P-03 | Copilot CLI allowed by org policy and signed in | `copilot -p "Reply with the single word OK" -s --no-ask-user` | The output contains `OK`. A policy or auth error → *owner-confirm*: ask the owner or their admin to enable Copilot CLI, or to sign in (`copilot` then `/login`, done by the owner). |
| P-04 | MCP servers allowed by Copilot policy | After M8 creates `.mcp.json`: run `copilot` interactively in the kit root, trust the folder, `/mcp` | `powerbi-modeling` is listed with tools. Otherwise → *owner-confirm* ("MCP servers in Copilot" policy). Before M8, record it as "pending". |
| P-05 | VS Code Copilot harness available | *owner-confirm*: in VS Code Chat, the Session Target control offers **Copilot** | Yes. |
| P-06 | Extension install permission | *(don't install during the check)* `code --list-extensions` works; record whether an org extension allowlist exists (`%APPDATA%\Code\User\settings.json` → `extensions.allowed`) | Record it. |

## 5. Accounts (mostly owner-confirm; the agent can't sign in for the owner)

| ID | Item | How the agent checks | Owner-confirm question if unknown |
|---|---|---|---|
| A-01 | GitHub Copilot subscription works | P-03 passes | "Do you have an active Copilot subscription on this machine's GitHub account?" |
| A-02 | Power BI license (Pro or PPU) | Can't be checked automatically. Owner-confirm. | "Is your Power BI license Pro or PPU?" |
| A-03 | Test workspace + role | Owner-confirm. It's a Pro/PPU workspace; no Fabric capacity is involved. | "Which workspace should the publish test use, and are you at least Contributor?" |
| A-04 | SharePoint / OneDrive for Business access for production data | N-10 reachability only | "Which SharePoint/OneDrive folder will hold the production spreadsheets? Can the account that will own the dataset open it?" |
| A-05 | Gateway rights (only for local-mode production) | S-14 + M-07 | "If production files stay on a local or network drive, can you install the on-premises data gateway (personal mode) on an always-on machine?" |

## 6. Report: `ENVIRONMENT-CHECK.md` (template)

```markdown
# Environment check — <computer name> — <date>
Run by: implementation agent. Kit path: <path>. Shell: <pwsh version>.

## Summary
- Blocking: <list or "none">
- Needs owner action: <list>
- Degraded features (fallbacks in use): <e.g. "no Desktop on this machine → Desktop checks deferred to owner's PC">

## Results
| ID | Check | Result (PASS/WARN/FAIL/N-A/PENDING) | Value | Action |
|----|-------|------|-------|--------|
| M-01 | OS | PASS | Windows 11 23H2 x64 | |
| ... | | | | |

## Owner questions (only unresolved items)
1. ...
```

## 7. What happens next
1. Show the owner the summary and the questions (one message).
2. **Don't install or configure anything.** For each missing item, give the owner the exact per-user command from `01-setup.md` §1–§4, or "ask IT" when none exists. Then wait for them to confirm.
   - **Don't start implementation** (anything after the check in M0) while a **required** item is missing, unless the owner explicitly accepts the listed fallback.
   - Optional items (bridge, MCP, Copilot CLI) can be deferred; record the deferral.
3. Re-run only the failed checks and update `ENVIRONMENT-CHECK.md`.
4. Feed the results into `pbi doctor`. Its checks overlap with these (§11 of `04-python-core.md`); in M1 the implementer can make `pbi doctor --full` run this same list from Python, using `subprocess` plus `winreg` on Windows, so the check can be repeated at any time.
