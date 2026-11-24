<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/sharepoint-files (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# SharePoint.Files

## Syntax

    SharePoint.Files(url as text, optional options as nullable record) as table

## About

Returns a table containing one row for each file found at the specified SharePoint site, `url`, including files in subfolders. Unlike [`SharePoint.Contents`](sharepoint-contents), this function returns a flat table and doesn't include rows for folders. The site URL can't contain a query string or fragment. Each row contains the file's binary content in the `Content` column and file metadata in the `Name`, `Extension`, `Date accessed`, `Date modified`, `Date created`, `Attributes`, and `Folder Path` columns. The `Folder Path` value is the absolute URL of the folder that contains the file. `options` may be specified to control the following options:

-   `ApiVersion`: A number (14 or 15) or the text "Auto" that specifies the SharePoint API version to use for this site. When not specified, API version 14 is used. When Auto is specified, the server version will be automatically discovered if possible, otherwise version defaults to 14. Non-English SharePoint sites require at least version 15.

## Example 1

List the name, file extension, and folder URL for every file in the Contoso SharePoint site using automatic API selection.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Files(
        "https://contoso.sharepoint.com/sites/Contoso",
        [ApiVersion = "Auto"]
    ),
    SelectedColumns = Table.SelectColumns(
        Source,
        {"Name", "Extension", "Folder Path"}
    )
in
    SelectedColumns
```

**Output**

`A table containing the name, extension, and absolute folder URL for each file in the site and its subfolders.`

## Example 2

Return every file with the `.xlsx` extension from the Contoso SharePoint site. This example uses API version 15, which works with both English and non-English SharePoint sites. The extension comparison is case-insensitive, so it also matches `.XLSX`.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Files(
        "https://contoso.sharepoint.com/sites/Contoso",
        [ApiVersion = 15]
    ),
    ExcelWorkbooks = Table.SelectRows(
      Source,
      each Comparer.OrdinalIgnoreCase([Extension], ".xlsx") = 0
    )
  in
    ExcelWorkbooks
```

**Output**

`A table containing every .xlsx file in the site and its subfolders.`

## Example 3

Return only the files stored directly in the `Shared Documents/Reports` folder. An exact `Folder Path` match excludes files in subfolders.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Files("https://contoso.sharepoint.com/sites/Contoso"),
    ReportsFiles = Table.SelectRows(
        Source,
        each [Folder Path] = "https://contoso.sharepoint.com/sites/Contoso/Shared Documents/Reports/"
    )
in
    ReportsFiles
```

**Output**

`A table containing only the files stored directly in the Reports folder.`

## Example 4

Return the binary content of Budget.xlsx from the Shared Documents/Reports folder.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Files("https://contoso.sharepoint.com/sites/Contoso"),
    Budget = Source{
      [
        Name = "Budget.xlsx",
        #"Folder Path" = "https://contoso.sharepoint.com/sites/Contoso/Shared Documents/Reports/"
      ]
    }[Content]
  in
    Budget
```

**Output**

`The binary content of Budget.xlsx.`

------------------------------------------------------------------------
