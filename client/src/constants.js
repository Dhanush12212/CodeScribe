export const LANGUAGE_VERSIONS = {
  java: "15.0.2",
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  csharp: "6.12.0",
  php: "8.2.3",
  c: "10.2.0", 
};

export const LANGUAGE_IDS = {
  C: 50,  
  java: 62,
  javascript: 63,
  typescript: 74,
  python: 71,
  csharp: 51,
  php: 68,
};

export const CODE_SNIPPETS = {
  java: `public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Start with Java");\n\t}\n}\n`,
  javascript: `function greet(name) {\n\tconsole.log("Start with " + name + "!");\n}\n\ngreet("JavaScript");\n`,
  typescript: `type Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Start with " + data.name + "!");\n}\n\ngreet({ name: "TypeScript" });\n`,
  python: `def greet(name):\n\tprint("Start with " + name + "!")\n\ngreet("Python")\n`,
  csharp:
    'using System;\n\nnamespace Main\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Start with C#");\n\t\t}\n\t}\n}\n',
  php: "<?php\n\n$run = 'Start with PHP';\necho $run;\n",
  C: `#include <stdio.h>\n\nint main() {\n\tprintf("Start with C!");\n\treturn 0;\n}\n`, 
};

export const THEMES = [
  { label: "Dark", value: "vs-dark" },
  { label: "Light", value: "light" },
  { label: "High Contrast Dark", value: "hc-black" },
  { label: "High Contrast Light", value: "hc-light" },
  { label: "Monokai", value: "monokai" },
];
