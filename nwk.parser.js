/*
* A newick parser specialized for OneZoom style nwk strings
* Author: Bremen Braun for TimeTree (www.timetree.org), 2013
*
* FIXME: possible shift/reduce conflict (take action shift)
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
		accept = function(symbol) {
		
		},
		expect = function(symbol) {
		
		},
		
		/* begin production acceptors */
		length = function() {
		
		},
		commonName = function() {
		
		},
		name = function() {
		
		},
		branch = function() {
		
		},
		branchset = function() {
		
		},
		internal = function() {
		
		},
		leaf = function() {
		
		},
		subtree = function() {
		
		},
		tree = function() {
		
		},
		file = function() {
		
		};
		
		//TODO
	}
};

// Test
var src = "(A{common_A}:0.1,B{common_B}:0.2,(C{common_C}:0.3,D{common_D}:0.4)E{common_E}:0.5)F{common_F};";
nwk.parser.parse(src);
console.log("DONE");