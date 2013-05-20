var nwk = {};
nwk.parser = {
	tokenize: function(src) {
		var tokens = {
			'(': /\(/,
			')': /\)/,
			'{': /{/,
			'}': /}/,
			':': /:/,
			';': /;/,
			',': /,/,
			'NUMBER': /\d\.*\d*/,
			'STRING': /[a-zA-Z_\+\.\\\-\d'\s\[\]\*/]+/,
		},
		classify = function(tkn) {
			console.log("Classifying token \"" + tkn + "\"");
			Object.keys(tokens).forEach(function(key) {
				var classifier = new RegExp(tokens[key]);
				
				if (tkn.match(classifier)) {
					return key;
				}
			});
		},
		index = 0,
		regex = "";
		
		// Build the regex
		Object.keys(tokens).forEach(function(key) {
			var tokenizer = tokens[key];
			
			if (index > 0) { 
				regex += '|';
			}
			
			regex += '(' + tokenizer.source + ')';
			index++;
		});
		
		// Tokenize the source string
		var
		tokenized = src.split(new RegExp(regex)),
		named = [];
		for (var i = 0; i < tokenized.length; i++) {
			var token = tokenized[i];
			if (token) { // skip undef and empty string
				console.log(token);
				named.push({
					symbol: token,
					type: classify(token)
				});
			}
		}
		
		return named; // tokens as classified symbols
	},
	parse: function(src) {
		var tokens = this.tokenize(src);
		
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			switch(token.type) {
				default:
					console.log("Switch on " + token.symbol);
			}
		}
	}
};

var src = "(A{common_A}:0.1,B{common_B}:0.2,(C{common_C}:0.3,D{common_D}:0.4)E{common_E}:0.5)F{common_F};";
nwk.parser.parse(src);
console.log("DONE");