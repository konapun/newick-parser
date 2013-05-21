/*
* OneZoom uses a superset of standard NWK for placing latin names, common names, and conservation info into the tree
* Author: Bremen Braun for TimeTree (www.timetree.org), 2013
*
*/
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
  ;
tree
  : subtree ';'
  | branch ';'
  ;
subtree
  : leaf
  | internal
  ;
leaf
  : name
  ;
internal
  : '(' branchset ')' name
  ;
branchset
  : branch
  | branchset ',' branch
  ;
branch
  : subtree length
  ;
name
  : STRING commonname
  | NUMBER commonname
  | commonname
  ;
commonname
  : /* EMPTY */
  | LCURL name RCURL
  ;
length
  : /* EMPTY */
  | ':' NUMBER
  ;
