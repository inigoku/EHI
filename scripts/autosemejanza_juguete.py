#!/usr/bin/env python3
"""Modelo de juguete para la predicción 6 del capítulo 54.

Calcula, en sistemas de N = 9 unidades binarias con actualización paralela
estocástica, el perfil de irreducibilidad por niveles:

  nivel 0: las 9 unidades.
  nivel 1: 3 variables macro (mayoría de cada bloque de 3 unidades), con la
           dinámica inducida por la distribución estacionaria.

Irreducibilidad de un corte (partición A|B):
  I(A|B) = sum_x pi(x) sum_x' T(x'|x) ln[ T(x'|x) / (qA(x'_A|x_A) qB(x'_B|x_B)) ]
con q las dinámicas de cada parte marginalizadas sobre el estacionario
(variante geométrica de Φ). I_min es el mínimo sobre bipartición; r se
normaliza por ln |X| del nivel.

    python3 scripts/autosemejanza_juguete.py
"""
import itertools
import numpy as np

N = 9
BLOCKS = [(0, 1, 2), (3, 4, 5), (6, 7, 8)]


def transition(W, h, beta=1.0):
    """T[x, x'] con P(x'_i = 1 | x) = sigmoide(beta (h_i + sum_j W_ij s_j))."""
    n = W.shape[0]
    states = np.arange(2 ** n)
    bits = ((states[:, None] >> np.arange(n)[None, :]) & 1).astype(float)  # (S, n)
    s = 2 * bits - 1
    p1 = 1 / (1 + np.exp(-beta * (h[None, :] + s @ W.T)))                 # (S, n)
    T = np.ones((2 ** n, 2 ** n))
    for i in range(n):
        xi = bits[None, :, i]                                              # (1, S) estados x'
        T *= np.where(xi == 1, p1[:, i:i + 1], 1 - p1[:, i:i + 1])
    return T


def stationary(T, iters=4000):
    pi = np.full(T.shape[0], 1 / T.shape[0])
    for _ in range(iters):
        new = pi @ T
        if np.abs(new - pi).max() < 1e-13:
            break
        pi = new
    return pi / pi.sum()


def cut_kl(J, pi, n, mask):
    """KL del corte definido por 'mask' (unidades de A) para la conjunta J[x, x']."""
    S = 2 ** n
    X = np.arange(S)[:, None]
    XP = np.arange(S)[None, :]
    total = 0.0
    logq = np.zeros_like(J)
    for m in (mask, (S - 1) ^ mask):
        idx = ((X & m) * S + (XP & m)).ravel()
        Jm = np.bincount(idx, weights=J.ravel(), minlength=S * S).reshape(S, S)
        pim = Jm.sum(axis=1)
        with np.errstate(divide="ignore", invalid="ignore"):
            q = np.where(pim[:, None] > 0, Jm / pim[:, None], 0.0)
        qfull = q[(X & m), (XP & m)]
        with np.errstate(divide="ignore"):
            logq += np.log(np.where(qfull > 0, qfull, 1.0))
    with np.errstate(divide="ignore", invalid="ignore"):
        logT = np.log(np.where(J > 0, J / pi[:, None], 1.0))
    total = float((J * (logT - logq)).sum())
    return total


def i_min(J, pi, n, allowed_masks=None):
    S = 2 ** n
    best = None
    masks = allowed_masks if allowed_masks is not None else [
        m for m in range(1, S // 2 + S // 2) if (m & 1) and m != S - 1]
    for m in masks:
        v = cut_kl(J, pi, n, m)
        if best is None or v < best[0]:
            best = (v, m)
    return best


def macro(J, pi):
    """Dinámica inducida por la mayoría de cada bloque."""
    S = 2 ** N
    y = np.zeros(S, dtype=int)
    for k, blk in enumerate(BLOCKS):
        cnt = sum(((np.arange(S) >> i) & 1) for i in blk)
        y |= (cnt >= 2).astype(int) << k
    Jy = np.zeros((8, 8))
    np.add.at(Jy, (y[:, None].repeat(S, 1), y[None, :].repeat(S, 0)), J)
    piy = Jy.sum(axis=1)
    return Jy, piy


def architectures():
    W = {}
    h = np.zeros(N)
    W["A independientes"] = np.zeros((N, N))
    g = 1.0
    M = np.full((N, N), g / (N - 1)); np.fill_diagonal(M, 0)
    W["B campo medio débil (agregativo)"] = M
    M = np.zeros((N, N))
    for i in range(N):
        M[i, (i + 1) % N] = M[i, (i - 1) % N] = g
    W["C anillo local (agregativo)"] = M
    M = np.zeros((N, N))
    for i in range(N):
        for j in range(N):
            if i == j:
                continue
            M[i, j] = 1.5 if i // 3 == j // 3 else 0.35
    W["D modular jerárquico"] = M
    M = np.full((N, N), 3.0 / (N - 1)); np.fill_diagonal(M, 0)
    W["E global fuerte"] = M
    return W, h


def main():
    W, h = architectures()
    block_masks = [sum(1 << i for i in blk) for blk in BLOCKS]
    # cortes que respetan los bloques: A = un bloque, o dos bloques (equivale al complemento)
    block_cuts = [m for m in block_masks if m & 1] or []
    block_cuts = [m for m in {block_masks[0], block_masks[1], block_masks[2],
                              block_masks[0] | block_masks[1],
                              block_masks[0] | block_masks[2],
                              block_masks[1] | block_masks[2]} if m & 1]
    print(f"{'sistema':38s} {'r0 (micro)':>11s} {'r0 (cortes por bloque)':>23s} {'r1 (macro)':>11s} {'A=min(r0,r1)':>13s}")
    for name, Wm in W.items():
        T = transition(Wm, h)
        pi = stationary(T)
        J = pi[:, None] * T
        v0, _ = i_min(J, pi, N)
        vb, _ = i_min(J, pi, N, block_cuts)
        Jy, piy = macro(J, pi)
        v1, _ = i_min(Jy, piy, 3, [1, 3, 5])   # bipartición de 3 unidades con la 0 en A
        r0 = v0 / (N * np.log(2))
        rb = vb / (N * np.log(2))
        r1 = v1 / (3 * np.log(2))
        print(f"{name:38s} {r0:11.4f} {rb:23.4f} {r1:11.4f} {min(r0, r1):13.4f}")


if __name__ == "__main__":
    main()
