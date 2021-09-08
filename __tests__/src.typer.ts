import * as ts from 'typescript';
import parse from '../src/syntax/parser';
import typer, { Type } from '../src/syntax/typer';

describe('typing', () => {
  it('types combinators', () => {
    expect(typer(parse('something another-thing'))).toHaveLength(1);
    expect(typer(parse('something && another-thing'))).toHaveLength(1);
    expect(typer(parse('something || another-thing'))).toHaveLength(3);
    expect(typer(parse('something | another-thing'))).toHaveLength(2);
  });

  it('types components', () => {
    expect(typer(parse('something | 100 | <color>'))).toMatchObject([
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
      { type: Type.DataType },
    ]);
  });

  it('types optional components', () => {
    expect(typer(parse('something another-thing? | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something another-thing? yet-another-thing? | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something? another-thing yet-another-thing? | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something? another-thing? yet-another-thing | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something? another-thing? yet-another-thing? | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.StringLiteral },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something another-thing yet-another-thing? | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something another-thing? yet-another-thing | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.NumericLiteral },
    ]);
    expect(typer(parse('something? another-thing yet-another-thing | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.NumericLiteral },
    ]);
  });

  it('does not duplicate types', () => {
    expect(typer(parse('something? another-thing | something? another-thing | 100 | 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.StringLiteral },
      { type: Type.NumericLiteral },
    ]);
  });

  it('types optional group components', () => {
    expect(typer(parse('[ something another-thing ]? 100'))).toMatchObject([
      { type: Type.String },
      { type: Type.NumericLiteral },
    ]);
  });

  it('types number with range', () => {
    expect(typer(parse('<number [1,1000]>'))).toMatchObject([{ type: ts.SyntaxKind.NumberKeyword }]);
  });
});
