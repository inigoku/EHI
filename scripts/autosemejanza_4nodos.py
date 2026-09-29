#!/usr/bin/env python3
"""Réplica de la simulación de 4 nodos binarios para A(S) = I_min * C * Iso.

El modelo (reglas de transición de Mandelbrot, Hormiguero y Cerebro) y las
fórmulas de I_min, C e Iso son las aportadas por un colaborador externo; aquí
se reproducen sin cambios y se añaden tres comprobaciones:

  1. I_min sobre todas las biparticiones, no solo {1,2 | 3,4}.
  2. Iso con la mejor alineación posible de estados (permutaciones).
  3. Sensibilidad: qué ocurre al variar el acoplamiento del hormiguero (eps)
     y el intermodular del cerebro (beta).

    python3 scripts/autosemejanza_4nodos.py
"""
import itertools
import numpy as np
from itertools import product

states = np.array(list(product([0, 1], repeat=4)))

def build_matrix(mode):
    P = np.zeros((16, 16))
    for i, x in enumerate(states):
        x1, x2, x3, x4 = x
        if mode == "Mandelbrot":
            eps = 0.10
            q = [(1 - eps)*(1 - xv) + eps*xv for xv in x]
        elif mode == "Hormiguero":
            eps, eta = 0.05, 0.10
            q = [
                (1 - eps)*((1 - eta)*(1 - x[v]) + eta*x[v])
                + eps*(np.sum(np.delete(x, v)) / 3.0)
                for v in range(4)
            ]
        elif mode == "Cerebro":
            beta, gamma = 0.50, 0.05
            M1, M2 = max(x1, x2), max(x3, x4)
            q = [
                (1 - gamma)*((1 - beta)*(1 - x2) + beta*(1 - M2)) + gamma/2,
                (1 - gamma)*((1 - beta)*x1       + beta*(1 - M2)) + gamma/2,
                (1 - gamma)*((1 - beta)*(1 - x4) + beta*M1)       + gamma/2,
                (1 - gamma)*((1 - beta)*x3       + beta*M1)       + gamma/2,
            ]
        for j, xp in enumerate(states):
            prob = 1.0
            for v in range(4):
                prob *= (q[v] if xp[v] == 1 else (1.0 - q[v]))
            P[i, j] = prob
    return P

def compute_A(P):
    vals, vecs = np.linalg.eig(P.T)
    pi = np.real(vecs[:, np.argmin(np.abs(vals - 1.0))])
    pi = pi / np.sum(pi)
    pi_joint = pi.reshape(4, 4)
    pi_1 = np.sum(pi_joint, axis=1)
    pi_2 = np.sum(pi_joint, axis=0)
    C = 0.0
    for s1 in range(4):
        for s2 in range(4):
            if pi_joint[s1, s2] > 1e-15:
                C += pi_joint[s1, s2] * np.log2(pi_joint[s1, s2] / (pi_1[s1] * pi_2[s2]))
    P4 = P.reshape(4, 4, 4, 4)
    p1 = np.zeros((4, 4)); p2 = np.zeros((4, 4))
    for s1 in range(4):
        for s1p in range(4):
            p1[s1, s1p] = np.sum([ (pi_joint[s1, s2] / pi_1[s1]) * np.sum(P4[s1, s2, s1p, :]) for s2 in range(4) ])
    for s2 in range(4):
        for s2p in range(4):
            p2[s2, s2p] = np.sum([ (pi_joint[s1, s2] / pi_2[s2]) * np.sum(P4[s1, s2, :, s2p]) for s1 in range(4) ])
    I_min = 0.0
    for s1 in range(4):
        for s2 in range(4):
            for s1p in range(4):
                for s2p in range(4):
                    p_real = P4[s1, s2, s1p, s2p]
                    p_desc = p1[s1, s1p] * p2[s2, s2p]
                    if p_real > 1e-15 and p_desc > 1e-15:
                        I_min += pi_joint[s1, s2] * p_real * np.log2(p_real / p_desc)
    p_macro = np.zeros((4, 4)); pi_macro = np.zeros(4)
    for idx, x in enumerate(states):
        m = (max(x[0], x[1]) * 2) + max(x[2], x[3])
        pi_macro[m] += pi[idx]
    for i, x in enumerate(states):
        m = (max(x[0], x[1]) * 2) + max(x[2], x[3])
        for j, xp in enumerate(states):
            mp = (max(xp[0], xp[1]) * 2) + max(xp[2], xp[3])
            p_macro[m, mp] += (pi[i] / pi_macro[m]) * P[i, j]
    iso1 = max(0.0, np.corrcoef(p_macro.flatten(), p1.flatten())[0, 1])
    iso2 = max(0.0, np.corrcoef(p_macro.flatten(), p2.flatten())[0, 1])
    Iso = 0.5 * (iso1 + iso2)
    A = I_min * C * Iso
    return I_min, C, Iso, A, pi, p_macro, p1, p2



S = 16

def _cutkl(J, pi, m):
    X = np.arange(S)[:, None]; XP = np.arange(S)[None, :]; lq = np.zeros_like(J)
    for mm in (m, (S - 1) ^ m):
        idx = ((X & mm) * S + (XP & mm)).ravel()
        Jm = np.bincount(idx, weights=J.ravel(), minlength=S * S).reshape(S, S); pm = Jm.sum(1)
        q = np.where(pm[:, None] > 0, Jm / np.where(pm[:, None] > 0, pm[:, None], 1), 0)[(X & mm), (XP & mm)]
        lq += np.log2(np.where(q > 0, q, 1))
    return float((J * (np.log2(np.where(J > 0, J / pi[:, None], 1)) - lq)).sum())

def _stat(P):
    vals, vecs = np.linalg.eig(P.T)
    pi = np.real(vecs[:, np.argmin(np.abs(vals - 1))]); return pi / pi.sum()

def _iso_perm(Pm, Pl):
    best = 0
    for perm in itertools.permutations(range(4)):
        Q = Pl[np.ix_(perm, perm)]
        if Pm.std() < 1e-12 or Q.std() < 1e-12: continue
        best = max(best, np.corrcoef(Pm.ravel(), Q.ravel())[0, 1])
    return best

def build_custom(qfun):
    P = np.zeros((16, 16))
    for i, x in enumerate(states):
        q = qfun(x)
        for j, xp in enumerate(states):
            pr = 1.0
            for v in range(4): pr *= q[v] if xp[v] == 1 else 1 - q[v]
            P[i, j] = pr
    return P

def horm(eps, eta=0.10):
    return lambda x: [(1-eps)*((1-eta)*(1-x[v])+eta*x[v])+eps*(np.sum(np.delete(x, v))/3.0) for v in range(4)]

def cer(beta, gamma=0.05):
    def f(x):
        x1, x2, x3, x4 = x; M1, M2 = max(x1, x2), max(x3, x4)
        return [(1-gamma)*((1-beta)*(1-x2)+beta*(1-M2))+gamma/2, (1-gamma)*((1-beta)*x1+beta*(1-M2))+gamma/2,
                (1-gamma)*((1-beta)*(1-x4)+beta*M1)+gamma/2, (1-gamma)*((1-beta)*x3+beta*M1)+gamma/2]
    return f

def line(name, P):
    I, C, Iso, A, pi, pm, p1, p2 = compute_A(P)
    print(f"{name:34s} I_min={I:.4f} C={C:.4f} Iso={Iso:.3f} A={A:.2e}")

if __name__ == "__main__":
    print("== Réplica (cifras del código original) ==")
    for m in ["Mandelbrot", "Hormiguero", "Cerebro"]:
        line(m, build_matrix(m))
    print("== 1) I_min: corte {12|34} frente al mínimo sobre todas las biparticiones ==")
    for m in ["Mandelbrot", "Hormiguero", "Cerebro"]:
        P = build_matrix(m); pi = _stat(P); J = pi[:, None] * P
        r = {k: _cutkl(J, pi, k) for k in range(1, 15) if k & 8}
        print(f"{m:12s} {{12|34}}={r[12]:.5f}  mínimo={min(r.values()):.5f}")
    print("== 2) Iso con mejor permutación de estados ==")
    for m in ["Mandelbrot", "Hormiguero", "Cerebro"]:
        I, C, Iso, A, pi, pm, p1, p2 = compute_A(build_matrix(m))
        print(f"{m:12s} código={Iso:.3f}  mejor permutación={0.5*(_iso_perm(pm, p1)+_iso_perm(pm, p2)):.3f}")
    print("== 3) Sensibilidad ==")
    for e in (0.05, 0.2, 0.5, 0.8): line(f"Hormiguero eps={e}", build_custom(horm(e)))
    for b in (0.1, 0.3, 0.5, 0.8, 0.95): line(f"Cerebro beta={b}", build_custom(cer(b)))
