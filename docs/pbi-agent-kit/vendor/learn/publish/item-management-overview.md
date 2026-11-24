<!-- Source: https://learn.microsoft.com/en-us/rest/api/fabric/articles/item-management/item-management-overview (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Item management overview

## What is a Fabric item?

An item is a set of capabilities within an experience, for example: Data Engineering and Data Science. Users can create, edit, and delete items. Each item type provides different capabilities. For example, the Data Engineering experience includes the lakehouse, notebook, and Spark job definition items.

## Fabric item CRUD APIs

You can use Fabric item CRUD APIs to manage your Fabric.

-   Create item: Create item with empty definition, create an item with [definition](definitions/item-definition-overview), or create an item with a [payload](payloads/item-payload-overview). You can't use both definition and payload in the same request.
-   Get item: Get properties of the item.
-   Delete item: Delete an item.
-   Update item: Update properties of the item.
-   List items: Retrieve a list of the items in the workspace.
-   Get item definition: Get the definition of the item, which can be used for item creation and updating definition later on.
-   Update item definition: Update the item definition (for example change visual name in a report).

The following section provides information about supported and unsupported item types.

Note

The following item types are not supported for any API:

-   Scorecard
-   Dataflow

Note

Reflex is also known as Activator.

## Item types API support

This section lists items that can be used without a definition for the following operations:

-   Create
-   Delete
-   Get
-   Update

The items are grouped by experience.

### Data Factory

| Item type          | Create (without definition) | Create with payload/definition | Service principal support | Get | Update | Delete | List |
|--------------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| DataPipeline       | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| MountedDataFactory | ❌                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| CopyJob            | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| DataBuildToolJob   | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |

### Data Engineering

| Item type              | Create (without definition) | Create with payload/definition | Service principal support | Get | Update | Delete | List |
|------------------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| AzureDatabricksStorage | ✅                          | ✅ definition only             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Environment            | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| GraphQLApi             | ✅                          | ✅ definition only             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Lakehouse              | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Notebook               | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| SnowflakeDatabase      | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| SparkJobDefinition     | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |

### Data Science

| Item type    | Create (without definition) | Create with payload/definition | Service principal support | Get | Update | Delete | List |
|--------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| MLModel      | ✅                          | ❌                             | ❌                        | ✅  | ✅     | ✅     | ✅   |
| MLExperiment | ✅                          | ❌                             | ❌                        | ✅  | ✅     | ✅     | ✅   |

### Data Warehouse

| Item type                      | Create (without definition) | Create with payload/definition | Service principal support | Get | Update | Delete | List |
|--------------------------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| Datamart                       | ❌                          | ❌                             | ❌                        | ❌  | ❌     | ❌     | ✅   |
| MirroredAzureDatabricksCatalog | ✅                          | ✅                             | ❌                        | ✅  | ✅     | ✅     | ✅   |
| MirroredCatalog                | ❌                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| MirroredDatabase               | ❌                          | ✅                             | ❌                        | ✅  | ✅     | ✅     | ✅   |
| MirroredWarehouse              | ❌                          | ❌                             | ❌                        | ❌  | ❌     | ❌     | ✅   |
| SQLEndpoint                    | ❌                          | ❌                             | ❌                        | ❌  | ❌     | ❌     | ✅   |
| Warehouse                      | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |

### Fabric IQ

| Item type | Create (without definition) | Create with payload/definition | Service principal support | Get | Update | Delete | List |
|-----------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| Ontology  | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |

### Power BI

| Item type       | Create (without definition) | Create with payload/definition | Service Principal support | Get | Update | Delete | List |
|-----------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| Dashboard       | ❌                          | ❌                             | ❌                        | ❌  | ❌     | ❌     | ✅   |
| Dataflow        | ✅                          | ✅ definition only             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| OrgApp          | ❌                          | ✅ definition only             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| OrgAppAudience  | ❌                          | ✅ definition only             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| PaginatedReport | ❌                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Report          | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| SemanticModel   | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |

### Real-Time Intelligence

| Item type                 | Create (without definition) | Create with payload/definition | Service Principal support | Get | Update | Delete | List |
|---------------------------|-----------------------------|--------------------------------|---------------------------|-----|--------|--------|------|
| Digital twin builder      | ✅                          | ✅                             | ❌                        | ✅  | ✅     | ✅     | ✅   |
| Digital twin builder flow | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Eventhouse                | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Eventstream               | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| GraphQuerySet             | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| KQLDatabase               | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| KQLQueryset               | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| KQLDashboard              | ✅                          | ✅                             | ✅                        | ✅  | ✅     | ✅     | ✅   |
| Reflex                    | ✅                          | ✅                             | ❌                        | ✅  | ✅     | ✅     | ✅   |

## Related content

-   [Item definition overview](definitions/item-definition-overview)
-   [Paginated Report definition](definitions/paginatedreport-definition)
-   [PolicySet definition](definitions/policyset-definition)
-   [Item payload overview](payloads/item-payload-overview)

------------------------------------------------------------------------
