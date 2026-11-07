# B. Rhythmic String

**Tiempo:** 2 seconds · **Memoria:** 512 megabytes · [Ver en Codeforces](https://codeforces.com/problemset/problem/2283/B)

We call a binary string $s$ of length $m$ *periodic* if there exists an integer $k$ ($1 \le k  \lt  m$) such that $s_i = s_{i+k}$ for every $i$ from $1$ to $m-k$ inclusive. The characters of the string are numbered starting from $1$. The smallest such $k$ is called the *period* of the string.

We call a string $s$ *rhythmic* if it is periodic and among the first $p$ characters of the string (where $p$ is the period of the string), there is exactly one `1`.

For example, the string `0010010` is periodic with period $p=3$ and rhythmic: among the first three characters there is exactly one `1`. The string `0110110` is also periodic with period $p=3$, but it is not rhythmic: among the first three characters there are two `1`s.

You are given an array $a$ of $n$ integers and a string $s$, initially consisting of $10^{18}$ zeros. For each element $a_i$, all characters of the string whose indices are divisible by $a_i$ are replaced by ones. In other words, the characters at positions $a_i,2a_i,3a_i,\ldots$, not exceeding the length of the string, become ones. Replacing a character with one again does nothing.

For example, if $a=[3,7,5,3]$, then the string $s$ will begin with `001011101101011...`

Before performing these changes, you may remove any elements from array $a$. Find the minimum number of elements that need to be removed so that the resulting string $s$ is rhythmic.

## Input

The first line contains an integer $t$ ($1 \le t \le 5000$) — the number of test cases.

The following descriptions of the test cases follow.

The first line of each test case contains an integer $n$ ($1 \le n \le 5000$) — the length of array $a$.

The second line of each test case contains $n$ integers $a_1,a_2,\ldots,a_n$ ($1 \le a_i \le 10^9$) — the elements of the array.

Additional constraints on the input:

- the sum of $n$ over all test cases does not exceed $5000$.

## Output

For each test case, output one integer — the minimum number of elements that need to be removed from the array so that string $s$ is rhythmic.

## Ejemplos

**Entrada 1**

```
4
4
3 7 5 3
3
4 8 12
4
6 10 20 30
3
2 3 5
```

**Salida 1**

```
2
0
1
2
```

## Note

In the first test case, you can remove elements $7$ and $5$. Then the string will begin with `001001001...` and will be rhythmic with period $3$.

In the second test case, nothing needs to be removed. The string will begin with `000100010001...` and will be rhythmic with period $4$.

In the third test case, it is enough to remove element $6$. The resulting string will be rhythmic with period $10$.

In the fourth test case, you need to keep any one element of the array.
