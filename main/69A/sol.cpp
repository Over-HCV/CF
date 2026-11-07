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

void solve() {
    int n;
    cin >> n;
    int X = 0, Y = 0, Z = 0;
    for (int i = 0; i < n; i++) {
        int x, y, z;
        cin >> x >> y >> z;
        X += x;
        Y += y;
        Z += z;
    }
    cout << (X == 0 && Y == 0 && Z == 0 ? "YES" : "NO") << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = 1;
    // cin >> t;  // dejar si hay varios casos
    while (t--) solve();
}
