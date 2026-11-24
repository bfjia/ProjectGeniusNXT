<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Power BI Authoring MCP server

The Power BI Authoring MCP server gives an AI agent the tools to create and change Power BI semantic models. You describe the change you want in natural language, and the agent uses the server's tools to apply it: adding measures, renaming objects across the model, generating translations, or refactoring DAX.

One authoring server supports two deployment options:

-   **Hosted (preview):** a Microsoft-hosted endpoint. Nothing to install, and Microsoft manages updates.
-   **Local (generally available):** local binaries that you install in your environment. Runs on your machine over `stdio`, and you manage updates.

Both deployment options support semantic model authoring. Local deployment adds access to things on your machine, such as Power BI Desktop and [Power BI Project files](../projects/projects-overview), that a hosted service can't reach.

## What you can do with the Power BI Authoring MCP server

-   **Author models in natural language.** Create, update, and delete tables, columns, measures, relationships, hierarchies, calculation groups, perspectives, partitions, security roles, and more.
-   **Change hundreds of objects at once.** Bulk renames, bulk refactoring, model translations, and security rules that would otherwise take hours.
-   **Apply modeling best practices.** Evaluate a model against best practices and implement the fixes.
-   **Pair it with agent skills.** The server gives the agent the tools. [Agent skills](../agentic/power-bi-agentic-overview) give it the guidance on how to use them.
-   **Run agentic development workflows.** Work with [TMDL and Power BI Project files](../projects/projects-dataset#tmdl-format) so that an agent can plan and execute changes across your semantic model codebase, and so that those changes flow through your normal source control and review process.
-   **Write and validate DAX.** Execute DAX queries to test measures, troubleshoot calculations, and explore data as you build.

The server exposes tools grouped by object type, such as tables, columns, measures, and relationships. To see what's currently available, ask your agent: `Tell me with some examples what I can do with the Power BI Authoring MCP server`.

## Pair with Power BI agent skills

MCP server tools alone don't make an agent good at Power BI. The tools are the *what*. Agent skills are the *how*: modeling best practices, how to sequence a change, and what a well-built model or report looks like.

Pair this server with the `powerbi-authoring` agent plugin. The plugin installs skills for both semantic modeling and report building, and it bundles the local Power BI Authoring MCP server, so a single install gives you the tools and the guidance together.

For more information, see [Power BI agentic overview](../agentic/power-bi-agentic-overview).

## Choose hosted or local

Use the hosted server when your environment supports it. It's the recommended option because there's nothing to install and Microsoft manages updates.

Use the local server when you need to do any of the following:

-   Work against a model open in Power BI Desktop.
-   Work against Power BI Project (PBIP) or TMDL files on disk.
-   Use more flexible authentication methods, such as a service principal in a continuous integration (CI) pipeline.

The following table compares the two deployment setups.

| Capability                               | Hosted                                    | Local                                                                                                                                                                                                                                                                                                   |
|------------------------------------------|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Transport                                | Streamable HTTP                           | `stdio`                                                                                                                                                                                                                                                                                                 |
| Installation                             | None                                      | [VS Code extension](https://marketplace.visualstudio.com/items?itemName=analysis-services.powerbi-modeling-mcp), [npm package](https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp), or [standalone executable](https://github.com/microsoft/powerbi-modeling-mcp/blob/main/README.md#manual) |
| Updates                                  | Managed by Microsoft                      | You update the extension or package                                                                                                                                                                                                                                                                     |
| Authentication                           | Microsoft Entra ID, as the signed-in user | Microsoft Entra ID interactive sign-in, or service principal                                                                                                                                                                                                                                            |
| Semantic models in a Fabric workspace    | Yes                                       | Yes                                                                                                                                                                                                                                                                                                     |
| Semantic models open in Power BI Desktop | No                                        | Yes                                                                                                                                                                                                                                                                                                     |
| Power BI Project and TMDL files on disk  | No                                        | Yes                                                                                                                                                                                                                                                                                                     |
| Transactions                             | No                                        | Yes                                                                                                                                                                                                                                                                                                     |
| Analysis Services traces                 | No                                        | Yes                                                                                                                                                                                                                                                                                                     |
| MCP activity in Fabric audit logs        | Yes                                       | No                                                                                                                                                                                                                                                                                                      |

Important

Avoid registering both local and remote servers at the same time. The agent then sees two overlapping tool sets, which makes routing ambiguous and consumes extra tokens on every request. Pick one: the hosted server when you work against semantic models in Fabric workspaces, and the local server when you work against Power BI Desktop or Power BI Project files on your machine.

## Prerequisites

-   **Write or Build permission on the semantic model.** Write permission to create or change model objects. With only Build permission, the server can only run DAX queries against the model. For more information, see [Semantic model permissions](../../connect-data/service-datasets-permissions).
-   **An MCP client in agent mode**, such as [GitHub Copilot](https://code.visualstudio.com/docs/copilot/overview) in [VS Code](https://code.visualstudio.com/download).
-   **A deep-reasoning model.** Model choice has a large effect on result quality. For more information, see the [GitHub Copilot AI model comparison](https://docs.github.com/copilot/reference/ai-models/model-comparison).
-   For the local server, **XMLA endpoint set to Read Write** on the capacity, for semantic models in a Fabric workspace. For more information, see [Semantic model connectivity with the XMLA endpoint](/en-us/fabric/enterprise/powerbi/service-premium-connect-tools).
-   For the hosted server, your Fabric administrator must enable the tenant setting **Users can use the Power BI Model Context Protocol server endpoint**.

## Set up the hosted server

The hosted authoring server is available at:

``` lang-text
https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring
```

For manual configuration, add the following code to your MCP configuration file:

``` lang-json
{
    "servers": {
        "powerbi-authoring-remote": {
            "type": "http",
            "url": "https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring"
        }
    }
}
```

The first time the agent calls a tool, the server prompts you to sign in with your Microsoft Entra account. The server then acts with your permissions.

## Set up the local server

The local Power BI Authoring MCP server is available in two ways:

-   [Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=analysis-services.powerbi-modeling-mcp)
-   [@microsoft/powerbi-modeling-mcp](https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp) npm package

For manual configuration, add the following JSON to your MCP configuration file:

``` lang-json
{
    "servers": {
        "powerbi-authoring-local": {
            "type": "stdio",
            "command": "npx",
            "args": [
                "-y",
                "@microsoft/powerbi-modeling-mcp@latest",
                "--start"
            ]
        }
    }
}
```

For more information such as tool details, command-line options, environment variables, authentication setup, and troubleshooting, see the [powerbi-modeling-mcp repository on GitHub](https://github.com/microsoft/powerbi-modeling-mcp).

## Connect to a semantic model

Before the agent can change anything, you must tell it which semantic model to work on.

To connect to a semantic model in a Fabric workspace, name the model and its workspace:

``` lang-text
Connect to semantic model '[Semantic Model Name]' in Fabric workspace '[Workspace Name]'
```

The local server can also connect to a model open in Power BI Desktop or to Power BI Project files on disk:

``` lang-text
Connect to '[File Name]' in Power BI Desktop
```

``` lang-text
Open semantic model from PBIP folder '[Path to the definition folder in the PBIP]'
```

Once connected, confirm that everything works with a read-only question, for example `List the tables and measures in this model`. Then ask for the change you want in plain language.

## Example prompts

| Scenario                            | Prompt                                                                                                                                   |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Standardize naming                  | `Analyze the naming convention of the 'Sales' table and apply the same pattern across the entire model.`                                 |
| Document the model                  | `Add descriptions to all measures, columns, and tables that explain their purpose and the logic behind the DAX in plain business terms.` |
| Translate the model                 | `Generate a French translation for my model, including tables, columns, and measures.`                                                   |
| Refactor into calculation groups    | `Refactor measures 'Sales Amount 12M Avg' and 'Sales Amount 6M Avg' into a calculation group, and add 24M and 3M variants.`              |
| Create a Direct Lake semantic model | `Create a Direct Lake semantic model against lakehouse 'LH_CorpData' using tables 'Product', 'Sales', 'Store'`                           |

These examples show possible scenarios, not a fixed set. With the right prompt and context, the agent can handle most modeling tasks.

## Work safely when an agent edits your model

An agent writes to your model, and its changes might be irreversible. Take the same precautions you'd take before running any external tool against production.

-   **Back up the model before you start.** The underlying language model can produce unexpected results, which can lead to unintended changes.
-   **Work in PBIP files under Git.** [Power BI Project (PBIP)](../projects/projects-overview) files store your model as plain text, so Git tracks every change the agent makes. You get a diff to review before you commit, and a way to revert if the result isn't what you wanted.
-   **Be mindful of what you share with the LLM provider.** Model metadata and query results flow into the conversation, so they reach whichever large language model (LLM) provider your MCP client uses.

## Track MCP usage

Only the hosted Power BI Authoring MCP server logs these activities. Fabric administrators can use them to track hosted MCP usage across the tenant. The local server doesn't log these activities.

| Activity               | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `ModifiedByPowerBIMCP` | Tracks changes made through the Power BI Authoring MCP server.              |
| `ReadByPowerBIMCP`     | Tracks read operations performed through the Power BI Authoring MCP server. |

Use these activity names to identify MCP operations in audit logs. For more information, see [Fabric operation list](/en-us/fabric/admin/operation-list).

## Considerations and limitations

-   The MCP server performs modeling operations only. It can't change other Power BI metadata, such as report pages or semantic model diagram layouts.
-   DAX query execution tools have a hard limit of 100,000 rows.
-   It follows the same rules and behaviors as modeling operations that external tools perform. For more information, see [Data modeling operations](../../transform-model/desktop-external-tools#data-modeling-operations).
-   No tenant setting blocks you from using the local server. It connects to semantic models through the [XMLA endpoint](/en-us/fabric/enterprise/powerbi/service-premium-connect-tools), so blocking it means disabling the XMLA endpoint, which also blocks every other tool that relies on XMLA connectivity.
-   The local server doesn't support macOS. On a Mac, use the hosted server.
-   The hosted server doesn't support transactions or trace tools.
-   The hosted server is stateful. It keeps your connection to the semantic model in a session, so your MCP client must return the `mcp-Session-Id` header it receives at initialization on every subsequent request. If the client opens a new session on each tool call instead, the client loses the session state, and the agent has to reconnect to the model before every operation.
-   The hosted server requires Microsoft Entra ID OAuth authentication. Some MCP clients depend on dynamic OAuth client registration, which Microsoft Entra ID doesn't support, so they can't connect to it. Use the local server with those clients, or register a Microsoft Entra app yourself. For more information, see [Register the hosted Power BI MCP servers with external MCP clients](remote-mcp-server-external-clients).

## Troubleshooting

| Symptom                                                          | What to check                                                                                                                                                                                                                                                                                                                                      |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The server doesn't appear in your MCP client's tool list.        | Confirm the client is in agent mode and that the server is registered and started. In GitHub Copilot, check that the **MCP servers in Copilot** option is enabled in your settings on GitHub.com. Enterprise accounts have it turned off by default, and an administrator has to enable it.                                                        |
| Sign-in to the hosted server fails.                              | Confirm your Fabric administrator enabled the tenant setting **Users can use the Power BI Model Context Protocol server endpoint**. If your MCP client relies on dynamic OAuth client registration, it can't sign in to the hosted server. Use the local server, or [register a Microsoft Entra app yourself](remote-mcp-server-external-clients). |
| The agent can read the model, but every change fails.            | You likely have Build permission but not Write. For semantic models in a Fabric workspace, also confirm the XMLA endpoint is set to Read Write on the capacity.                                                                                                                                                                                    |
| The agent reconnects to the model before every operation.        | Your client isn't returning the `mcp-Session-Id` header, so the hosted server starts a new session on each call. Use a client that keeps the session, or switch to the local server.                                                                                                                                                               |
| The agent can't find your Power BI Desktop file or PBIP folder.  | The hosted server can't reach your machine. Use the local server for Power BI Desktop and for Power BI Project files on disk.                                                                                                                                                                                                                      |
| The agent makes wrong changes, or stalls partway through a task. | Switch to a deep-reasoning model, break the request into smaller steps, and give the agent more context.                                                                                                                                                                                                                                           |

For local server issues, including startup failures and authentication setup, see the [troubleshooting guide](https://github.com/microsoft/powerbi-modeling-mcp/blob/main/TROUBLESHOOTING.md) in the repository.

## Related content

-   [MCP servers for Power BI](mcp-servers-overview)
-   [Power BI agentic overview](../agentic/power-bi-agentic-overview)
-   [Power BI Semantic Model Authoring skill](../agentic/semantic-model-authoring-skill-overview)
-   [Power BI Authoring MCP server repository on GitHub](https://github.com/microsoft/powerbi-modeling-mcp)
-   [Power BI Project (PBIP) semantic model folder](../projects/projects-dataset)
-   [Model Context Protocol specification](https://modelcontextprotocol.io/specification/latest)

------------------------------------------------------------------------
