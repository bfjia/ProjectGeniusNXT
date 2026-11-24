<!-- Source: https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-scripts (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# TMDL scripts

TMDL scripts enable you to apply an action to a semantic model, which could be a change or operation. A TMDL script has two parts:

-   A *command*, which is required and should be declared at the top of the TMDL script.
-   One or more *semantic model objects* using TMDL language definition or reference.

Syntax:

``` lang-tmdl
<TMDL Command name>
  <TMDL object>
  [<TMDL object>]
```

## CreateOrReplace command

Creates or replaces the specified semantic model objects and all the descendants. Existing objects are replaced with a new definition.

The order of TMDL objects inside the *createOrReplace* command is not important.

The semantics of TMDL language are applied to objects within the *createOrReplace* command. For example, it's possible to split the object definition into multiple segments, however the same property can't be declared more than once. You can [learn more about the TMDL language](tmdl-overview?view=sql-analysis-services-2025).

## Example

Create or replace the measure *\# Products (with Sales)* from the table *Sales* and the full definition of the table *Product*:

``` lang-tmdl
createOrReplace

  ref table Sales
    measure '# Products (with Sales)' = DISTINCTCOUNT('Sales'[ProductKey])
        formatString: #,##0
    
  table Product

    measure '# Products' = COUNTROWS('Product')
        formatString: #,##0

    column Product
        dataType: string
        isDefaultLabel
        summarizeBy: none
        sourceColumn: Product

    column Category
        dataType: string
        summarizeBy: none
        sourceColumn: Category

    partition Product-partition = m
        mode: import
        source =
                let
                    Source = #"RAW-Product",
                    #"Renamed Columns" = Table.RenameColumns(Source,{{"Product Name", "Product"}})
                in
                    #"Renamed Columns"
```

## Considerations and limitations

Only one command verb per script execution is supported.

## Related content

The following articles describe more about TMDL and its uses.

-   [Get started with TMDL](/en-us/analysis-services/tmdl/tmdl-how-to)
-   [Tabular Model Definition Language (TMDL)](/en-us/analysis-services/tmdl/tmdl-overview)
-   [Power BI Desktop projects (preview)](/en-us/power-bi/developer/projects/projects-overview)
-   [Power BI Desktop project semantic model folder](/en-us/power-bi/developer/projects/projects-dataset)

------------------------------------------------------------------------
