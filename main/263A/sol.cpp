// A. Beautiful Matrix
// https://codeforces.com/problemset/problem/263/A
// Tiempo: 2000 ms | Memoria: 256 MB

#include <bits/stdc++.h>
using namespace std;
using ll = long long;

#ifdef LOCAL
    #define dbg(x) cerr << #x << " = " << (x) << endl
#else
    #define dbg(x)
#endif

void solve() {
    int a, b, c, d, e;
    for (int i = -2; i < 3; i++) {
        cin >> a >> b >> c >> d >> e;
        // Si no hay datos seguir (+: disyunción)
        if (a+b+c+d+e==0) continue;
        // Por simetría la suma de extremos tiene el mismo peso
        if (a+e == 1) { cout << 2 + abs(i) << '\n'; break; }
        if (b+d == 1) { cout << 1 + abs(i) << '\n'; break; }
        if (c == 1) { cout << abs(i) << '\n'; break; }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = 1;
    // cin >> t;  // dejar si hay varios casos
    while (t--) solve();
}
