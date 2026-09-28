---
title: THE THREE OPEN DOORS
subtitle: (Bond, non-transferability and loss in the light of information theory)
section: PART THREE: THE LIMITS OF THE HORIZON
chapterNumber: 35
illustrationId: il_tres_puertas
illustrationTitle: The three doors
illustrationDescription: A dim corridor with three half-open doors. Through the first, two silhouettes joined by threads of light that stay taut as they move apart; through the second, a figure before a mirror that gives back a blurred reflection, different from her; through the third, a drop of ink dissolving into a dark sea. Watercolor and ink, indigo and gold tones.
---

At the end of the previous chapter, three doors were left open. I called them "doors" and not "problems" because on the other side of each lies a territory the horizon model can explore without postulating anything new. They are consequences of taking seriously the vocabulary of Shannon, mutual information and the no-cloning theorem, and following it as far as it goes.

What follows is a walk through all three.

---

## Door I: mutual information as the substrate of the bond

### The problem

Chapter 10 describes the time of the bond, and Chapter 12, entanglement. Both speak freely of the bond, but without defining it precisely. We know that two horizons can couple, that their joint Φ can exceed the sum of the individual ones and that time becomes denser when they are together. But how is a bond measured? Is there a quantity that lets us say one is deeper than another without resorting to metaphors?

Mutual information is that quantity. And it is literal: a standard measure in information theory, with well-defined mathematical properties.

### Definition and properties

The mutual information between two random variables X and Y is defined as:

I(X;Y) = H(X) + H(Y) − H(X,Y)

where H(X) is the entropy of X (its uncertainty), H(Y) that of Y and H(X,Y) the joint entropy. The formula is easy to read: mutual information is the reduction in uncertainty about one variable obtained by knowing the other. If X and Y are independent, it is zero; if they are perfectly correlated, it reaches its maximum.

Three properties make it especially suited to the horizon model.

**Symmetry.** I(X;Y) = I(Y;X). Mutual information does not distinguish who observes whom: it is, literally, a property of the relationship and not of the poles. This matches what Chapter 12 describes: entanglement is a shared geometry that belongs to neither of the two separately. And it clarifies something that chapter left half-said: the asymmetry of a bond (one person thinking about the other much more than the other thinks about them) lies not in the shared information, which is the same seen from each side, but in how much each pole integrates it. The same correlation can occupy half of one person's architecture and a corner of the other's.

**Non-negativity.** I(X;Y) ≥ 0. Knowing something about one system never increases, on average, the uncertainty about another. In this model, the bond cannot subtract: it adds or stays at zero.

**The data processing inequality.** If Z is obtained by processing Y, then I(X;Z) ≤ I(X;Y). No processing of one system's information can increase what it shares with another; it can only maintain or reduce it. What is shared degrades when transformed; it is never gained.

### Mutual information in the brain

Uri Hasson and his colleagues have measured the coupling between brains directly. In their experiments, one person tells a story while their brain activity is recorded; afterward, others listen to the recording while theirs is recorded. The coupling they measure is a correlation, a close relative of mutual information, and what they find is that the listener's activity does not merely follow the speaker's: in some regions it anticipates it, all the more the better the listener understands what they hear.

This means that what is shared is not only simultaneous: the listener has integrated so much of the speaker that they can predict him. Seen this way, the bond is an active predictive model. The deeper it is, the more shared information and the greater the capacity for anticipation.

This has a consequence for Chapter 12, which ends by saying that knowing someone deeply inscribes them in your architecture. That inscription is not metaphorical: it is the trace mutual information leaves in the architecture of the system.

### Mutual information and grief

Chapter 17 describes grief as the persistence of a predictive model after the other's death. Mutual information allows us to specify what that means.

When someone with whom one shared a deep bond dies, the mutual information does not disappear at once. The system that remains still contains in its architecture the correlations it built with the absent one. Those correlations persist, but they are no longer updated, because the other pole no longer responds.

It is a peculiar state: a high correlation with a system that no longer exists. The survivor keeps predicting the absent one, keeps generating expectations that are not confirmed, keeps integrating information that no longer has a referent. What used to be shared information has become prediction noise.

In this model, the intensity of grief would depend on how much shared information was left with nothing to update it. It is not just a metaphor: it is, at least in principle, a quantity. No one yet knows how to measure it in a particular brain, but it makes sense to ask about it.

### The limit: when mutual information is not enough

There is a point at which the analogy breaks down, and it should be pointed out. Mutual information is a statistical measure: it measures how much, on average, the uncertainty about a set of states is reduced. Two systems can share a great deal of information without either of them "knowing" anything about the other in a subjective sense.

A thermometer and a room share mutual information: the thermometer's reading reduces your uncertainty about the room's temperature. But the thermometer does not "feel" the room, nor does the room "know" anything about the thermometer. The mutual information is real and measurable, and yet there is nobody home.

So mutual information is a necessary but not sufficient condition for the conscious bond. Two entangled brains share a great deal of information, but what turns that entanglement into a bond, and not a mere correlation, is that each brain integrates that information into its own horizon. Mutual information is the channel; integration is what makes the channel inhabited.

The human bond would then be the conjunction of two things: a great deal of mutual information (correlation) and a great deal of integration (Φ) at each pole. Neither is enough on its own. A thermometer shares information with the room, but does not integrate; a brain in a coma may have a low Φ and still be correlated with its environment. The bond needs both.

---

## Door II: no-cloning as an explanation of non-transferability

### The problem

Why can experience not be transmitted? It is not a trivial question. If consciousness is information, and information is transmitted, why is experience not transmitted? Why can you say "I have a headache" and the other person understands the words but does not feel the pain?

The usual answer is that pain is subjective, a private quality that cannot be communicated. But that describes the problem; it does not explain it. Why is it private? What is there in the architecture of consciousness that makes it non-transferable?

The no-cloning theorem offers a formal answer.

### The theorem

The no-cloning theorem, proved in 1982 by Wootters and Zurek (and, independently, by Dieks), says that there is no physical operation that takes an arbitrary, unknown quantum state and produces two identical copies of it.

The proof is simple. Suppose there were an operation U capable of cloning any state |ψ⟩:

U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩

If U clones |ψ⟩ and also clones |φ⟩, the linearity of quantum mechanics decides what it does with the superposition of both:

U((|ψ⟩ + |φ⟩)|0⟩) = |ψ⟩|ψ⟩ + |φ⟩|φ⟩

But a genuine copy of the superposition would be something else:

(|ψ⟩ + |φ⟩)(|ψ⟩ + |φ⟩) = |ψ⟩|ψ⟩ + |ψ⟩|φ⟩ + |φ⟩|ψ⟩ + |φ⟩|φ⟩

The two results do not match (we have omitted the normalization factors, which do not change the argument). The cloning of a superposition is not the superposition of the clonings. Therefore, U cannot exist.

It is a mathematical property of quantum mechanics: no matter how much technology is applied, an unknown quantum state cannot be copied.

### Application to consciousness

If experience were a quantum state (and this is a hypothesis), the no-cloning theorem would explain why it is non-transferable. You could not copy your experience into another brain because unknown quantum states cannot be copied. It would not be difficult: it would be impossible, because physics forbids it.

This would have three important consequences.

**First: no one can make an exact copy of an existing consciousness.** Two identical twins, with the same genome and the same womb, do not share experience, and no technique could take one's experience and duplicate it in the other. Each horizon would be unrepeatable in principle, not merely by improbability.

**Second: introspection alters what it observes.** Measuring a qubit in superposition forces it into a definite state. Applied to introspection, this would mean that observing one's own experience modifies it: not because of a psychological limitation, but because of a physical property. Introspection would not be a neutral mirror, but a measurement that disturbs what it measures.

**Third: communication is imperfect in principle.** When you describe a pain, you transmit not the pain, but a classical description (words, gestures) of a state that cannot be copied. The receiver reconstructs something, but that something is not your pain: it is their interpretation of your description, filtered through their own architecture.

The story that follows, "The one who remains," stages the question this theorem leaves open: if a mind could be transferred to another substrate, would what arrives on the other side be that mind, or an instance faithful enough?

### The warning, and a classical version

The warning from the previous chapter still stands: we don't know whether the brain uses quantum information, and decoherence suggests it does not. If it did, no-cloning would not explain the hard problem, but it would explain why the problem has the shape it has.

And there is a classical version of the same idea that needs nothing quantum: introspection as a process that modifies itself. When you try to observe your own thought, the act of observing it changes it, and that is true even in a purely classical model. Quantum no-cloning is the formal, rigorous version of an intuition phenomenology has been exploring for a century, with one difference that should not be hidden: a classical state can be copied, at least in principle. Without quantum properties, non-transferability stops being a physical impossibility and becomes a practical difficulty, enormous but not absolute.

---

## Door III: *scrambling* as a model of grief and death

### The problem

Chapter 7 describes death as the evaporation of the horizon, and Chapter 17 describes grief as the persistence of a predictive model. Both say that information "is not lost, but becomes inaccessible." What exactly does that mean? Is it a consolation or just a manner of speaking?

Quantum *scrambling* makes it possible to be precise, and the precision changes the nature of the consolation.

### What *scrambling* is

*Scrambling* is the process by which information that falls into a black hole is spread across all its degrees of freedom. It is not destroyed, but it is mixed in such a complex way that recovering it would require measuring an enormous fraction of everything the black hole has emitted, and all their correlations.

It is the same thing that happens when you put a drop of ink in a glass of water. The ink molecules are still there, but to reconstruct the drop you would have to measure every water molecule and its relationships with all the others. The information exists, but in practice it is inaccessible.

The difference between destroying and mixing in this way is the difference between "does not exist" and "exists, but cannot be recovered." And that distinction matters, because it changes the nature of what is lost. It is like a deck of cards shuffled for hours: no card has disappeared, but the order they were in can no longer be read anywhere.

### Application to grief

When someone with whom one shared a deep bond dies, the information that constituted that bond is not destroyed: it is relocated. The correlations built with that person (their gestures, their voice, their ways) remain in the architecture of the one who remains, but they are no longer updated, because the other pole no longer responds.

In terms of information, it is a partial mixing: the information is still there, but disconnected from its referent. The survivor keeps the absent one's information, but can no longer use it to predict, because there is no one to confirm or refute the predictions.

The consequence is that grief is a process of relocation. The absent one's information is not erased: it is integrated into a new context, where it serves another function. It stops being predictive information and becomes narrative information: no longer "what I expect of him," but "what I remember of him."

### Application to death

When a horizon evaporates, the information that constituted it is redistributed in the field. It is not destroyed, but becomes inaccessible: no "I" persists, but a trace remains.

The distinction between existing and being recoverable is crucial. The information of the evaporated horizon exists mathematically, but in practice cannot be recovered: there is no reader able to reconstruct it, because that would require measuring every particle in the universe and all their correlations.

This means that, in this model, death is not annihilation, but it is not immortality either. It is something stranger, which the epilogue will call permanence without persistence: the information remains, but whoever generated it does not persist as a subject.

### The possible consolation and the impossible one

Is this a consolation? It depends on what one is looking for.

If one seeks the immortality of the self, it is not: scrambled information is not a "self" that survives, but a trace without a reader.

If one fears total destruction, it does not confirm that either: information is not annihilated, but redistributed.

What it offers is something more modest and perhaps more honest: the certainty that what is lost is not the information, but the possibility of recovering it. The universe does not forget, but it does not remember either.

For grief, this means that the absent one does not disappear completely, but is not available either: their trace remains in the field, but no one can read it. It is a presence without access, a companionship without response.

And for one's own death, it means that the question "what remains of me?" has a precise answer: the difference my existence introduced into the field remains. Not a self, not a memory, not an identity, but a disturbance, like that of a stone falling into a pond whose ripples keep spreading when it is already on the bottom.

---

## Closing: the three doors and the hard problem

The three doors share a structure. In each, information theory brings a precision ordinary language lacks:

- Mutual information turns the bond into a quantity.
- No-cloning turns non-transferability into a physical property.
- *Scrambling* turns loss into a distinction between existing and being recoverable.

None of them solves the hard problem. Mutual information does not say why the bond feels like a bond; no-cloning does not say why experience feels like experience; *scrambling* does not say why loss hurts.

But all three do something the horizon model needs: they give precision to its vocabulary. Bond, non-transferability, loss: these are words we use every day without knowing exactly what they mean. Information theory gives them a formal content that does not exhaust their meaning, but illuminates it.

One question remains that none of the three doors closes: why is there someone in there? Why does information, besides being, feel? It is the question Chapter 51 will take up again, at the end of the book, among the things the hypothesis cannot say.

---

> **Note to Chapter 35**
>
> **What we do know:** Mutual information is a standard measure of correlation, with well-defined mathematical properties. The no-cloning theorem is a proven result of quantum mechanics. *Scrambling* is a physical process studied in black hole physics. Coupling between the brain activity of a speaker and that of a listener has been measured experimentally.
>
> **What we don't know:** Whether consciousness is integrated information in IIT's technical sense. Whether the brain uses quantum information. Whether mutual information is an adequate measure of the human bond. Whether *scrambling* is a useful model of grief.
>
> **Open questions:** Is mutual information a sufficient measure of the bond, or does something escape it? Can there be non-transferability without quantum no-cloning? Is *scrambling* a consolation or just a manner of speaking?
>
> **If you take away only one idea:** Information theory does not explain why it hurts, but it does explain why the question "why does it hurt?" has the shape it has.
>
> **Further reading:** Cover, T. M. and Thomas, J. A. (2006), *Elements of Information Theory*; Stephens, G. J., Silbert, L. J. and Hasson, U. (2010), "Speaker–listener neural coupling underlies successful communication"; Wootters, W. K. and Zurek, W. H. (1982), "A single quantum cannot be cloned"; Dieks, D. (1982), "Communication by EPR devices"; Hayden, P. and Preskill, J. (2007), "Black holes as mirrors"; Sekino, Y. and Susskind, L. (2008), "Fast scramblers."
