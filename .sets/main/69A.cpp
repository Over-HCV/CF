// A. Young Physicist
// https://codeforces.com/problemset/problem/69/A
// Tiempo: 2000 ms | Memoria: 256 MB

#include <bits/stdc++.h>
using namespace std;
using ll = long long;

#ifdef LOCAL
#define dbg(x) cerr << #x << " = " << (x) << endl
#else
#define dbg(x)
#endif

// Idea: el cuerpo está en equilibrio si la suma de todas las fuerzas es el
// vector cero, es decir, si la suma de las x, la de las y y la de las z son 0.
void solve() {
    int n;
    cin >> n;
    int sx = 0, sy = 0, sz = 0;
    for (int i = 0; i < n; i++) {
        int x, y, z;
        cin >> x >> y >> z;
        sx += x;
        sy += y;
        sz += z;
    }
    dbg(sx); dbg(sy); dbg(sz);  // solo se ve en tu Mac
    cout << (sx == 0 && sy == 0 && sz == 0 ? "YES" : "NO") << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = 1;
    // cin >> t;  // este problema tiene un solo caso, por eso va comentado
    while (t--) solve();
}
