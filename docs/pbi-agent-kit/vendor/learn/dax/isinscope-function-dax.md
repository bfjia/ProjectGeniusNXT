<!-- Source: https://learn.microsoft.com/en-us/dax/isinscope-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# ISINSCOPE

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns true when the specified column is the level in a hierarchy of levels.

## Syntax

``` lang-dax
ISINSCOPE(<columnName>)
```

### Parameters

| Term         | Definition                                                                             |
|--------------|----------------------------------------------------------------------------------------|
| `columnName` | The name of an existing column, using standard DAX syntax. It cannot be an expression. |

## Return value

`TRUE` when the specified column is the level in a hierarchy of levels.

## Remarks

This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

``` lang-dax
DEFINE
MEASURE FactInternetSales[% of Parent] =
  SWITCH (TRUE(),
    ISINSCOPE(DimProduct[Subcategory]),
      DIVIDE(
        SUM(FactInternetSales[Sales Amount]),
        CALCULATE(
          SUM(FactInternetSales[Sales Amount]),
          ALLSELECTED(DimProduct[Subcategory]))
      ),
    ISINSCOPE(DimProduct[Category]),
      DIVIDE(
        SUM(FactInternetSales[Sales Amount]), 
        CALCULATE(
          SUM(FactInternetSales[Sales Amount]),
          ALLSELECTED(DimProduct[Category]))
      ),
    1
  ) * 100
EVALUATE
  SUMMARIZECOLUMNS
  (
    ROLLUPADDISSUBTOTAL
    (
      DimProduct[Category], "Category Subtotal",
      DimProduct[Subcategory], "Subcategory Subtotal"
    ),
    TREATAS(
      {"Bike Racks", "Bike Stands", "Mountain Bikes", "Road Bikes", "Touring Bikes"},
      DimProduct[Subcategory]),
    "Sales", SUM(FactInternetSales[Sales Amount]),
    "% of Parent", [% of Parent]
  )
  ORDER BY
    [Category Subtotal] DESC, [Category],
    [Subcategory Subtotal] DESC, [Subcategory]
```

Returns,

| DimProduct\[Category\] | DimProduct\[SubCategory\] | \[Category Subtotal\] | \[Subcategory Subtotal\] | \[Sales\]     | \[% of Parent\] |
|------------------------|---------------------------|-----------------------|--------------------------|---------------|-----------------|
|                        |                           | `TRUE`                | `TRUE`                   | 28,397,095.65 | 100.00          |
| Accessories            |                           | `FALSE`               | `TRUE`                   | 78,951.00     | 0.28            |
| Accessories            | Bike Racks                | `FALSE`               | `FALSE`                  | 39,360.00     | 49.85           |
| Accessories            | Bike Stands               | `FALSE`               | `FALSE`                  | 39,591.00     | 50.15           |
| Bikes                  |                           | `FALSE`               | `TRUE`                   | 28,318,144.65 | 99.72           |
| Bikes                  | Mountain Bikes            | `FALSE`               | `FALSE`                  | 9,952,759.56  | 35.15           |
| Bikes                  | Road Bikes                | `FALSE`               | `FALSE`                  | 14,520,584.04 | 51.28           |
| Bikes                  | Touring Bikes             | `FALSE`               | `FALSE`                  | 3,844,801.05  | 13.58           |

## Related content

-   [SUMMARIZECOLUMNS function](summarizecolumns-function-dax)
-   [CALCULATE function](calculate-function-dax)

------------------------------------------------------------------------
