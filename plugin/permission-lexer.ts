export enum TokenKind {
  EOF,
  IDENTIFIER,
  LEFT_PARENTHESIS,
  RIGHT_PARENTHESIS,
  COMMA,
  AND,
  OR,
  NOT,
}
export type Token = {
  kind: TokenKind,
  humanKind: string,
  char: string,
}

type RuleHandle = (
  args: {
    tokens: Token[];
    match: string;
    advanceN: (val: number)=>void
  }
) => void;

type Rule = [RegExp, RuleHandle]

export const tokenizer = (
  code: string,
  rules: Rule[]
) => {
  let matched = false;
  let input = code;
  let pos = 0;
  const tokens:Token[] = [];
  const reminder = () => {
    return input.slice(pos);
  }
  const advanceN = (val: number) => {
    pos += val;
  }
  while(pos < input.length){
    for(const [regExp, handle] of rules) {
      if (regExp.test(input)) {
        matched = true;
      }
      const match = regExp.exec(reminder());
      if (!match) {
        continue
      }
      handle({tokens, match: match[0], advanceN });
      break;
    }
    if (!matched) {
      throw new Error(`Bad Input ${input}`);
    }
  }
  tokens.push({kind: TokenKind.EOF, humanKind: 'EOF', char: '0'});
  return tokens;
}

const defaultHandle = (kind: TokenKind)=>{
  return (({tokens, advanceN, match}) => {
    tokens.push({kind, char: match, humanKind: TokenKind[kind]});
    advanceN(match.length)
  }) as RuleHandle;
}
const skip:RuleHandle = ({match,advanceN}) => {
  advanceN(match.length);
}
export const rules: Rule[] = [
  [/^\ /, skip],
  [/^And|^&&|^AND|^\&/, defaultHandle(TokenKind.AND)],
  [/^Or|^\|\||^OR|^\|/, defaultHandle(TokenKind.OR)],
  [/^Not|^!|^NOT/, defaultHandle(TokenKind.NOT)],
  [/^Some/, defaultHandle(TokenKind.IDENTIFIER)],
  [/^Every/, defaultHandle(TokenKind.IDENTIFIER)],
  [/^Has/, defaultHandle(TokenKind.IDENTIFIER)],
  [/^\(/, defaultHandle(TokenKind.LEFT_PARENTHESIS)],
  [/^\)/, defaultHandle(TokenKind.RIGHT_PARENTHESIS)],
  [/^,/, defaultHandle(TokenKind.COMMA)],
  [/^[a-zA-Z_][a-zA-Z0-9_]*/, defaultHandle(TokenKind.IDENTIFIER)]
]