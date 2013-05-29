/*
* A generic Newick hand-rolled tokenizer and recursive descent parser with options tailored for OneZoom style nwk strings (see grammar/grammar.specialized.gram)
*
* This parser accepts all valid forms of Newick, including unnamed nodes, no distances, and partial distances
* Author: Bremen Braun (konapun) for TimeTree (www.timetree.org), 2013
*/
var nwk = {};
nwk.parser = {
	tokenize: function(src) {
		var tokens = {
			'(': /\(/,
			')': /\)/,
			':': /:/,
			';': /;/,
			',': /,/,
			'NUMBER': /\d\.*\d*/,
			'STRING': /[a-zA-Z_\+\.\\\-\d'\s\[\]\*\/{}]+/, // your mileage with this regex may vary
		},
		classify = function(tkn) {
			var tokenClass;
			Object.keys(tokens).some(function(key) {
				var classifier = new RegExp(tokens[key]);
				
				if (tkn.match(classifier)) {
					tokenClass = key;
					return true;
				}
			});
			
			return tokenClass;
		},
		index = 0,
		regex = "";
		
		// Build the regex
		Object.keys(tokens).forEach(function(key) {
			var tokenizer = tokens[key];
			
			if (index > 0) { 
				regex += '|';
			}
			
			regex += '(' + tokenizer.source + ')'; // capture separating tokens for classification
			index++;
		});
		
		// Tokenize the source string
		var
		tokenized = src.split(new RegExp(regex)),
		named = [];
		for (var i = 0; i < tokenized.length; i++) {
			var token = tokenized[i];
			if (token) { // skip undef and empty string
				named.push({
					symbol: token,
					type: classify(token)
				});
			}
		}
		
		return named; // tokens as classified symbols
	},
	
	/* A recursive descent parser */
	parse: function(srcOrTokens) {
		var tokens;
		if (Object.prototype.toString.call(srcOrTokens) === '[object Array]') { // parsing tokens
			tokens = srcOrTokens;
		}
		else {
			tokens = this.tokenize(srcOrTokens); // parsing source string
		}
		
		var
		enumerator = 0, // assign unique node IDs
		node = function() {
			this.id = enumerator++; // for debugging
			this.data = "";
			this.branchlength = 0;
			this.children = [];
		},
		children = [],
		currnode = null, // created on ( or ,
		currtok = tokens.shift(),
		hierStack = [], // stack of parent nodes, initially contains only the unnamed root
		deferredName = "", // names are optional and proceed their creation event (stored as data)
		deferredLength = 0, // same for branch lengths
		lastPop = null,
		
		// Parser utils
		accept = function(symbol) {
			if (currtok.type === symbol) {
				var returnSym = currtok.symbol;
				currtok = tokens.shift();
				return returnSym;
			}
			
			return false;
		},
		expect = function(symbol) {
			var returnSym = currtok.symbol;
			if (accept(symbol)) {
				return returnSym;
			}
			
			throw new Error("Unexpected symbol " + returnSym);
		},
		
		// Begin production rules
		length = function() {
			if (accept(':')) {
				deferredLength = expect('NUMBER');
			}
			else {
				throw new Error('Expected length, got ' + currtok.symbol);
			}
		},
		name = function() {
			var nodename = currtok.symbol;
			if (accept('STRING') || accept('NUMBER')) {
				deferredName = nodename;
			}
			// EMPTY
		},
		branch = function() {
			subtree();
			length();
		},
		branchset = function() {
			branch();
			while (accept(',')) {
				var childnode = new node();
				if (deferredName) {
					childnode.data = deferredName; // TODO: make the distinction later
					deferredName = "";
				}
				if (deferredLength) {
					childnode.branchlength = deferredLength;
					deferredLength = 0;
				}
				
				currnode.addChild(childnode);
				
				branch();
			}
		},
		internal = function() {
			if (accept('(')) {
				currnode = new node();
				hierStack.push(currnode);
				branchset();
				expect(')');
				
				var popped;
				if (hierStack.length > 1) {
					var childnode = new node();
					if (deferredName) {
						childnode.data = deferredName;
						deferredName = "";
					}
					if (deferredLength) {
						childnode.branchlength = deferredLength;
						deferredLength = 0;
					}
					currnode.addChild(childnode);
					popped = hierStack.pop();
					lastPopped = popped;
				}
				else {
					if (deferredName) {
						lastPopped.data = deferredName;
						deferredName = "";
					}
					if (deferredLength) {
						lastPopped.branchlength = deferredLength;
						deferredLength = 0;
					}
				}
				
				currnode = hierStack[hierStack.length-1];
				if (popped) {
					currnode.addChild(popped);
				}
				
				name();
			}
			else {
				throw new Error("Expected (");
			}
		},
		leaf = function() {
			name();
		},
		subtree = function() {
			if (currtok.symbol === '(') {
				internal();
			}
			else {
				leaf();
			}
		},
		tree = function() { //FIXME: ambiguous... need a longer lookahead
			if (currtok.symbol === '(') {
				subtree();
			}
			else {
				branch();
			}
			
			expect(';');
			if (deferredName) { // name for the root of the tree
				currnode.data = deferredName;
			}
			
			return currnode;
		},
		file = function() {
			return tree();
		};
		
		node.prototype.addChild = function(n) { // tree may be large so conserve mem by adding function to proto
			this.children.push(n);
		}
		
		return file();
	}
};

nwk.converter = {};
nwk.converter.convert2oz = function() {
	var ozNode = function() { // node structure as used by OneZoom
		this.cname = null; // common name
		this.name1 = null; // genus
		this.name2 = null; // species
		this.lengthbr = null; // branch length (Mya)
		this.phylogenetic_diversity = 0.0;
		this.child1 = null;
		this.child2 = null;
		this.popstab = "U";  // One of U, I, S, D
		this.redlist = "NE"; // One of EX, EW, CR, EN, VU, NT, LC, DD, NE
	};
	
	console.log("Converting");
	//TODO
};

// Test
//var src = "(A{common_A}:0.1,B{common_B}:0.2,(C{common_C}:0.3,D{common_D}:0.4)E{common_E}:0.5)F{common_F};";
var src = "(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F;";
var tree = nwk.parser.parse(src);
traverse(tree, function(node) {
	if (node.children.length === 0) {
		console.log(node.data + " has no children");
	}
	else {
		for (var i = 0; i < node.children.length; i++) {
			var child = node.children[i];
			
			console.log(node.data + " has child " + child.data + " with branch length " + child.branchlength);
		}
	}
});

console.log("Done with parse");

function traverse(tree, callback) {
	console.log("Traversing node " + tree.id);
	callback(tree);
	for (var i = 0; i < tree.children.length; i++) {
		traverse(tree.children[i], callback);
	}
}

/*
Symbols:
(
A
{
common_A
}
:
0.1
,
B
{
common_B
}
:
0.2
,
(
C
{
common_C
}
:
0.3
,
D
{
common_d
}
:
0.4
)
E
{
common_E
}
:
0.5
)
F
{
common_F
}
;
*/


