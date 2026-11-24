<!-- Source: https://learn.microsoft.com/en-us/rest/api/fabric/report/items/update-report-definition (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Items - Update Report Definition

Service:  
Report

&nbsp;

API Version:  
v1

Overrides the definition for the specified report.  
This API supports [long running operations (LRO)](/en-us/rest/api/fabric/articles/long-running-operation).

Updating the report's definition, does not affect its sensitivity label.

## Permissions

The caller must have *read and write* permissions for the report.

## Required Delegated Scopes

Report.ReadWrite.All or Item.ReadWrite.All

## Microsoft Entra supported identities

This API supports the Microsoft [identities](/en-us/rest/api/fabric/articles/identity-support) listed in this section.

| Identity                                                                                                                                                                                                    | Support |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| User                                                                                                                                                                                                        | Yes     |
| [Service principal](/en-us/entra/identity-platform/app-objects-and-service-principals#service-principal-object) and [Managed identities](/en-us/entra/identity/managed-identities-azure-resources/overview) | Yes     |

## Interface

```
POST https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/reports/{reportId}/updateDefinition
```

With optional parameters:

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/reports/{reportId}/updateDefinition?updateMetadata={updateMetadata}
```

## URI Parameters

[TABLE]

## Request Body

|            |          |                                       |                                                                                                                                                                                                     |
|------------|----------|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name       | Required | Type                                  | Description                                                                                                                                                                                         |
| definition | True     | [ReportDefinition](#reportdefinition) | Report public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/report-definition) for more details on the structure of the Report definition. |

## Responses

[TABLE]

## Examples

### Update a report definition example

#### Sample request

-   [HTTP](#tabpanel_1_HTTP)

``` lang-http
POST https://api.fabric.microsoft.com/v1/workspaces/cfafbeb1-8037-4d0c-896e-a46fb27ff229/reports/5b218778-e7a5-4d73-8187-f10824047715/updateDefinition?updateMetadata=True

{
  "definition": {
    "parts": [
      {
        "path": "report.json",
        "payload": "QmFzZTY0U3RyaW5n",
        "payloadType": "InlineBase64"
      },
      {
        "path": "definition.pbir",
        "payload": "QW5vdGhlckJhc2U2NFN0cmluZw",
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
200

Status code:  
202

``` wrap
Location: https://api.fabric.microsoft.com/v1/operations/427f6c34-b64e-4ee4-8ea5-b533c0e203ef
x-ms-operation-id: 427f6c34-b64e-4ee4-8ea5-b533c0e203ef
Retry-After: 30
```

## Definitions

|                                                                 |                                                                                                                                                                                                     |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                                                            | Description                                                                                                                                                                                         |
| [ErrorParameter](#errorparameter)                               | A structured parameter providing additional machine-readable context about an error.                                                                                                                |
| [ErrorRelatedResource](#errorrelatedresource)                   | The error related resource details object.                                                                                                                                                          |
| [ErrorResponse](#errorresponse)                                 | The error response.                                                                                                                                                                                 |
| [ErrorResponseDetails](#errorresponsedetails)                   | The error response details.                                                                                                                                                                         |
| [PayloadType](#payloadtype)                                     | The type of the definition part payload. Additional payload types may be added over time.                                                                                                           |
| [ReportDefinition](#reportdefinition)                           | Report public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/report-definition) for more details on the structure of the Report definition. |
| [ReportDefinitionPart](#reportdefinitionpart)                   | Report definition part object.                                                                                                                                                                      |
| [UpdateReportDefinitionRequest](#updatereportdefinitionrequest) | Update report public definition request payload.                                                                                                                                                    |

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

### PayloadType

Enumeration

The type of the definition part payload. Additional payload types may be added over time.

|              |                 |
|--------------|-----------------|
| Value        | Description     |
| InlineBase64 | Inline Base 64. |

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

### UpdateReportDefinitionRequest

Object

Update report public definition request payload.

|            |                                       |                                                                                                                                                                                                     |
|------------|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name       | Type                                  | Description                                                                                                                                                                                         |
| definition | [ReportDefinition](#reportdefinition) | Report public definition object. Refer to this [article](/en-us/rest/api/fabric/articles/item-management/definitions/report-definition) for more details on the structure of the Report definition. |
