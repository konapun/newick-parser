%lex
%%
\s+                                { /* skip */        }
"("                                { return '(';       }
")"                                { return ')';       }
"{"                                { return 'LCURL';   } /* Modification to grammar for OneZoom */
"}"                                { return 'RCURL';   } /* Modification to grammar for OneZoom */
":"                                { return ':';       }
";"                                { return ';';       }
","                                { return ',';       }
\d+\.*\d*                          { return 'NUMBER';  }
[a-zA-Z_\+\.\\\-\d'\s\[\]\*/]+     { return 'STRING';  } /* This character class may be incomplete */
<<EOF>>                            { return 'EOF';     }
/lex

%%
file
  : tree EOF
  {
    return $tree;
  }
  ;
tree
  : subtree ';'
  {
    return $subtree;
  }
  | branch ';'
  {
    return $branch;
  }
  ;
subtree
  : leaf
  {
    return $leaf;
  }
  | internal
  {
    return $internal;
  }
  ;
leaf
  : name
  %{
	var midnode = function() {
		this.linkclick = false;
		this.phylogenetic_diversity = 0.0;
		this.lengthbr = null;
		this.cname = null;
		this.name1 = null;
		this.name2 = null;
		this.child1 = null;
		this.child2 = null;
		this.richness_val = 0;
		this.popstab = "U"; // unknown
		this.redlist = "NE"; // not evaluated
	};
	
	$$ = new midnode();
	return $$;
  %}
  ;
internal
  : '(' branchset ')' name
  %{
	var midnode = function() {
		this.linkclick = false;
		this.phylogenetic_diversity = 0.0;
		this.lengthbr = null;
		this.cname = null;
		this.name1 = null;
		this.name2 = null;
		this.child1 = null;
		this.child2 = null;
		this.richness_val = 0;
		this.popstab = "U"; // unknown
		this.redlist = "NE"; // not evaluated
	};
	
    $$.child1 = new midnode();
	return $$.child1;
  %}
  ;
branchset
  : branch
  {
    return $branch;
  }
  | branchset ',' branch
  ;
branch
  : subtree length
  ;
name
  : STRING commonname
  {
    /* This may fall through to commonname on $1 */
    $$.name1 = $1;
  }
  | NUMBER commonname
  {
    $$.name1 = $1;
  }
  | commonname
  ;
commonname
  : /* EMPTY */
  | LCURL name RCURL
  {
	// This stuff doesn't exactly fit into a regular grammar so we need a custom action here
	var name = $2,
        modparts = name.match(/_(\D\D)_(\D)/);
	if (modparts) {
		var conserv = modparts[1],
		    stability = modparts[2];
		
		$$.popstab = stability;
		$$.redlist = conserv;
	}
	
    $$.cname = name;
  }
  ;
length
  : /* EMPTY */
  | ':' NUMBER
  {
    console.log("Setting lengthbr to " + yytext);
	$$.lengthbr = yytext;
  }
  ;
