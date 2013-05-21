%lex
%%
\s+                                { /* skip */        }
"("                                { return '(';       }
")"                                { return ')';       }
":"                                { return ':';       }
";"                                { return ';';       }
","                                { return ',';       }
\d+\.*\d*                          { return 'NUMBER';  }
[a-zA-Z_\+\.\\\-\d'{}\s\[\]\*/]+   { return 'STRING';  } /* This character class may be incomplete */
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
  : /* EMPTY */
  | STRING
  ;
length
  : /* EMPTY */
  | ':' NUMBER
  ;
