<!-- Source: https://learn.microsoft.com/en-us/rest/api/fabric/report/items/create-report (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Items - Create Report

Service:  
Report

&nbsp;

API Version:  
v1

Creates a report in the specified workspace.  
This API supports [long running operations (LRO)](/en-us/rest/api/fabric/articles/long-running-operation).

The API supports two creation modes: (1) provide a `definition` for full control over the report structure, or (2) provide a `creationPayload` with a `semanticModelReference` to create an empty report connected to an existing semantic model. Either `definition` or `creationPayload` is required. You can't use both at the same time.

## Permissions

The caller must have a *contributor* workspace role. When creating a report with a `creationPayload` that references a semantic model via `semanticModelReference`, the caller must also have read access to the referenced semantic model, including when that semantic model resides in a different workspace (cross-workspace reference).

## Required Delegated Scopes

Report.ReadWrite.All or Item.ReadWrite.All

## Limitations

-   To create a report item, the user must have the appropriate license. For more information see: [Microsoft Fabric license types](/en-us/fabric/enterprise/licenses#microsoft-fabric-license-types).

## Microsoft Entra supported identities

This API supports the Microsoft [identities](/en-us/rest/api/fabric/articles/identity-support) listed in this section.

| Identity                                                                                                                                                                                                    | Support |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| User                                                                                                                                                                                                        | Yes     |
| [Service principal](/en-us/entra/identity-platform/app-objects-and-service-principals#service-principal-object) and [Managed identities](/en-us/entra/identity/managed-identities-azure-resources/overview) | Yes     |

## Interface

```
POST https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/reports
```

## URI Parameters

[TABLE]

## Request Body

|                          |          |                                                       |                                                                                                                                                                                |
|--------------------------|----------|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                     | Required | Type                                                  | Description                                                                                                                                                                    |
| displayName              | True     | string                                                | The report display name. The display name must follow naming rules according to item type.                                                                                     |
| creationPayload          |          | [ReportCreationPayload](#reportcreationpayload)       | The creation payload for creating a report connected to an existing semantic model. Either `definition` or `creationPayload` is required. You can't use both at the same time. |
| definition               |          | [ReportDefinition](#reportdefinition)                 | The report public definition. Either `definition` or `creationPayload` is required. You can't use both at the same time.                                                       |
| description              |          | string                                                | The report description. Maximum length is 256 characters.                                                                                                                      |
| folderId                 |          | string (uuid)                                         | The folder ID. If not specified or null, the report is created with the workspace as its folder.                                                                               |
| sensitivityLabelSettings |          | [SensitivityLabelSettings](#sensitivitylabelsettings) | The sensitivity label settings for the report.                                                                                                                                 |

## Responses

[TABLE]

## Examples

|                                                                                                 |
|-------------------------------------------------------------------------------------------------|
| [Create a report example](#create-a-report-example)                                             |
| [Create a report with creation payload example](#create-a-report-with-creation-payload-example) |

### Create a report example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/reports

{
  "displayName": "Report 1",
  "description": "A report description.",
  "definition": {
    "parts": [
      {
        "path": "definition.pbir",
        "payload": "ew0KICAidmVyc2lvbiI..sYVN0eWxlTGl2ZSINCiAgICB9DQogIH0NCn0=",
        "payloadType": "InlineBase64"
      },
      {
        "path": "report.json",
        "payload": "ewogICJjb25maWciOiA..3aWR0aCI6IDEyODAuMDAKICAgIH0KICBdCn0=",
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
  "displayName": "Report 1",
  "description": "A report description.",
  "type": "Report",
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

### Create a report with creation payload example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/reports

{
  "displayName": "Sales Dashboard",
  "description": "An empty report connected to a semantic model.",
  "creationPayload": {
    "semanticModelReference": {
      "referenceType": "ById",
      "itemId": "5b218778-e7a5-4d73-8187-f10824047715",
      "workspaceId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229"
    }
  }
}
```

#### Sample response

Status code:  
201

``` lang-json
{
  "displayName": "Sales Dashboard",
  "description": "An empty report connected to a semantic model.",
  "type": "Report",
  "workspaceId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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

|                                                                       |                                                                                                                                                                                                     |
|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                                                                  | Description                                                                                                                                                                                         |
| [CreateReportRequest](#createreportrequest)                           | Create report request payload.                                                                                                                                                                      |
| [EntireTenantPrincipal](#entiretenantprincipal)                       | Represents a tenant principal                                                                                                                                                                       |
| [ErrorParameter](#errorparameter)                                     | A structured parameter providing additional machine-readable context about an error.                                                                                                                |
| [ErrorRelatedResource](#errorrelatedresource)                         | The error related resource details object.                                                                                                                                                          |
| [ErrorResponse](#errorresponse)                                       | The error response.                                                                                                                                                                                 |
| [ErrorResponseDetails](#errorresponsedetails)                         | The error response details.                                                                                                                                                                         |
| [GroupDetails](#groupdetails)                                         | Group specific details. Applicable when the principal type is `Group`.                                                                                                                              |
| [GroupPrincipal](#groupprincipal)                                     | Represents a security group.                                                                                                                                                                        |
| [GroupType](#grouptype)                                               | The type of the group. Additional group types may be added over time.                                                                                                                               |
| [ItemReferenceById](#itemreferencebyid)                               | An item reference by ID object.                                                                                                                                                                     |
| [ItemReferenceType](#itemreferencetype)                               | The item reference type. Additional `ItemReferenceType` types may be added over time.                                                                                                               |
| [ItemTag](#itemtag)                                                   | Represents a tag applied on an item.                                                                                                                                                                |
| [ItemType](#itemtype)                                                 | The type of the item. Additional item types may be added over time.                                                                                                                                 |
| [PayloadType](#payloadtype)                                           | The type of the definition part payload. Additional payload types may be added over time.                                                                                                           |
| [PrincipalType](#principaltype)                                       | The type of the principal. Additional principal types may be added over time.                                                                                                                       |
| [Report](#report)                                                     | A report object.                                                                                                                                                                                    |
| [ReportCreationPayload](#reportcreationpayload)                       | Creation payload for creating a report without a definition.                                                                                                                                        |
| [ReportDefinition](#reportdefinition)                                 | Report public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/report-definition) for more details on the structure of the Report definition. |
| [ReportDefinitionPart](#reportdefinitionpart)                         | Report definition part object.                                                                                                                                                                      |
| [SensitivityLabel](#sensitivitylabel)                                 | Represents a sensitivity label applied to an item.                                                                                                                                                  |
| [SensitivityLabelApplyStrategy](#sensitivitylabelapplystrategy)       | The strategy for applying the sensitivity label. The default value is ApplyOrFail. Additional types may be added over time.                                                                         |
| [SensitivityLabelSettings](#sensitivitylabelsettings)                 | The sensitivity label settings.                                                                                                                                                                     |
| [ServicePrincipalDetails](#serviceprincipaldetails)                   | Service principal specific details. Applicable when the principal type is `ServicePrincipal`.                                                                                                       |
| [ServicePrincipalPrincipal](#serviceprincipalprincipal)               | Represents a Microsoft Entra service principal.                                                                                                                                                     |
| [ServicePrincipalProfileDetails](#serviceprincipalprofiledetails)     | Service principal profile details. Applicable when the principal type is `ServicePrincipalProfile`.                                                                                                 |
| [ServicePrincipalProfilePrincipal](#serviceprincipalprofileprincipal) | Represents a service principal profile.                                                                                                                                                             |
| [UserDetails](#userdetails)                                           | User principal specific details. Applicable when the principal type is `User`.                                                                                                                      |
| [UserPrincipal](#userprincipal)                                       | Represents a Microsoft Entra user principal.                                                                                                                                                        |

### CreateReportRequest

Object

Create report request payload.

|                          |                                                       |                                                                                                                                                                                |
|--------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                     | Type                                                  | Description                                                                                                                                                                    |
| creationPayload          | [ReportCreationPayload](#reportcreationpayload)       | The creation payload for creating a report connected to an existing semantic model. Either `definition` or `creationPayload` is required. You can't use both at the same time. |
| definition               | [ReportDefinition](#reportdefinition)                 | The report public definition. Either `definition` or `creationPayload` is required. You can't use both at the same time.                                                       |
| description              | string                                                | The report description. Maximum length is 256 characters.                                                                                                                      |
| displayName              | string                                                | The report display name. The display name must follow naming rules according to item type.                                                                                     |
| folderId                 | string (uuid)                                         | The folder ID. If not specified or null, the report is created with the workspace as its folder.                                                                               |
| sensitivityLabelSettings | [SensitivityLabelSettings](#sensitivitylabelsettings) | The sensitivity label settings for the report.                                                                                                                                 |

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

### ItemReferenceById

Object

An item reference by ID object.

[TABLE]

### ItemReferenceType

Enumeration

The item reference type. Additional `ItemReferenceType` types may be added over time.

|            |                                       |
|------------|---------------------------------------|
| Value      | Description                           |
| ById       | The item is referenced by its ID.     |
| ByVariable | The item is referenced by a variable. |

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

### Report

Object

A report object.

[TABLE]

### ReportCreationPayload

Object

Creation payload for creating a report without a definition.

|                        |                                         |                                                                                                                  |
|------------------------|-----------------------------------------|------------------------------------------------------------------------------------------------------------------|
| Name                   | Type                                    | Description                                                                                                      |
| semanticModelReference | [ItemReferenceById](#itemreferencebyid) | A reference to the semantic model to connect the report to. The semantic model must be accessible to the caller. |

### ReportDefinition

Object

Report public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/report-definition) for more details on the structure of the Report definition.

|        |                                                   |                                      |
|--------|---------------------------------------------------|--------------------------------------|
| Name   | Type                                              | Description                          |
| format | string                                            | The format of the report definition. |
| parts  | [ReportDefinitionPart](#reportdefinitionpart)\[\] | A list of definition parts.          |

### ReportDefinitionPart

Object

Report definition part object.

|             |                             |                          |
|-------------|-----------------------------|--------------------------|
| Name        | Type                        | Description              |
| path        | string                      | The report part path.    |
| payload     | string                      | The report part payload. |
| payloadType | [PayloadType](#payloadtype) | The payload type.        |

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
