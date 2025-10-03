export const LANGUAGES = [
  {
    id: 'html',
    name: 'HTML',
    monacoLanguage: 'html',
    extension: '.html',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to my page</p>
</body>
</html>`,
    supportsExecution: true,
    executionType: 'browser'
  },
  {
    id: 'css',
    name: 'CSS',
    monacoLanguage: 'css',
    extension: '.css',
    defaultCode: `body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 50px;
}

h1 {
    font-size: 3em;
    margin: 0;
}`,
    supportsExecution: true,
    executionType: 'browser'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    monacoLanguage: 'javascript',
    extension: '.js',
    defaultCode: `console.log('Hello World!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));

document.body.innerHTML = '<h1>JavaScript is running!</h1>';`,
    supportsExecution: true,
    executionType: 'browser'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    monacoLanguage: 'typescript',
    extension: '.ts',
    defaultCode: `interface Person {
    name: string;
    age: number;
}

function greet(person: Person): string {
    return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

const user: Person = { name: 'Alice', age: 25 };
console.log(greet(user));`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'python',
    name: 'Python',
    monacoLanguage: 'python',
    extension: '.py',
    defaultCode: `def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'java',
    name: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1-10: " + sum);
    }
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'cpp',
    name: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    defaultCode: `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello, World!" << std::endl;

    std::vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    std::cout << "Sum: " << sum << std::endl;

    return 0;
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'c',
    name: 'C',
    monacoLanguage: 'c',
    extension: '.c',
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");

    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("Sum of 1-10: %d\\n", sum);

    return 0;
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'go',
    name: 'Go',
    monacoLanguage: 'go',
    extension: '.go',
    defaultCode: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")

    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    fmt.Printf("Sum: %d\\n", sum)
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'rust',
    name: 'Rust',
    monacoLanguage: 'rust',
    extension: '.rs',
    defaultCode: `fn main() {
    println!("Hello, World!");

    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'php',
    name: 'PHP',
    monacoLanguage: 'php',
    extension: '.php',
    defaultCode: `<?php

function greet($name) {
    return "Hello, $name!";
}

echo greet("World") . "\\n";

$numbers = [1, 2, 3, 4, 5];
$sum = array_sum($numbers);
echo "Sum: $sum\\n";

?>`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    monacoLanguage: 'ruby',
    extension: '.rb',
    defaultCode: `def greet(name)
  "Hello, #{name}!"
end

puts greet("World")

numbers = [1, 2, 3, 4, 5]
sum = numbers.sum
puts "Sum: #{sum}"`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'swift',
    name: 'Swift',
    monacoLanguage: 'swift',
    extension: '.swift',
    defaultCode: `import Foundation

func greet(_ name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet("World"))

let numbers = [1, 2, 3, 4, 5]
let sum = numbers.reduce(0, +)
print("Sum: \\(sum)")`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    monacoLanguage: 'kotlin',
    extension: '.kt',
    defaultCode: `fun greet(name: String): String {
    return "Hello, $name!"
}

fun main() {
    println(greet("World"))

    val numbers = listOf(1, 2, 3, 4, 5)
    val sum = numbers.sum()
    println("Sum: $sum")
}`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'r',
    name: 'R',
    monacoLanguage: 'r',
    extension: '.r',
    defaultCode: `greet <- function(name) {
  paste("Hello,", name, "!")
}

print(greet("World"))

numbers <- c(1, 2, 3, 4, 5)
sum_result <- sum(numbers)
print(paste("Sum:", sum_result))`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'sql',
    name: 'SQL',
    monacoLanguage: 'sql',
    extension: '.sql',
    defaultCode: `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
);

INSERT INTO users (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com');

SELECT * FROM users;`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'bash',
    name: 'Bash',
    monacoLanguage: 'shell',
    extension: '.sh',
    defaultCode: `#!/bin/bash

echo "Hello, World!"

sum=0
for i in {1..10}; do
    sum=$((sum + i))
done
echo "Sum of 1-10: $sum"`,
    supportsExecution: true,
    executionType: 'server'
  },
  {
    id: 'json',
    name: 'JSON',
    monacoLanguage: 'json',
    extension: '.json',
    defaultCode: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "hobbies": ["reading", "coding", "gaming"],
  "address": {
    "city": "New York",
    "country": "USA"
  }
}`,
    supportsExecution: false,
    executionType: null
  },
  {
    id: 'xml',
    name: 'XML',
    monacoLanguage: 'xml',
    extension: '.xml',
    defaultCode: `<?xml version="1.0" encoding="UTF-8"?>
<person>
    <name>John Doe</name>
    <age>30</age>
    <email>john@example.com</email>
    <hobbies>
        <hobby>reading</hobby>
        <hobby>coding</hobby>
    </hobbies>
</person>`,
    supportsExecution: false,
    executionType: null
  },
  {
    id: 'markdown',
    name: 'Markdown',
    monacoLanguage: 'markdown',
    extension: '.md',
    defaultCode: `# Hello World

This is a **markdown** document.

## Features

- Easy to write
- Easy to read
- Converts to HTML

\`\`\`javascript
console.log('Code blocks supported!');
\`\`\``,
    supportsExecution: false,
    executionType: null
  }
];

export function getLanguageById(id) {
  return LANGUAGES.find(lang => lang.id === id) || LANGUAGES[0];
}

export function getLanguagesByExecutionType(type) {
  return LANGUAGES.filter(lang => lang.executionType === type);
}
