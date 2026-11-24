<!-- Source: https://learn.microsoft.com/en-us/rest/api/fabric/semanticmodel/items/create-semantic-model (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Items - Create Semantic Model

Service:  
SemanticModel

&nbsp;

API Version:  
v1

Creates a semantic model in the specified workspace.  
This API supports [long running operations (LRO)](/en-us/rest/api/fabric/articles/long-running-operation).

The API supports three creation modes: (1) provide a `definition` for full control over the model structure, (2) provide a `creationPayload` with OneLake table URLs to create a DirectLake model, or (3) omit both to create an empty semantic model. Use `definition` or `creationPayload`. You can't use both at the same time.

## Permissions

The caller must have a *contributor* workspace role. When creating a DirectLake model with a `creationPayload` that references OneLake tables, the caller must also have access to each referenced source Lakehouse or data item, including when those sources reside in a different workspace (cross-workspace sources).

## Required Delegated Scopes

SemanticModel.ReadWrite.All or Item.ReadWrite.All

## Limitations

-   To create a semantic model, the user must have the appropriate license. For more information see: [Microsoft Fabric license types](/en-us/fabric/enterprise/licenses#microsoft-fabric-license-types).

## Microsoft Entra supported identities

This API supports the Microsoft [identities](/en-us/rest/api/fabric/articles/identity-support) listed in this section.

| Identity                                                                                                                                                                                                    | Support |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| User                                                                                                                                                                                                        | Yes     |
| [Service principal](/en-us/entra/identity-platform/app-objects-and-service-principals#service-principal-object) and [Managed identities](/en-us/entra/identity/managed-identities-azure-resources/overview) | Yes     |

## Interface

```
POST https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/semanticModels
```

## URI Parameters

[TABLE]

## Request Body

|                          |          |                                                               |                                                                                                                                                                                                                                                                                                       |
|--------------------------|----------|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                     | Required | Type                                                          | Description                                                                                                                                                                                                                                                                                           |
| displayName              | True     | string                                                        | The semantic model display name. The display name must follow naming rules according to item type.                                                                                                                                                                                                    |
| creationPayload          |          | [SemanticModelCreationPayload](#semanticmodelcreationpayload) | The creation payload for creating a semantic model without a full definition. Provide OneLake table URLs to create a DirectLake model, or omit both `definition` and `creationPayload` to create an empty semantic model. Use `definition` or `creationPayload`. You can't use both at the same time. |
| definition               |          | [SemanticModelDefinition](#semanticmodeldefinition)           | The semantic model public definition. Use `definition` or `creationPayload`. You can't use both at the same time.                                                                                                                                                                                     |
| description              |          | string                                                        | The semantic model description. Maximum length is 256 characters.                                                                                                                                                                                                                                     |
| folderId                 |          | string (uuid)                                                 | The folder ID. If not specified or null, the semantic model is created with the workspace as its folder.                                                                                                                                                                                              |
| sensitivityLabelSettings |          | [SensitivityLabelSettings](#sensitivitylabelsettings)         | The sensitivity label settings for the semantic model.                                                                                                                                                                                                                                                |

## Responses

[TABLE]

## Examples

|                                                                                                             |
|-------------------------------------------------------------------------------------------------------------|
| [Create a semantic model example](#create-a-semantic-model-example)                                         |
| [Create a semantic model with OneLake tables example](#create-a-semantic-model-with-onelake-tables-example) |
| [Create an empty semantic model example](#create-an-empty-semantic-model-example)                           |

### Create a semantic model example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/semanticModels

{
  "displayName": "SemanticModel 1",
  "description": "A semantic model description.",
  "definition": {
    "parts": [
      {
        "path": "model.bim",
        "payload": "ew0KICAiY29tcGF0a..GVzIjogWyBdDQogIH0NCn0=",
        "payloadType": "InlineBase64"
      },
      {
        "path": "definition.pbism",
        "payload": "ewogICJ2ZXJzaW9uI..NldHRpbmdzIjoge30KfQ==",
        "payloadType": "InlineBase64"
      },
      {
        "path": ".platform",
        "payload": "ZG90UGxhdGZvcm1CYXNlNjRTdHJpbmc=",
        "payloadType": "InlineBase64"
      }
    ]
  }
}
```

#### Sample response

Status code:  
201

``` lang-json
{
  "displayName": "SemanticModel 1",
  "description": "A semantic model description.",
  "type": "SemanticModel",
  "workspaceId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
  "id": "5b218778-e7a5-4d73-8187-f10824047715",
  "sensitivityLabel": {
    "id": "b7b4f4d9-3f0d-4b3e-8f3d-4f6d3f4f3f4f"
  }
}
```

Status code:  
202

``` wrap
Location: https://api.fabric.microsoft.com/v1/operations/0acd697c-1550-43cd-b998-91bfbfbd47c6
x-ms-operation-id: 0acd697c-1550-43cd-b998-91bfbfbd47c6
Retry-After: 30
```

### Create a semantic model with OneLake tables example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/semanticModels

{
  "displayName": "Sales Analytics Model",
  "description": "A semantic model connected to lakehouse tables.",
  "creationPayload": {
    "oneLakeTables": [
      "https://onelake.dfs.fabric.microsoft.com/aaaa0000-bb11-2222-33cc-444444dddddd/cccc0000-dd11-2222-33ee-444444ffffff/Tables/dim_customer",
      "https://onelake.dfs.fabric.microsoft.com/aaaa0000-bb11-2222-33cc-444444dddddd/cccc0000-dd11-2222-33ee-444444ffffff/Tables/sales/dim_product",
      "https://onelake.dfs.fabric.microsoft.com/1111aaaa-bb22-3333-44cc-555555eeeeee/2222bbbb-cc33-4444-55dd-666666ffffff/Tables/dim_region"
    ]
  }
}
```

#### Sample response

Status code:  
201

``` lang-json
{
  "displayName": "Sales Analytics Model",
  "description": "A semantic model connected to lakehouse tables.",
  "type": "SemanticModel",
  "workspaceId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
  "id": "5b218778-e7a5-4d73-8187-f10824047715"
}
```

Status code:  
202

``` wrap
Location: https://api.fabric.microsoft.com/v1/operations/0acd697c-1550-43cd-b998-91bfbfbd47c6
x-ms-operation-id: 0acd697c-1550-43cd-b998-91bfbfbd47c6
Retry-After: 30
```

### Create an empty semantic model example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/semanticModels

{
  "displayName": "SemanticModel 1",
  "description": "An empty semantic model."
}
```

#### Sample response

Status code:  
201

``` lang-json
{
  "displayName": "SemanticModel 1",
  "description": "An empty semantic model.",
  "type": "SemanticModel",
  "workspaceId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
  "id": "5b218778-e7a5-4d73-8187-f10824047715"
}
```

Status code:  
202

``` wrap
Location: https://api.fabric.microsoft.com/v1/operations/0acd697c-1550-43cd-b998-91bfbfbd47c6
x-ms-operation-id: 0acd697c-1550-43cd-b998-91bfbfbd47c6
Retry-After: 30
```

## Definitions

|                                                                       |                                                                                                                                                                                                                             |
|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                                                                  | Description                                                                                                                                                                                                                 |
| [CreateSemanticModelRequest](#createsemanticmodelrequest)             | Create semantic model request payload.                                                                                                                                                                                      |
| [EntireTenantPrincipal](#entiretenantprincipal)                       | Represents a tenant principal                                                                                                                                                                                               |
| [ErrorParameter](#errorparameter)                                     | A structured parameter providing additional machine-readable context about an error.                                                                                                                                        |
| [ErrorRelatedResource](#errorrelatedresource)                         | The error related resource details object.                                                                                                                                                                                  |
| [ErrorResponse](#errorresponse)                                       | The error response.                                                                                                                                                                                                         |
| [ErrorResponseDetails](#errorresponsedetails)                         | The error response details.                                                                                                                                                                                                 |
| [GroupDetails](#groupdetails)                                         | Group specific details. Applicable when the principal type is `Group`.                                                                                                                                                      |
| [GroupPrincipal](#groupprincipal)                                     | Represents a security group.                                                                                                                                                                                                |
| [GroupType](#grouptype)                                               | The type of the group. Additional group types may be added over time.                                                                                                                                                       |
| [ItemTag](#itemtag)                                                   | Represents a tag applied on an item.                                                                                                                                                                                        |
| [ItemType](#itemtype)                                                 | The type of the item. Additional item types may be added over time.                                                                                                                                                         |
| [PayloadType](#payloadtype)                                           | The type of the definition part payload. Additional payload types may be added over time.                                                                                                                                   |
| [PrincipalType](#principaltype)                                       | The type of the principal. Additional principal types may be added over time.                                                                                                                                               |
| [SemanticModel](#semanticmodel)                                       | A semantic model object.                                                                                                                                                                                                    |
| [SemanticModelCreationPayload](#semanticmodelcreationpayload)         | Creation payload for creating a semantic model without a definition.                                                                                                                                                        |
| [SemanticModelDefinition](#semanticmodeldefinition)                   | Semantic model public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/semantic-model-definition) for more details on the structure of the Semantic model definition. |
| [SemanticModelDefinitionPart](#semanticmodeldefinitionpart)           | Semantic model definition part object.                                                                                                                                                                                      |
| [SensitivityLabel](#sensitivitylabel)                                 | Represents a sensitivity label applied to an item.                                                                                                                                                                          |
| [SensitivityLabelApplyStrategy](#sensitivitylabelapplystrategy)       | The strategy for applying the sensitivity label. The default value is ApplyOrFail. Additional types may be added over time.                                                                                                 |
| [SensitivityLabelSettings](#sensitivitylabelsettings)                 | The sensitivity label settings.                                                                                                                                                                                             |
| [ServicePrincipalDetails](#serviceprincipaldetails)                   | Service principal specific details. Applicable when the principal type is `ServicePrincipal`.                                                                                                                               |
| [ServicePrincipalPrincipal](#serviceprincipalprincipal)               | Represents a Microsoft Entra service principal.                                                                                                                                                                             |
| [ServicePrincipalProfileDetails](#serviceprincipalprofiledetails)     | Service principal profile details. Applicable when the principal type is `ServicePrincipalProfile`.                                                                                                                         |
| [ServicePrincipalProfilePrincipal](#serviceprincipalprofileprincipal) | Represents a service principal profile.                                                                                                                                                                                     |
| [UserDetails](#userdetails)                                           | User principal specific details. Applicable when the principal type is `User`.                                                                                                                                              |
| [UserPrincipal](#userprincipal)                                       | Represents a Microsoft Entra user principal.                                                                                                                                                                                |

### CreateSemanticModelRequest

Object

Create semantic model request payload.

|                          |                                                               |                                                                                                                                                                                                                                                                                                       |
|--------------------------|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                     | Type                                                          | Description                                                                                                                                                                                                                                                                                           |
| creationPayload          | [SemanticModelCreationPayload](#semanticmodelcreationpayload) | The creation payload for creating a semantic model without a full definition. Provide OneLake table URLs to create a DirectLake model, or omit both `definition` and `creationPayload` to create an empty semantic model. Use `definition` or `creationPayload`. You can't use both at the same time. |
| definition               | [SemanticModelDefinition](#semanticmodeldefinition)           | The semantic model public definition. Use `definition` or `creationPayload`. You can't use both at the same time.                                                                                                                                                                                     |
| description              | string                                                        | The semantic model description. Maximum length is 256 characters.                                                                                                                                                                                                                                     |
| displayName              | string                                                        | The semantic model display name. The display name must follow naming rules according to item type.                                                                                                                                                                                                    |
| folderId                 | string (uuid)                                                 | The folder ID. If not specified or null, the semantic model is created with the workspace as its folder.                                                                                                                                                                                              |
| sensitivityLabelSettings | [SensitivityLabelSettings](#sensitivitylabelsettings)         | The sensitivity label settings for the semantic model.                                                                                                                                                                                                                                                |

### EntireTenantPrincipal

Object

Represents a tenant principal

[TABLE]

### ErrorParameter

Object

A structured parameter providing additional machine-readable context about an error.

|         |        |                                                          |
|---------|--------|----------------------------------------------------------|
| Name    | Type   | Description                                              |
| message | string | A human-readable description of the parameter's meaning. |
| name    | string | The parameter identifier.                                |
| value   | string | The parameter value.                                     |

### ErrorRelatedResource

Object

The error related resource details object.

|              |        |                                                        |
|--------------|--------|--------------------------------------------------------|
| Name         | Type   | Description                                            |
| resourceId   | string | The resource ID that's involved in the error.          |
| resourceType | string | The type of the resource that's involved in the error. |

### ErrorResponse

Object

The error response.

|                 |                                                   |                                                                                                                                                      |
|-----------------|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name            | Type                                              | Description                                                                                                                                          |
| errorCode       | string                                            | A specific identifier that provides information about an error condition, allowing for standardized communication between our service and its users. |
| isRetriable     | boolean                                           | When true, the request can be retried. Use the `Retry-After` response header to determine the delay, if available.                                   |
| message         | string                                            | A human readable representation of the error.                                                                                                        |
| moreDetails     | [ErrorResponseDetails](#errorresponsedetails)\[\] | List of additional error details.                                                                                                                    |
| parameters      | [ErrorParameter](#errorparameter)\[\]             | Structured parameters providing additional machine-readable context about the error.                                                                 |
| relatedResource | [ErrorRelatedResource](#errorrelatedresource)     | The error related resource details.                                                                                                                  |
| requestId       | string (uuid)                                     | ID of the request associated with the error.                                                                                                         |

### ErrorResponseDetails

Object

The error response details.

|                 |                                               |                                                                                                                                                      |
|-----------------|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name            | Type                                          | Description                                                                                                                                          |
| errorCode       | string                                        | A specific identifier that provides information about an error condition, allowing for standardized communication between our service and its users. |
| message         | string                                        | A human readable representation of the error.                                                                                                        |
| parameters      | [ErrorParameter](#errorparameter)\[\]         | Structured parameters providing additional machine-readable context about the error.                                                                 |
| relatedResource | [ErrorRelatedResource](#errorrelatedresource) | The error related resource details.                                                                                                                  |

### GroupDetails

Object

Group specific details. Applicable when the principal type is `Group`.

|           |                         |                                                                       |
|-----------|-------------------------|-----------------------------------------------------------------------|
| Name      | Type                    | Description                                                           |
| groupType | [GroupType](#grouptype) | The type of the group. Additional group types may be added over time. |

### GroupPrincipal

Object

Represents a security group.

[TABLE]

### GroupType

Enumeration

The type of the group. Additional group types may be added over time.

|                  |                                   |
|------------------|-----------------------------------|
| Value            | Description                       |
| Unknown          | Principal group type is unknown.  |
| SecurityGroup    | Principal is a security group.    |
| DistributionList | Principal is a distribution list. |

### ItemTag

Object

Represents a tag applied on an item.

|             |               |                      |
|-------------|---------------|----------------------|
| Name        | Type          | Description          |
| displayName | string        | The name of the tag. |
| id          | string (uuid) | The tag ID.          |

### ItemType

Enumeration

The type of the item. Additional item types may be added over time.

|                                |                                                                              |
|--------------------------------|------------------------------------------------------------------------------|
| Value                          | Description                                                                  |
| Dashboard                      | PowerBI dashboard.                                                           |
| Report                         | PowerBI report.                                                              |
| SemanticModel                  | PowerBI semantic model.                                                      |
| PaginatedReport                | PowerBI paginated report.                                                    |
| Datamart                       | PowerBI datamart.                                                            |
| Lakehouse                      | A lakehouse.                                                                 |
| Eventhouse                     | An eventhouse.                                                               |
| Environment                    | An environment.                                                              |
| KQLDatabase                    | A KQL database.                                                              |
| KQLQueryset                    | A KQL queryset.                                                              |
| KQLDashboard                   | A KQL dashboard.                                                             |
| DataPipeline                   | A data pipeline.                                                             |
| Notebook                       | A notebook.                                                                  |
| SparkJobDefinition             | A spark job definition.                                                      |
| MLExperiment                   | A machine learning experiment.                                               |
| MLModel                        | A machine learning model.                                                    |
| Warehouse                      | A warehouse.                                                                 |
| Eventstream                    | An eventstream.                                                              |
| SQLEndpoint                    | An SQL endpoint.                                                             |
| MirroredWarehouse              | A mirrored warehouse.                                                        |
| MirroredDatabase               | A mirrored database.                                                         |
| Reflex                         | A Reflex.                                                                    |
| GraphQLApi                     | An API for GraphQL item.                                                     |
| MountedDataFactory             | A MountedDataFactory.                                                        |
| SQLDatabase                    | A SQLDatabase.                                                               |
| CopyJob                        | A Copy job.                                                                  |
| VariableLibrary                | A VariableLibrary.                                                           |
| Dataflow                       | A Dataflow.                                                                  |
| ApacheAirflowJob               | An ApacheAirflowJob.                                                         |
| WarehouseSnapshot              | A Warehouse snapshot.                                                        |
| DigitalTwinBuilder             | A DigitalTwinBuilder.                                                        |
| DigitalTwinBuilderFlow         | A Digital Twin Builder Flow.                                                 |
| MirroredAzureDatabricksCatalog | A mirrored azure databricks catalog.                                         |
| Map                            | A Map.                                                                       |
| AnomalyDetector                | An Anomaly Detector.                                                         |
| UserDataFunction               | A User Data Function.                                                        |
| GraphModel                     | A GraphModel.                                                                |
| GraphQuerySet                  | A Graph QuerySet.                                                            |
| SnowflakeDatabase              | A Snowflake Database to store Iceberg tables created from Snowflake account. |
| OperationsAgent                | A OperationsAgent.                                                           |
| CosmosDBDatabase               | A Cosmos DB Database.                                                        |
| Ontology                       | An Ontology.                                                                 |
| EventSchemaSet                 | An EventSchemaSet.                                                           |
| DataAgent                      | A DataAgent.                                                                 |
| MirroredCatalog                | A MirroredCatalog.                                                           |
| PolicySet                      | A PolicySet.                                                                 |
| AppBackend                     | An AppBackend.                                                               |
| OrgApp                         | An Org App.                                                                  |
| OrgAppAudience                 | An Org App Audience.                                                         |
| DataBuildToolJob               | A DataBuildToolJob.                                                          |
| AzureDatabricksStorage         | A OneLake-backed storage item for Azure Databricks.                          |
| Plan                           | A plan.                                                                      |
| Monitoring                     | A Monitoring item.                                                           |
| DeploymentPlan                 | A Deployment plan.                                                           |
| ShareSubscription              | A Share Subscription.                                                        |
| Share                          | A share.                                                                     |
| Playbook                       | A Playbook.                                                                  |
| MirroredOneLake                | A mirrored OneLake item.                                                     |
| PostgreSQLDatabase             | A PostgreSQL database item in Microsoft Fabric.                              |
| CustomStreamConnector          | A Custom Stream Connector item in Microsoft Fabric.                          |

### PayloadType

Enumeration

The type of the definition part payload. Additional payload types may be added over time.

|              |                 |
|--------------|-----------------|
| Value        | Description     |
| InlineBase64 | Inline Base 64. |

### PrincipalType

Enumeration

The type of the principal. Additional principal types may be added over time.

|                         |                                                   |
|-------------------------|---------------------------------------------------|
| Value                   | Description                                       |
| User                    | Principal is a Microsoft Entra user principal.    |
| ServicePrincipal        | Principal is a Microsoft Entra service principal. |
| Group                   | Principal is a security group.                    |
| ServicePrincipalProfile | Principal is a service principal profile.         |
| EntireTenant            | Principal represents all tenant users.            |

### SemanticModel

Object

A semantic model object.

[TABLE]

### SemanticModelCreationPayload

Object

Creation payload for creating a semantic model without a definition.

|               |                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name          | Type             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| oneLakeTables | string\[\] (uri) | A list of OneLake table URLs to connect the semantic model to (maximum 100). Each URL must follow one of two formats: `https://onelake.dfs.fabric.microsoft.com/{workspaceId}/{dataItemId}/Tables/{tableName}` for a table in the default `dbo` schema, or `https://onelake.dfs.fabric.microsoft.com/{workspaceId}/{dataItemId}/Tables/{schemaName}/{tableName}` for a table in an explicit custom schema. URLs may reference different workspaces and data items, and a single request may mix default-schema and custom-schema URLs. The system infers table names and columns from the OneLake source. |

### SemanticModelDefinition

Object

Semantic model public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/semantic-model-definition) for more details on the structure of the Semantic model definition.

|        |                                                                 |                                              |
|--------|-----------------------------------------------------------------|----------------------------------------------|
| Name   | Type                                                            | Description                                  |
| format | string                                                          | The format of the semantic model definition. |
| parts  | [SemanticModelDefinitionPart](#semanticmodeldefinitionpart)\[\] | A list of definition parts.                  |

### SemanticModelDefinitionPart

Object

Semantic model definition part object.

|             |                             |                                  |
|-------------|-----------------------------|----------------------------------|
| Name        | Type                        | Description                      |
| path        | string                      | The semantic model part path.    |
| payload     | string                      | The semantic model part payload. |
| payloadType | [PayloadType](#payloadtype) | The payload type.                |

### SensitivityLabel

Object

Represents a sensitivity label applied to an item.

|      |               |                           |
|------|---------------|---------------------------|
| Name | Type          | Description               |
| id   | string (uuid) | The sensitivity label ID. |

### SensitivityLabelApplyStrategy

Enumeration

The strategy for applying the sensitivity label. The default value is ApplyOrFail. Additional types may be added over time.

|             |                                                                                                                 |
|-------------|-----------------------------------------------------------------------------------------------------------------|
| Value       | Description                                                                                                     |
| ApplyOrFail | Apply the sensitivity label or fail the operation if it cannot be applied.                                      |
| Ignore      | Ignore the sensitivity label if it cannot be applied and proceed with the operation without applying the label. |

### SensitivityLabelSettings

Object

The sensitivity label settings.

|                               |                                                                 |                                                  |
|-------------------------------|-----------------------------------------------------------------|--------------------------------------------------|
| Name                          | Type                                                            | Description                                      |
| labelId                       | string (uuid)                                                   | The sensitivity label ID.                        |
| sensitivityLabelApplyStrategy | [SensitivityLabelApplyStrategy](#sensitivitylabelapplystrategy) | The strategy for applying the sensitivity label. |

### ServicePrincipalDetails

Object

Service principal specific details. Applicable when the principal type is `ServicePrincipal`.

|          |               |                                                |
|----------|---------------|------------------------------------------------|
| Name     | Type          | Description                                    |
| aadAppId | string (uuid) | The service principal's Microsoft Entra AppId. |

### ServicePrincipalPrincipal

Object

Represents a Microsoft Entra service principal.

[TABLE]

### ServicePrincipalProfileDetails

Object

Service principal profile details. Applicable when the principal type is `ServicePrincipalProfile`.

[TABLE]

### ServicePrincipalProfilePrincipal

Object

Represents a service principal profile.

[TABLE]

### UserDetails

Object

User principal specific details. Applicable when the principal type is `User`.

|                   |        |                          |
|-------------------|--------|--------------------------|
| Name              | Type   | Description              |
| userPrincipalName | string | The user principal name. |

### UserPrincipal

Object

Represents a Microsoft Entra user principal.

[TABLE]
