#newick-parser
A recursive-descent parser for newick format

Supports conversion to other formats

## Usage
```js
var src = "((A:0.1,B:0.2,(C:0.3,D:0.4)E:.5)F:100)G;",
    tree = nwk.parser.parse(src);

tree.visit(function(node) {
  console.log("Visiting node " + node.data + " with branch length " + node.branchlength);
});
```

## Other Output Formats
Although by default the newick source is compiled to an easily traversable recursive tree structure, other output
formats are possible. Currently, the following converters are available:
  * **OneZoom:** Has an additional parser for parsing complex names in the style of OneZoom

### Converter Example
```js
// (assuming tree from above)
var oneZoomTree = nwk.converter.convert2oz(tree);

// now you have a structure suitable for input into OneZoom
```
