<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/m-spec-lexical-structure (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Lexical Structure

## Documents

An M *document* is an ordered sequence of Unicode characters. M allows different classes of Unicode characters in different parts of an M document. For information on Unicode character classes, see *The Unicode Standard, Version 3.0*, section 4.5.

A document either consists of exactly one *expression* or of groups of *definitions* organized into *sections*. Sections are described in detail in Chapter 10. Conceptually speaking, the following steps are used to read an expression from a document:

1.  The document is decoded according to its character encoding scheme into a sequence of Unicode characters.

2.  Lexical analysis is performed, thereby translating the stream of Unicode characters into a stream of tokens. The remaining subsections of this section cover lexical analysis.

3.  Syntactic analysis is performed, thereby translating the stream of tokens into a form that can be evaluated. This process is covered in subsequent sections.

## Grammar conventions

The lexical and syntactic grammars are presented using *grammar productions*. Each grammar production defines a non-terminal symbol and the possible expansions of that nonterminal symbol into sequences of non-terminal or terminal symbols. In grammar productions, *non-terminal+* symbols are shown in italic type, and *terminal* symbols are shown in a fixed-width font.

The first line of a grammar production is the name of the non-terminal symbol being defined, followed by a colon. Each successive indented line contains a possible expansion of the nonterminal given as a sequence of non-terminal or terminal symbols. For example, the production:

*if-expression:*  
      `if` *if-condition* `then` *true-expression* `else` *false-expression*

defines an *if-expression* to consist of the token `if`, followed by an *if-condition*, followed by the token `then`, followed by a *true-expression*, followed by the token `else`, followed by a *false-expression*.

When there is more than one possible expansion of a non-terminal symbol, the alternatives are listed on separate lines. For example, the production:

*variable-list:  
      variable  
      variable-list* `,` *variable*

defines a *variable-list* to either consist of a *variable* or consist of a *variable-list* followed by a *variable*. In other words, the definition is recursive and specifies that a variable list consists of one or more variables, separated by commas.

A subscripted suffix "_(opt)" is used to indicate an optional symbol. The production:

*field-specification:*  
      `optional`*_(opt) field-name* `=` *field-type*

is shorthand for:

*field-specification:  
      field-name* `=` *field-type*  
      `optional` *field-name* `=` *field-type*

and defines a *field-specification* to optionally begin with the terminal symbol `optional` followed by a *field-name*, the terminal symbol `=`, and a *field-type*.

Alternatives are normally listed on separate lines, though in cases where there are many alternatives, the phrase "one of" may precede a list of expansions given on a single line. This is simply shorthand for listing each of the alternatives on a separate line. For example, the production:

*decimal-digit:* one of  
      `0  1  2  3  4  5  6  7  8  9`

is shorthand for:

*decimal-digit:*  
      `0`  
      `1`  
      `2`  
      `3`  
      `4`  
      `5`  
      `6`  
      `7`  
      `8`  
      `9`  

## Lexical Analysis

The *lexical-unit* production defines the lexical grammar for an M document. Every valid M document conforms to this grammar.

*lexical-unit:  
      lexical-elements_(opt)  
lexical-elements:  
      lexical-element  
      lexical-element  
      lexical-elements  
lexical-element:  
      whitespace  
      token comment*

At the lexical level, an M document consists of a stream of *whitespace*, *comment*, and *token* elements. Each of these productions is covered in the following sections. Only *token* elements are significant in the syntactic grammar.

## Whitespace

Whitespace is used to separate comments and tokens within an M document. Whitespace includes the space character (which is part of Unicode class Zs), as well as horizontal and vertical tab, form feed, and newline character sequences. Newline character sequences include carriage return, line feed, carriage return followed by line feed, next line, and paragraph separator characters.

*whitespace*:  
      Any character with Unicode class Zs  
      Horizontal tab character (`U+0009`)  
      Vertical tab character (`U+000B`)  
      Form feed character (`U+000C`)  
      Carriage return character (`U+000D`) followed by line feed character (`U+000A`)  
      *new-line-character*  
*new-line-character*:  
      Carriage return character (`U+000D`)  
      Line feed character (`U+000A`)  
      Next line character (`U+0085`)  
      Line separator character (`U+2028`)  
      Paragraph separator character (`U+2029`)

For compatibility with source code editing tools that add end-of-file markers, and to enable a document to be viewed as a sequence of properly terminated lines, the following transformations are applied, in order, to an M document:

-   If the last character of the document is a Control-Z character (`U+001A`), this character is deleted.

-   A carriage-return character (`U+000D`) is added to the end of the document if that document is non-empty and if the last character of the document is not a carriage return (`U+000D`), a line feed (`U+000A`), a line separator (`U+2028`), or a paragraph separator (`U+2029`).

## Comments

Two forms of comments are supported: single-line comments and delimited comments. *Single-line comments* start with the characters `//` and extend to the end of the source line. *Delimited comments* start with the characters `/*` and end with the characters `*/`.

Delimited comments may span multiple lines.

*comment:  
      single-line-comment  
      delimited-comment  
single-line-comment:*  
      `//` *single-line-comment-characters_(opt)  
single-line-comment-characters:  
      single-line-comment-character single-line-comment-characters_(opt)  
single-line-comment-character:*  
      Any Unicode character except a *new-line-character  
delimited-comment:*  
      `/*` *delimited-comment-text_(opt) asterisks* `/`  
*delimited-comment-text:  
      delimited-comment-section delimited-comment-text_(opt)  
delimited-comment-section:*  
      `/`  
      *asterisks_(opt) not-slash-or-asterisk  
asterisks:*  
      `*` *asterisks_(opt)  
not-slash-or-asterisk:*  
      Any Unicode character except `*` or `/`

Comments do not nest. The character sequences `/*` and `*/` have no special meaning within a single-line comment, and the character sequences `//` and `/*` have no special meaning within a delimited comment.

Comments are not processed within text literals. The example

``` lang-powerquery-m
/* Hello, world
*/
    "Hello, world"
```

includes a delimited comment.

The example

``` lang-powerquery-m
// Hello, world
//
"Hello, world" // This is an example of a text literal
```

shows several single-line comments.

## Tokens

A *token* is an identifier, keyword, literal, operator, or punctuator. Whitespace and comments are used to separate tokens, but are not considered tokens.

*token:  
      identifier  
      keyword  
      literal  
      operator-or-punctuator*

### Character Escape Sequences

M text values can contain arbitrary Unicode characters. Text literals, however, are limited to graphic characters and require the use of *escape sequences* for non-graphic characters. For example, to include a carriage-return, linefeed, or tab character in a text literal, the `#(cr)`, `#(lf)`, and `#(tab)` escape sequences can be used, respectively. To embed the escapesequence start characters `#(` in a text literal, the `#` itself needs to be escaped:

``` lang-powerquery-m
#(#)(
```

Escape sequences can also contain short (four hex digits) or long (eight hex digits) Unicode code-point values. The following three escape sequences are therefore equivalent:

``` lang-powerquery-m
#(000D)     // short Unicode hexadecimal value
#(0000000D) // long Unicode hexadecimal value
#(cr)       // compact escape shorthand for carriage return
```

Multiple escape codes can be included in a single escape sequence, separated by commas; the following two sequences are thus equivalent:

``` lang-powerquery-m
#(cr,lf)
#(cr)#(lf)
```

The following describes the standard mechanism of character escaping in an M document.

*character-escape-sequence:*  
      `#(` *escape-sequence-list* `)`  
*escape-sequence-list:  
      single-escape-sequence  
      single-escape-sequence* `,` *escape-sequence-list  
single-escape-sequence:  
      long-unicode-escape-sequence  
      short-unicode-escape-sequence  
      control-character-escape-sequence  
      escape-escape  
long-unicode-escape-sequence:  
      hex-digit hex-digit hex-digit hex-digit hex-digit hex-digit hex-digit hex-digit  
short-unicode-escape-sequence:  
      hex-digit hex-digit hex-digit hex-digit  
control-character-escape-sequence:  
      control-character  
control-character:*  
      `cr`  
      `lf`  
      `tab`  
*escape-escape:*  
      `#`

### Literals

A *literal* is a source code representation of a value.

*literal:  
      logical-literal  
      number-literal  
      text-literal  
      null-literal  
      verbatim-literal*

#### Null literals

The null literal is used to write the `null` value. The `null` value represents an absent value.

*null-literal:*  
      `null`

#### Logical literals

A logical literal is used to write the values `true` and `false` and produces a logical value.

*logical-literal:*  
      `true`  
      `false`

#### Number literals

A number literal is used to write a numeric value and produces a number value.

*number-literal:  
      decimal-number-literal  
      hexadecimal-number-literal  
decimal-number-literal:  
      decimal-digits* `.` *decimal-digits exponent-part_(opt)*  
      `.` *decimal-digits exponent-part_(opt)  
      decimal-digits exponent-part_(opt)  
decimal-digits:  
      decimal-digit decimal-digits_(opt)  
decimal-digit:* one of  
      `0  1  2  3  4  5  6  7  8  9`  
*exponent-part:*  
      `e` *sign_(opt) decimal-digits*  
      `E` *sign_(opt) decimal-digits  
sign:* one of  
      `+  -`  
*hexadecimal-number-literal:*  
      `0x` *hex-digits*  
      `0X` *hex-digits  
hex-digits:  
      hex-digit hex-digits_(opt)  
hex-digit:* one of  
      `0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F  a  b  c  d e  f`

A number can be specified in hexadecimal format by preceding the *hex-digits* with the characters `0x`. For example:

``` lang-powerquery-m
0xff // 255
```

Note that if a decimal point is included in a number literal, then it must have at least one digit following it. For example, `1.3` is a number literal but `1.` and `1.e3` are not.

#### Text literals

A text literal is used to write a sequence of Unicode characters and produces a text value.

*text-literal:*  
      `"` *text-literal-characters_(opt)* `"`  
*text-literal-characters:  
      text-literal-character text-literal-characters_(opt)  
text-literal-character:  
      single-text-character  
      character-escape-sequence  
      double-quote-escape-sequence  
single-text-character:*  
      Any character except `"` (`U+0022`) or `#` (`U+0023`) followed by `(` (`U+0028`)  
*double-quote-escape-sequence:*  
      `""` (`U+0022`, `U+0022`)

To include quotes in a text value, the quote mark is repeated, as follows:

``` lang-powerquery-m
"The ""quoted"" text" // The "quoted" text
```

The [*character-escape-sequence*](#character-escape-sequences) production can be used to write characters in text values without having to directly encode them as Unicode characters in the document. For example, a carriage return and line feed can be written in a text value as:

``` lang-powerquery-m
"Hello world#(cr,lf)"
```

### Verbatim literals

A verbatim literal is used to store a sequence of Unicode characters that were entered by a user as code, but which cannot be correctly parsed as code. At runtime, it produces an error value.

*verbatim-literal:*  
      `#!"` *text-literal-characters_(opt)* `"`

### Identifiers

An *identifier* is a name used to refer to a value. Identifiers can either be regular identifiers or quoted identifiers.

*identifier:  
      regular-identifier  
      quoted-identifier  
regular-identifier:  
      available-identifier  
      available-identifier dot-character regular-identifier  
available-identifier:*  
      A *keyword-or-identifier* that is not a *keyword  
keyword-or-identifier:  
      identifier-start-character identifier-part-characters_(opt)  
identifier-start-character:  
      letter-character  
      underscore-character  
identifier-part-characters:  
      identifier-part-character identifier-part-characters_(opt)  
identifier-part-character:  
      letter-character  
      decimal-digit-character  
      underscore-character  
      connecting-character  
      combining-character  
      formatting-character  
dot-character:*  
      `.` (`U+002E`)  
*underscore-character:*  
      `_` (`U+005F`)  
*letter-character:*  
      A Unicode character of classes Lu, Ll, Lt, Lm, Lo, or Nl  
*combining-character:*  
      A Unicode character of classes Mn or Mc  
*decimal-digit-character:*  
      A Unicode character of the class Nd  
*connecting-character:*  
      A Unicode character of the class Pc  
*formatting-character:*  
      A Unicode character of the class Cf

A *quoted-identifier* can be used to allow any sequence of zero or more Unicode characters to be used as an identifier, including keywords, whitespace, comments, operators and punctuators.

*quoted-identifier:*  
      `#"` *text-literal-characters_(opt)* `"`

Note that escape sequences and double-quotes to escape quotes can be used in a *quoted identifier*, just as in a *text-literal*.

The following example uses identifier quoting for names containing a space character:

``` lang-powerquery-m
[
    #"1998 Sales" = 1000,
    #"1999 Sales" = 1100,
    #"Total Sales" = #"1998 Sales" + #"1999 Sales"
]
```

The following example uses identifier quoting to include the `+` operator in an identifier:

``` lang-powerquery-m
[
    #"A + B" = A + B,
    A = 1,
    B = 2
]
```

#### Generalized Identifiers

There are two places in M where no ambiguities are introduced by identifiers that contain blanks or that are otherwise keywords or number literals. These places are the names of record fields in a record literal and in a field access operator (`[ ]`) There, M allows such identifiers without having to use quoted identifiers.

``` lang-powerquery-m
[
    Data = [ Base Line = 100, Rate = 1.8 ],
    Progression = Data[Base Line] * Data[Rate]
]
```

The identifiers used to name and access fields are referred to as *generalized identifiers* and defined as follows:

*generalized-identifier:  
      generalized-identifier-part  
      generalized-identifier* separated only by blanks (`U+0020`)  
*generalized-identifier-part  
generalized-identifier-part:  
      generalized-identifier-segment  
      decimal-digit-character generalized-identifier-segment  
generalized-identifier-segment:  
      keyword-or-identifier  
      keyword-or-identifier dot-character keyword-or-identifier*

### Keywords

A *keyword* is an identifier-like sequence of characters that is reserved, and cannot be used as an identifier except when using the [identifier-quoting mechanism](#identifiers) or where a [generalized identifier is allowed](#generalized-identifiers).

*keyword:* one of  
       `and as each else error false if in is let meta not null or otherwise`  
      ` section shared then true try type #binary #date #datetime`  
      ` #datetimezone #duration #infinity #nan #sections #shared #table #time`

### Operators and punctuators

There are several kinds of operators and punctuators. Operators are used in expressions to describe operations involving one or more operands. For example, the expression `a + b` uses the `+` operator to add the two operands `a` and `b`. Punctuators are for grouping and separating.

*operator-or-punctuator:* one of  
      `, ; = < <= > >= <> + - * / & ( ) [ ] { } @ ! ? ?? => .. ...`

------------------------------------------------------------------------
