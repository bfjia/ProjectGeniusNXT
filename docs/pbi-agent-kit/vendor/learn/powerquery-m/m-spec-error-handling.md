<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/m-spec-error-handling (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Error Handling

The result of evaluating an M expression produces one of the following outcomes:

-   A single value is produced.

-   An *error is raised*, indicating the process of evaluating the expression could not produce a value. An error contains a single record value that can be used to provide additional information about what caused the incomplete evaluation.

Errors can be raised from within an expression, and can be handled from within an expression.

## Raising errors

The syntax for raising an error is as follows:

*error-raising-expression:*  
      `error` *expression*

The *expression* being raised must evaluate to an *error value*.

In canonical form, an *error value* is a record with the following structure, having field values compatible with the indicated types:

``` lang-powerquery-m
[
    Reason = ..., // nullable text
    Message = ..., // nullable text
    Detail = ..., // any
    Message.Format = ..., // nullable text
    Message.Parameters = ..., // nullable list
    ErrorCode = ... // any
]
```

All of the above record fields are optional, and so may be omitted. Any additional fields included in the record will be ignored, and so not included in the error that is raised.

*Message.Format* may contain string interpolation placeholders in the form of `#{x}`, where `x` is a zero-based index. When an error is raised with a non-null *Message.Format*, interpolation will be performed using *Message.Format* as the format string and *Message.Parameters* as the values to be positionally applied. The resulting output will become the raised error's *Message*.

For example:

``` lang-powerquery-m
error [
    Message.Format = "Unexpected value '#{0}' in field #{1}", 
    Message.Parameters = {"???", "Customer"}
]
```

Will result in the following error being raised:

``` lang-powerquery-m
[
    ErrorCode = null,
    Reason = null,
    Message = "Unexpected value '???' in field Customer",
    Detail = null,
    Message.Format = "Unexpected value '#{0}' in field #{1}",
    Message.Parameters = {"???", "Customer"}
]
```

Text values can be used as shorthand for error values. For example:

``` lang-powerquery-m
error "Hello, world" // error with message "Hello, world"
```

Full error values are records and can be constructed using the [`Error.Record`](error-record) function:

``` lang-powerquery-m
error Error.Record("FileNotFound", "File my.txt not found",
     "my.txt")
```

The above expression is equivalent to:

``` lang-powerquery-m
error [
    Reason = "FileNotFound",
    Message = "File my.txt not found",
    Detail = "my.txt"
]
```

Raising an error will cause the current expression evaluation to stop, and the expression evaluation stack will unwind until one of the following occurs:

-   A record field, section member, or let variable—collectively: an *entry*—is reached. The entry is marked as having an error, the error value is saved with that entry, and then propagated. Any subsequent access to that entry will cause an identical error to be raised. Other entries of the record, section, or let expression are not necessarily affected (unless they access an entry previously marked as having an error).

-   The top-level expression is reached. In this case, the result of evaluating the top-level expression is an error instead of a value.

-   A `try` expression is reached. In this case, the error is captured and returned as a value.

## Handling errors

An *error-handling-expression* (informally known as a "try expression") is used to handle an error:

*error-handling-expression:*  
      `try` *protected-expression error-handler_(opt)  
protected-expression:  
      expression  
*error-handler:*  
      otherwise-clause  
      catch-clause  
otherwise-clause:*  
      `otherwise` *default-expression*  
*default-expression*:  
      *expression*  
*catch-clause:*  
      `catch` *catch-function*  
*catch-function:*  
      `(`*parameter-name*_(opt)`)` `=>` *function-body*  

The following holds when evaluating an *error-handling-expression* without an *error-handler*:

-   If the evaluation of the *protected-expression* does not result in an error and produces a value x, the value produced by the *error-handling-expression* is a record of the following form:

``` lang-powerquery-m
    [ HasErrors = false, Value = x ]
```

-   If the evaluation of the *protected-expression* raises an error value e, the result of the *error-handling-expression* is a record of the following form:

``` lang-powerquery-m
    [ HasErrors = true, Error = e ]
```

The following holds when evaluating an *error-handling-expression* with an *error-handler*:

-   The *protected-expression* must be evaluated before the *error-handler*.

-   The *error-handler* must be evaluated if and only if the evaluation of the *protected-expression* raises an error.

-   If the evaluation of the *protected-expression* raises an error, the value produced by the *error-handling-expression* is the result of evaluating the *error-handler*.

-   Errors raised during the evaluation of the *error-handler* are propagated.

-   When the *error-handler* being evaluated is a *catch-clause*, the *catch-function* is invoked. If that function accepts a parameter, the error value will be passed as its value.

The following example illustrates an *error-handling-expression* in a case where no error is raised:

``` lang-powerquery-m
let
    x = try "A"
in
    if x[HasError] then x[Error] else x[Value]
// "A"
```

The following example shows raising an error and then handling it:

``` lang-powerquery-m
let
    x = try error "A"
in
    if x[HasError] then x[Error] else x[Value]
// [ Reason = "Expression.Error", Message = "A", Detail = null ]
```

The preceding example can be rewritten with less syntax by using a *catch-clause* with a *catch-function* that accepts a parameter:

``` lang-powerquery-m
let
    x = try error "A" catch (e) => e
in
    x
// [ Reason = "Expression.Error", Message = "A", Detail = null ]
```

An *otherwise-clause* can be used to replace errors handled by a try expression with an alternative value:

``` lang-powerquery-m
try error "A" otherwise 1
// 1
```

A *catch-clause* with a zero-parameter *catch-function* is effectively a longer, alternative syntax for an *otherwise-clause*:

``` lang-powerquery-m
try error "A" catch () => 1
// 1
```

If the *error-handler* also raises an error, then so does the entire try expression:

``` lang-powerquery-m
try error "A" otherwise error "B"
// error with message "B"
```

``` lang-powerquery-m
try error "A" catch () => error "B"
// error with message "B"
```

``` lang-powerquery-m
try error "A" catch (e) => error "B"
// error with message "B"
```

## Errors in record and let initializers

The following example shows a record initializer with a field `A` that raises an error and is accessed by two other fields `B` and `C`. Field `B` does not handle the error that is raised by `A`, but `C` does. The final field `D` does not access `A` and so it is not affected by the error in `A`.

``` lang-powerquery-m
[
    A = error "A",
    B = A + 1,
    C = let x =
            try A in
                if not x[HasError] then x[Value]
                else x[Error],
    D = 1 + 1
]
```

The result of evaluating the above expression is:

``` lang-powerquery-m
[
    A = // error with message "A"
    B = // error with message "A"
    C = "A",
    D = 2
]
```

Error handling in M should be performed close to the cause of errors to deal with the effects of lazy field initialization and deferred closure evaluations. The following example shows an unsuccessful attempt at handling an error using a `try` expression:

``` lang-powerquery-m
let
    f = (x) => [ a = error "bad", b = x ],
    g = try f(42) otherwise 123
in
    g[a]  // error "bad"
```

In this example, the definition `g` was meant to handle the error raised when calling `f`. However, the error is raised by a field initializer that only runs when needed and thus after the record was returned from f and passed through the `try` expression.

## Not implemented error

While an expression is being developed, an author may want to leave out the implementation for some parts of the expression, but may still want to be able to execute the expression. One way to handle this case is to raise an error for the unimplemented parts. For example:

``` lang-powerquery-m
(x, y) =>
     if x > y then
         x - y
     else
         error Error.Record("Expression.Error",
            "Not Implemented")
```

The ellipsis symbol (`...`) can be used as a shortcut for `error`.

*not-implemented-expression:*  
      `...`

For example, the following is equivalent to the previous example:

``` lang-powerquery-m
(x, y) => if x > y then x - y else ...
```

------------------------------------------------------------------------
