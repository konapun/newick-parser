#newick-parser
A general purpose and node.js compatible recursive-descent parser for newick format. This parser builds a recursive structure from a source string with the following properties:
  * **data**, usually the name of the node
  * **id**, an internal ID used for debugging
  * **branchlength**, given by a float
  * **children**, where each child is this structure


This parser supports all forms of the Newick spec, **except** trees rooted on a leaf (newick files are rarely given in this form anyway). Examples of supported forms are
(taken from Wikipedia)
```
(,,(,));                               no nodes are named
(A,B,(C,D));                           leaf nodes are named
(A,B,(C,D)E)F;                         all nodes are named
(:0.1,:0.2,(:0.3,:0.4):0.5);           all but root node have a distance to parent
(:0.1,:0.2,(:0.3,:0.4):0.5):0.0;       all have a distance to parent
(A:0.1,B:0.2,(C:0.3,D:0.4):0.5);       distances and leaf names (popular)
(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F;     distances and all names
```
## Usage
```js
var src = "((A:0.1,B:0.2,(C:0.3,D:0.4)E:.5)F:100)G;",
    tree = nwk.parser.parse(src);

tree.visit(function(node) {
  console.log("Visiting node " + node.data + " with branch length " + node.branchlength + " (node has internal id " + node.id + ")");
});
```

## Other Output Formats
Although by default the newick source is compiled to an easily traversable recursive tree structure, other output
formats are possible. Currently, the following converters are available:
  * **Binary:** Convert the default tree to a binary tree with nodes of the same structure as the original. This will automatically add unnamed parents to nodes with more than two children
    and will alter branch lengths accordingly so the resulting tree has the same meaning as the original
  * **OneZoom:** Has an additional parser for parsing complex names in the style of [OneZoom](https://github.com/jrosindell/OneZoom)
  * **JSON:** Convert into a JSON string (requires availability of JSON.stringify; won't work on IE 7 or lower)
  
### Converter Example
```js
var tree = nwk.parser.parse(nonbinarySrc), // assume nonbinarySrc is a source string describing a nonbinary tree
    binaryTree = nwk.converter.toBinary(tree), // produces a binary tree equivalent to the original tree
    oneZoomTree = nwk.converter.toOneZoom(binaryTree); // Modify the default node structure into that which OneZoom requires

// now you have a structure suitable for input into OneZoom
```

## Querying the Tree
A debugger is also included which provides queries on the tree, currently:
  * **findNonbinaryNodes:** Identify every node which prevents this tree from being a binary tree
  * **findUnnamedNodes:** Identify all nodes which have an empty data property
  * **findUnlengthedNodes:** Identify all nodes with a branch length of 0 (default given length)
  * **findLeaves:** Identify all leaf nodes
  
### Querying example
```js
var tree = nwk.parser.parse(src);
var nonbinary = nwk.debugger.findNonbinaryNodes(tree);
for (var i = 0; i < nonbinary.length; i++) {
	var node = nonbinary[i];
	console.log("FOUND: " + node.data + " (" + node.id + ") with branchlength " + node.branchlength + " and " + node.children.length + " children");
}
```
