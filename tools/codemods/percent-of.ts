// tools/codemods/percent-of.ts
// pnpm tsx tools/codemods/percent-of.ts         – пробний запуск, звіт
// pnpm tsx tools/codemods/percent-of.ts --write – застосувати
import { Node, Project, SyntaxKind } from "ts-morph";

const write = process.argv.includes("--write");
const project = new Project({ tsConfigFilePath: "tsconfig.base.json" });
const changed: string[] = [];
const manual: string[] = [];

for (const file of project.getSourceFiles("apps/*/src/**/*.{ts,tsx}")) {
  const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((c) => c.getExpression().getText() === "Math.round")
    .reverse();              // з кінця файлу: заміни не зсувають вузли
  let touched = false;
  for (const call of calls) {
    const where = `${file.getBaseName()}:${call.getStartLineNumber()}`;
    const mul = call.getArguments()[0];
    if (!mul || !Node.isBinaryExpression(mul)
        || mul.getOperatorToken().getText() !== "*"
        || mul.getRight().getText() !== "100") continue;
    const left = mul.getLeft();
    const div = Node.isParenthesizedExpression(left)
      ? left.getExpression() : left;
    if (!Node.isBinaryExpression(div)
        || div.getOperatorToken().getText() !== "/") {
      manual.push(where); continue;  // інша форма: на розгляд людині
    }
    const a = div.getLeft().getText(), b = div.getRight().getText();
    call.replaceWithText(`percentOf(${a}, ${b})`);
    changed.push(where); touched = true;
  }
  if (touched && !file.getImportDeclaration("@roombook/shared")) {
    file.addImportDeclaration({
      moduleSpecifier: "@roombook/shared",
      namedImports: ["percentOf"],
    });
  }
}
console.log(`змінено: ${changed.length}; вручну: ${manual.length}`);
manual.forEach((m) => console.log(`  вручну ${m}`));
if (write) project.saveSync();
