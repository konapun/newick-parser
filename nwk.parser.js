/*
* A newick hand-rolled tokenizer and recursive descent parser specialized for
* OneZoom style nwk strings (see grammar/grammar.specialized.gram)
*
* Author: Bremen Braun (konapun) for TimeTree (www.timetree.org), 2013
*/
var nwk = {};
nwk.parser = {
	tokenize: function(src) {
		var tokens = {
			'(': /\(/,
			')': /\)/,
			'{': /{/, // this is a modification specific to OneZoom
			'}': /}/, // ditto
			':': /:/,
			';': /;/,
			',': /,/,
			'NUMBER': /\d\.*\d*/,
			'STRING': /[a-zA-Z_\+\.\\\-\d'\s\[\]\*/]+/,
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
	parse: function(src) {
		var tokens = this.tokenize(src),
		
		node = function() { // This is the structure as dictated by OneZoom
			this.cname = null;
			this.name1 = null;
			this.name2 = null;
			this.lengthbr = null;
			this.phylogenetic_diversity = 0.0;
			this.child1 = null;
			this.child2 = null;
			this.popstab = "U";
			this.redlist = "NE";
		},
		currnode = new node(),
		currtok = tokens.shift(),
		
		// Parser utils
		accept = function(symbol) {
			if (currtok.type === symbol) {
				currtok = tokens.shift();
				return true;
			}
			return false;
		},
		expect = function(symbol) {
			if (accept(symbol)) {
				return true;
			}
			
			throw new Error("Unexpected symbol " + symbol.symbol);
		},
		
		// Begin production acceptors
		length = function() {
			if (accept(':')) {
				expect('NUMBER');
			}
			else {
				throw new Error('Expected length, got ' + currtok.symbol);
			}
		},
		commonName = function() {
			if (accept('{')) {
				name();
				expect('}');
			}
			// EMPTY
		},
		name = function() {
			if (accept('STRING')) {
				currnode.cname = name;
			}
			else if (accept('NUMBER')) {
				currnode.cname = name;
			}
			else {
				commonName();
			}
		},
		branch = function() {
			subtree();
			length();
		},
		branchset = function() {
			branch();
			while (accept(',')) {
				branch();
			}
		},
		internal = function() {
			if (accept('(')) {
				branchset();
				expect(')');
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
		tree = function() { //FIXME
			if (currtok.symbol === '(') {
				subtree();
			}
			else {
				branch();
			}
			
			expect(';');
		},
		file = function() {
			tree();
		};
		
		return file();
	}
};

// Test
//var src = "(A{common_A}:0.1,B{common_B}:0.2,(C{common_C}:0.3,D{common_D}:0.4)E{common_E}:0.5)F{common_F};";
var src = "(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F;";
nwk.parser.parse(src);
console.log("DONE");
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


