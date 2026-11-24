# ✨ Power BI Authoring MCP Server NPM Package

This is a JavaScript wrapper that downloads the  **Power BI Authoring MCP server**, which lets an AI agent create and change Power BI semantic models through a **local MCP server**. This allows developers and AI applications to interact with Power BI models in entirely new ways, from using natural language to execute modeling changes to autonomous AI agentic development workflows.

## 💡 What can you do?

- **🔄 Build and Modify Semantic Models with Natural Language** - Tell your AI assistant what you need, and it uses this MCP server to create, update, and manage tables, columns, measures, relationships, and more... across Power BI Desktop and Fabric semantic models.

- **⚡ Bulk Operations at Scale** - AI applications can execute batch modeling operations on hundreds of objects simultaneously — bulk renaming, bulk refactoring, model translations, or model security rules - with transaction support and error handling, turning hours of repetitive work into seconds.

- **✅ Apply modeling best practices** - Easily evaluate and implement modeling best practices against your model.

- **🤖 Agentic Development Workflows** - Supports working with [TMDL and Power BI Project files](https://learn.microsoft.com/power-bi/developer/projects/projects-dataset#tmdl-format), enabling AI agents to autonomously plan, create, and execute complex modeling tasks across your semantic model codebase.

- **🔍 Query and Validate DAX** - AI assistants can execute and validate DAX queries against your model, helping you test measures, troubleshoot calculations, and explore your data

📹 Watch the video for an [end-to-end demo](https://aka.ms/power-modeling-mcp-demo).

More details on how to use and configure this MCP are available in the GitHub repository: [powerbi-modeling-mcp](https://aka.ms/powerbi-modeling-mcp).

## 📋 Prerequisites

Before getting started, ensure you have **Node.js** (which includes NPM and NPX) installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)

You can verify your installation by running:

```bash
node --version
npm --version
```

## 📦 Installation

Configure the `mcp.json` file with the following:

```json
{
    "mcpServers": {
        "powerbi-authoring-local": {
			"type": "local",
			"command": "npx",
			"args": [
				"-y",
				"@microsoft/powerbi-modeling-mcp",
				"--start"
			]
        }
    }
}
```

**Note:** When manually configuring Visual Studio and Visual Studio Code, use `servers` instead of `mcpServers` as the root object.

## License

Before use, you must accept the Power BI Authoring MCP End User License Agreement at **<https://go.microsoft.com/fwlink/?LinkId=2381247>**. To accept:

1. **Command line**: pass `--accept-eula` (or the alias `--accepteula`, case-insensitive) when
   starting the server. This grants acceptance for
   the current process only and does **not** persist anything to disk.
2. **Environment variable**: set `PBI_MODELING_MCP_ACCEPT_EULA=true`. This grants acceptance for
   the current process only and does **not** persist anything to disk.
3. **The `accept_eula` MCP tool**: an MCP client can call `accept_eula` with the required
   `eulaUrl` argument set. This also persists acceptance.

## 🚀 Get started

**First, you must connect to a Power BI semantic model**, which can reside in Power BI Desktop, Fabric workspace or in Power BI Project (PBIP) files.

- **For Power BI Desktop:** 

	```
	Connect to '[File Name]' in Power BI Desktop
	```

- **For Semantic Model in Fabric Workspace:**

	```
	Connect to semantic model '[Semantic Model Name]' in Fabric Workspace '[Workspace Name]'
	```
  
- **For Power BI Project files:**

	```
	Open semantic model from PBIP folder '[Path to the definition/ TMDL folder in the PBIP]'
	```

Once the connection is established, you can use natural language to ask the AI agent to make any authoring changes. To get started, try one of the following scenarios.

## Local Audit Logs

The local MCP writes audit events to daily newline-delimited JSON
files. On Windows, the default directory is
`%LOCALAPPDATA%\Microsoft\powerbi-authoring-mcp\Logs`. These files contain audit
metadata and do not include general console or diagnostic logs. Tenant, user,
and network request fields are omitted.

Use `PBI_MODELING_MCP_AUDIT_LOG_PATH` or
`--audit-log-path=<directory>` to override the directory. Command-line
configuration takes precedence. Audit logs are retained for seven days. After
seven days, files matching the audit filename format are removed during
startup. Apply appropriate file protection to the directory.

## 💬 Feedback and Support

- Check the [Troubleshooting guide](https://github.com/microsoft/powerbi-modeling-mcp/blob/main/TROUBLESHOOTING.md) to diagnose and resolve common issues.
- We're building this in the open. Your feedback is much appreciated, and will help us shape the future of the Power BI Authoring MCP server.
    - 👉 [Open an issue](https://github.com/microsoft/powerbi-modeling-mcp/issues) in the public GitHub repository - we’d love to hear from you!

## Security

Your credentials are always handled securely through the official [Azure Identity SDK](https://github.com/Azure/azure-sdk-for-net/blob/main/sdk/identity/Azure.Identity/README.md) - **we never store or manage tokens directly**.

### Custom XMLA endpoints

Organizations that need to connect the local MCP server to custom Analysis Services or Power BI XMLA endpoints can allowlist those endpoint hosts. This configuration is intended for users or administrators who control the MCP server configuration and have verified that the endpoints are trusted by their organization.

By default, outbound Analysis Services connections are limited to localhost and the configured Fabric host. To allow additional endpoint hosts, set a comma-separated list before starting the server:

```powershell
$env:PBI_MODELING_MCP_ALLOWED_CONNECTION_HOSTS = "server1.contoso.com,server2.contoso.com"
```

Access tokens will be passed to the hosts configured in `PBI_MODELING_MCP_ALLOWED_CONNECTION_HOSTS`. Users should therefore be cautious when adding hosts and only include hosts that their organization trusts and intends to use as Analysis Services or Power BI XMLA endpoints.

MCP as a phenomenon is very novel and cutting-edge. As with all new technology standards, consider doing a security review to ensure any systems that integrate with MCP servers follow all regulations and standards your system is expected to adhere to. This includes not only the Power BI Authoring MCP Server, but any MCP client/agent that you choose to implement down to the model provider.

You should follow Microsoft security guidance for MCP servers, including enabling Entra ID authentication, secure token management, and network isolation. Refer to [Microsoft Security Documentation](https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers) for details.

## Permissions and Risk

MCP clients can invoke operations based on the user’s Fabric RBAC permissions. Autonomous or misconfigured clients may perform destructive actions. You should review and apply least-privilege RBAC roles and implement safeguards before deployment. Certain safeguards, such as flags to prevent destructive operations, are not standardized in the MCP specification and may not be supported by all clients.

## Data Collection

The software may collect information about you and your use of the software and send it to Microsoft. Microsoft may use this information to provide services and improve our products and services. There are also some features in the software that may enable you and Microsoft to collect data from users of your applications. If you use these features, you must comply with applicable law, including providing appropriate notices to users of your applications together with a copy of Microsoft's [privacy statement](https://www.microsoft.com/privacy/privacystatement). You can learn more about data collection and use in the help documentation and our privacy statement. Your use of the software operates as your consent to these practices.

## Compliance Responsibility

This MCP server may be installed, used and share data with third party clients and services, such as third party LLMs that operate outside Microsoft compliance boundaries. You are responsible for ensuring that any integration complies with applicable organizational, regulatory, and contractual requirements.

## Third Party Components

This MCP server may use or depend on third party components. You are responsible for reviewing and complying with the licenses and security posture of any third-party components.

## Export Control

Use of this software must comply with all applicable export laws and regulations, including U.S. Export Administration Regulations and local jurisdiction requirements.

## No Warranty / Limitation of Liability

This software is provided “as is” without warranties or conditions of any kind, either express or implied. Microsoft shall not be liable for any damages arising from use, misuse, or misconfiguration of this software.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [open@microsoft.com](mailto:open@microsoft.com) with any additional questions or comments.
