<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Power BI MCP servers overview

The Power BI MCP servers are Model Context Protocol (MCP) servers that AI agents use to discover and call tools to author and query Power BI semantic models and reports. MCP is an open standard that defines how a server exposes tools for AI agents to use.

Two MCP servers apply to Power BI. One creates and changes semantic models and is available as a hosted endpoint and as a local server. The other answers natural language questions against Power BI semantic models and reports. An earlier Power BI query endpoint also remains available for existing integrations.

This article compares the servers and links to their setup guidance so that you can choose the right one for your scenario.

## Power BI MCP server options

Start with what you want the agent to do.

| You want to                                                                                                                          | Use                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| Create or change model objects such as tables, columns, measures, relationships, calculation groups, translations, or security roles | [Power BI Authoring MCP server](power-bi-authoring-mcp)              |
| Apply modeling best practices, refactor DAX, or generate documentation for an existing model                                         | [Power BI Authoring MCP server](power-bi-authoring-mcp)              |
| Work against Power BI Desktop, or against TMDL in Power BI Project (PBIP) files under source control                                 | [Power BI Authoring MCP server](power-bi-authoring-mcp), local setup |
| Answer business questions over governed Power BI data in natural language                                                            | [Fabric IQ](/en-us/fabric/iq/connectors/fabric-iq-mcp)               |
| Ground a custom agent, a Copilot Studio agent, or Microsoft 365 Copilot in Power BI data                                             | [Fabric IQ](/en-us/fabric/iq/connectors/fabric-iq-mcp)               |

The two servers complement each other. A common pattern is to use the authoring server to build and document a model, then use Fabric IQ so that everyone else can ask questions of it.

An earlier Power BI consumption MCP is still documented for existing integrations. If you still use this server, see [Power BI Consumption MCP server](remote-mcp-server-get-started).

Important

Don't use the Power BI Authoring MCP server for consumption scenarios. It can run DAX so that you can validate the model you're building, but it isn't designed to answer business questions for end users. For consumption, use Fabric IQ.

## Power BI Authoring MCP server

An AI agent can use the Power BI Authoring MCP server to read and write Power BI semantic models.

With it, an agent can:

-   Create, update, and delete tables, columns, measures, relationships, hierarchies, calculation groups, perspectives, and security roles.
-   Run bulk operations across hundreds of objects, such as renames, refactors, and translations.
-   Evaluate a model against modeling best practices and apply the fixes.
-   Run and validate DAX queries while you build.
-   Work with TMDL and Power BI Project (PBIP) files, so changes flow through your normal source control and review process.

It's a single server with two deployment options:

-   **Hosted (preview):** a Microsoft-hosted endpoint at `https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring`. Nothing to install, and Microsoft manages updates.
-   **Local (generally available):** a server that runs on your machine over `stdio`. Use it for Power BI Desktop, local Power BI Project files, service principal authentication, transactions, and traces.

Both options support semantic model authoring in Fabric workspaces. Local adds Power BI Desktop, Power BI Project files on disk, service principal authentication, transactions, and traces.

For more information, see [Power BI Authoring MCP server](power-bi-authoring-mcp).

## Fabric IQ

Fabric IQ is the consumption layer for Power BI data. It answers natural language questions grounded in your semantic models and ontologies, and it respects the permissions, row-level security, and object-level security already defined on those models.

Use Fabric IQ when the agent consumes data rather than creates it. It's the supported path for data answers in Microsoft 365 Copilot, Copilot Studio, Microsoft Foundry, and custom agents.

The Fabric IQ MCP endpoint is:

    https://fabriciq.svc.cloud.microsoft/v1/mcp/FabricIQ

For more information, see [What is Fabric IQ MCP?](/en-us/fabric/iq/connectors/fabric-iq-mcp).

## About the Model Context Protocol

MCP defines how AI assistants interact with external tools and data sources in a structured, secure way. It has three roles:

-   **Host:** the application that runs an MCP client, for example Visual Studio Code (VS Code).
-   **Client:** the component inside the host that connects to MCP servers and uses their capabilities, for example GitHub Copilot.
-   **Server:** a local or remote program that exposes tools, resources, and prompts to clients.

When you use GitHub Copilot in VS Code with a Power BI MCP server, VS Code is the host, Copilot is the client, and Power BI provides the server.

For more information, see the [Model Context Protocol specification](https://modelcontextprotocol.io/specification/latest).

## Considerations

### Security

MCP is a new standard. As with any new standard, consider a security review to confirm that the systems integrating with MCP servers meet the regulations and standards that apply to you. That review should cover the Power BI MCP servers, the MCP client or agent you choose, and the model provider behind it.

Follow Microsoft security guidance for MCP servers, including Microsoft Entra ID authentication, secure token management, and network isolation. For more information, see [Secure MCP servers](/en-us/azure/api-management/secure-mcp-servers).

### Permissions and risk

MCP clients invoke operations with the signed-in user's [Fabric role-based access control (RBAC) permissions](/en-us/fabric/fundamentals/roles-workspaces). An autonomous or misconfigured client might perform destructive actions. Review and apply least-privilege roles, and put safeguards in place before you deploy. Some safeguards, such as flags that block destructive operations, aren't standardized in the MCP specification, and not every client supports them.

### Data handling

An MCP server doesn't expand data access, but it does move data. Metadata, schemas, and query results go to the MCP client, and the client might forward them to the configured large language model (LLM) provider as conversation context. Govern this data movement through your organization's AI data-handling policies and the provider's terms, not through Power BI security controls alone.

### Compliance responsibility

These MCP servers might interact with clients and services that process data outside the compliance boundaries of Microsoft Fabric, under the terms and data handling policies of the client or service you choose. You're responsible for making sure that any integration meets your organizational, regulatory, and contractual requirements.

## Related content

-   [What is Fabric IQ?](/en-us/fabric/iq/overview)
-   [Model Context Protocol specification](https://modelcontextprotocol.io/specification/latest)

------------------------------------------------------------------------
