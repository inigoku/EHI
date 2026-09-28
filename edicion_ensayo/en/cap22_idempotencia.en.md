---
title: THE IDEMPOTENCE OF BEING
section: "PART THREE: THE LIMITS OF THE HORIZON"
chapterNumber: 23
illustrationId: il22_1
illustrationTitle: The idempotence of being
illustrationDescription: An archipelago seen from above, islands of different sizes joined by fine bridges of golden light over a dark sea that is, in turn, the reservoir from which the islands condense.
---

## I. The wave and its edge

Where does a wave end?

Not in the wet sand it leaves as it withdraws, nor in the foam that dissolves a meter further on. The wave is, from beginning to end, the movement of that boundary between water and air: take away the edge and there is no "more wave" underneath; there is nothing. We begin with this simple intuition because it is the one that, on a larger scale and in more abstract registers, will support the whole chapter: the boundary does not delimit a thing that would exist just the same without it. The thing *is* its boundary.

We usually imagine limits as accidents of space, lines we draw for convenience and could move without altering the reality within. A continent remains the same even if we move its coastline a few meters; a company remains the same even if it changes headquarters. That belief works well with objects we already took for granted before asking about their boundary. But there is another class of entities, I suspect the most interesting one, in which the question is reversed: it is not that the object has a boundary, but that the boundary is all there is, and the object is the name we give to the fact that the boundary holds.

Consider something as modest as a legal person. A company is, literally, a limit of liability drawn by a legal act, a closure that separates what belongs to the company from what belongs to those who founded it. Removing that limit, "piercing the corporate veil," as the law says with an expression that already anticipates what we are about to develop, does not leave a naked but recognizable company, but a set of natural persons without the entity that grouped them.

This chapter does not stop at analogy. It will ground the apparatus precisely and then build four concrete bridges between that apparatus and the concepts that support the rest of the book: condensation, evaporation, entanglement and the reservoir itself from which everything else condenses. And, along the way, with the same machinery, it will resolve a pending problem about the shadow and the ego.

## II. The horizon that is not a wall

An event horizon is not made of anything. It is the place where spacetime curves so much that not even light, launched outward at full speed, can escape: no membrane, no shell, no wall. It does not separate two regions of space, as a wall separates two rooms, but two regions of the possible future.

> **In physics this is called:** Bekenstein-Hawking entropy, the formula that says a black hole's disorder depends not on how much is inside, but on how large its surface is.

The horizon does not only hide: in hiding, it *represents*. It is the only place where the interior becomes legible from outside. And there is one more detail, of an almost cruel elegance: the so-called no-hair theorem says that a black hole, seen from outside, is completely described by just three numbers: mass, charge and angular momentum. It makes no difference whether what fell in was an entire star or a cat's carcass: the horizon forgets the biography and keeps only the accounts.

Let us keep hold of the loose ends: the surface that encodes, the catalog reduced to three numbers, and something we have not said yet, that the horizon, over time, is consumed. Each will later become a bridge to a different pillar of the book.

## III. The door that decides what is seen

Let us transfer this to something closer: a software object. A well-designed object keeps an internal state no one can touch directly from outside; all that is accessible is its interface, a handful of public functions that act, allowing for the differences, as the surface of that horizon.

An object without an interface is inert. Biology solved the same problem, with the same solution, long before computing: a cell without a membrane is dispersed cytoplasm with nothing it can call its own. And the membrane, like an object's interface, is full of channels and pumps that decide precisely what goes in, what goes out and what stays out forever.

Let us note here, in passing, a problem software engineering knows well: that of inheritance, when one class does not communicate with another through an interface, but directly contains a copy of its structure, fused to the point where touching the parent class destabilizes the child. It is a genuine case of nesting, and we will need it when we reach the shadow.

## IV. Closing twice adds nothing

Let us now go to the barest register, topology, where the idea is stripped of physics, biology and engineering and shows its pure skeleton.

Topology works with sets of points equipped with a notion of nearness. When a set already contains all its accumulation points (the points that can be approached as closely as one likes from inside), we say it is *closed*.

> **In mathematics this is called:** topological closure and idempotence: closing a set once completes it; closing it a second time adds nothing.
> **In everyday life it's like:** a door that already fitted snugly in its frame. Closing it again doesn't make it "more closed": either it is closed or it isn't.

The software object of section III and this topological closure share not only a fondness for hiding things: they share, without our looking for it, the same word. In functional programming, a *closure* is a function packaged together with the variables of its environment at the exact moment of its creation: it closes over that environment, and however many times it is invoked afterward, it will capture nothing new from the original context, which may even have ceased to exist. It is not the same mathematical operation as the closure of a set (one closes functions over their lexical environment; the other, sets over their accumulation points), but the resemblance is no accident of the dictionary: both describe, in different vocabularies, something that packages at birth everything it will need so as never again to depend on its origin.

## V. A formal introduction to topological closure

Before building the bridges, and so that no one has to trust this book without being able to check it, it is worth saying precisely what a closure is, instead of leaving it as a mere image.

A topological space is, in its barest form, a set of points together with a notion of what it means for some points to be "near" others; formally, a collection of subsets called *open sets* that satisfies a few minimal rules of consistency. On that structure, the closure operation, which assigns to each set A another set, cl(A), is not defined any old way: the Polish mathematician Kazimierz Kuratowski showed that it suffices to require four properties of it, not one more, to capture everything a closure must do. They are these:

1. **cl(∅) = ∅.** Closing the empty set produces nothing out of nothing. No closure invents content where there was none.

2. **A ⊆ cl(A).** Every set is contained in its closure. Closing never makes a system lose parts of itself; at worst, it stays the same.

3. **cl(A ∪ B) = cl(A) ∪ cl(B).** Closing the union of two sets is the same as joining their separate closures. There is no magical "collective closure" that arises from putting two things together and is greater than the sum of their individual closures: joining A and B does not create a closure that was not already in one of the two.

4. **cl(cl(A)) = cl(A).** Idempotence, which we already knew: closing what is already closed adds nothing.

A set A is *closed* when it coincides exactly with its closure, A = cl(A), and it is *open* when its complement, everything that is not A, is closed. With these two notions we can now define precisely what we previously described only in words: the *interior* of A is the largest open set contained in A; the *exterior*, the interior of the complement; and the *boundary* of A is exactly cl(A) ∩ cl(not-A), the zone where the closure of A and that of everything that is not A overlap. A set can be both open and closed (what is called *clopen*), and this happens precisely when its boundary is empty: it has no point of contact with the rest of the space. Finally, a space is *Hausdorff* when any two distinct points always have neighborhoods that do not overlap: there is room, however small, for them to remain two and not one.

Four axioms and two derived definitions: we now have all the vocabulary we need. It is worth stressing one thing: those four axioms are all the pure topology we are going to use. Any later claim that does not follow from them, such as the exclusion postulate we will need for the shadow, is not topology, but an added hypothesis, and we will flag it as such every time it appears.

## VI. First bridge: condensation and the threshold that does not repeat

Think of water cooling. At fifteen degrees it is liquid; at minus five, solid. Between those two states there is no third, a "somewhat solid," except for the unstable case of supercooled water, which remains liquid below zero, in precarious equilibrium, until a minimal disturbance makes it crystallize suddenly, all at once, in the time it takes the shock wave to cross the glass.

Kuratowski's fourth axiom, closing once is enough and closing twice adds nothing, serves to name that threshold. It is not a law of phase transitions (every closure satisfies it, whatever the phenomenon), but the exact vocabulary for what happens when it is crossed. Before crystallizing, the set of "already ordered" molecules in supercooled water is not closed: it is missing its own accumulation points, the molecules on the verge of joining the crystal lattice but still dancing loose. At the instant of crystallization, that set closes suddenly and incorporates its entire boundary at once. Cooling the ice further does not produce a second crystallization: the system has already crossed the threshold. cl(cl(A)) = cl(A): closing what is already closed does not add a layer of closure; it only confirms the one that was there.

This gives condensation a more precise vocabulary than the simple metaphor of "something that forms little by little." The preparation can be gradual, as Chapter 1 demanded when it spoke of a dial rather than a switch, and the degree of integration can keep varying afterward; but the closure of an identity (an ego, a conscious system, an "I"), when it comes, is an event that admits no degrees. Water cools little by little; ice appears all at once.

## VII. Second bridge: evaporation and the closure that changes size

Idempotence says something about a set at a given instant, but nothing about whether that set will still exist an instant later. This is where evaporation comes in, and it needs another mathematical piece: not a closed set, but a *family* of closed sets, one for each moment and each smaller than the last.

Let \(E_t\) be the horizon of a black hole at instant \(t\). Each \(E_t\), taken separately, is a perfectly closed set: it satisfies the four axioms and is as solid at that instant as any other horizon. But the complete sequence, \(E_0 \supseteq E_1 \supseteq E_2 \supseteq \ldots\), is not static: each \(E_{t+1}\) is strictly contained in the one before, because Hawking radiation carries away, instant by instant, a little of the mass that sustains the horizon.

This does not contradict idempotence; it completes it. Idempotence says that closure admits no degrees *at an instant*; the filtration, that it does admit a history: it can shrink, closed instant after closed instant, until it runs out. There is no contradiction between being completely closed now and being closer to ceasing to be so than yesterday.

But the decreasing filtration, as we have described it, does not distinguish between radiation that is simply lost and radiation that, at some point, begins to say something. That distinction exists, with a name of its own, in the physics of the black hole we started from.

During the first half of the horizon's life, Hawking radiation is thermal: it carries increasing entropy and no recoverable correlation with what fell in. But after the so-called *Page time*, the moment when the entropy of the radiation stops increasing and begins to decrease, roughly halfway through that life, the radiation stops being pure noise: each particle that escapes is entangled not only with the interior, but with the radiation that left earlier. From then on, what the horizon emits is no longer only loss, but correlation: information that, in principle, someone able to compare the two halves could read.

> **In physics this is called:** the Page time, the point in a black hole's evaporation after which the entropy of the Hawking radiation stops increasing and begins to decrease, because the entangled pairs that make it up are no longer pure thermal noise.

This does not change what was said in section VI: A = cl(A) still admits no degrees at an instant. What it adds is that the decreasing filtration E₀ ⊇ E₁ ⊇ ... has, besides a size at each instant, a phase: a young evaporation, which only loses, and a mature one, which begins to give back something of what was lost, entangled and therefore correlated, though never literally recovered. The boundary does not always shrink in the same way, although at every moment it remains, without exception, a closed boundary.

It should be said with the usual clarity what this is not: it is not a way for something to cross the boundary in the sense Chapter 51 reserves for access to the interior. What leaks out is not the content (the interior keeps its part), but the correlation between what left and what remained. It is the difference between receiving a letter and receiving, instead, the certainty that somewhere the other half of a conversation exists that we may never read in full. Little, but not nothing.

## VIII. Third bridge: the entanglement the boundary measures

The theoretical physics of recent decades, the program sometimes summarized as *it from qubit*, associated with names such as Van Raamsdonk, Ryu and Takayanagi, has shown that Bekenstein-Hawking entropy is not just a metaphor for "how much information there is in there," but, literally, the *entanglement entropy* between the interior of the horizon and the exterior. It is calculated by taking the complete quantum state of the system, dividing it into two regions separated by a boundary and ignoring everything on the other side; the result measures exactly how correlated the two halves are. And that quantity, for a region bounded by a minimal surface anchored at its boundary, turns out to be proportional to the area of that surface.

> **In physics this is called:** holographic entanglement entropy: the surface of a region measures how entangled that region is, in the strict quantum sense, with everything outside it.

If the ego and the shadow are two neighboring closures, their common boundary is not just a line of topological separation, but, if the analogy holds, the measure of how entangled they are. And that explains something we could previously only import as a foreign axiom: the monogamy of entanglement. If entanglement across a boundary is a measurable and finite resource, a system maximally entangled with one neighbor has no entanglement to spare to be equally entangled with a third. The exclusion postulate stops being an unjustified import and becomes a reasonable consequence of how entanglement behaves wherever physics has measured it; with the caveat, which bears repeating, that transferring this physics from the geometry of spacetime to the architecture of consciousness is a fruitful hypothesis, not a proof.

It is worth being even more precise about what kind of bridge this is, because the most serious objection is on target: the monogamy of entanglement is a property of quantum many-body systems, not of topological closures as such, and holographic entanglement entropy is defined for regions of spacetime, not for egos and shadows. The leap requires an explicit mechanism, not just a family resemblance. The mechanism is this: both entanglement entropy and the Phi of integrated information theory are calculated with the same structural gesture, though in different mathematical spaces. Both start from a complete system, *divide* it into two parts along some candidate boundary and measure how much information is lost, how much correlation is cut, by treating those parts as independent. Entanglement entropy does it on a Hilbert space; IIT's Phi, on the causal structure of a physical system. They are different machineries applied to different objects, but they share the gesture: divide, and measure what the division loses. And that shared gesture, not quantum physics transplanted wholesale, is what makes it reasonable to expect both to behave similarly when faced with the problem of monogamy: any measure defined as "what is lost by cutting along the weakest boundary" tends, by construction, not to be shared generously among several simultaneous partitions of the same system. That does not prove the exclusion postulate is true; it proves it is not a capricious import from a foreign field, but arises from the same kind of mathematical operation we were already using, applied to another object. With a caveat that should not be hidden: classical correlations, unlike entanglement, are not monogamous (the same information can be copied to many receivers at once), and Φ is calculated over classical causal relations. The parallel thus points to a plausible constraint, not a consequence.

## IX. The reservoir: the sea from which the islands condense

The three preceding bridges share something we have so far left implicit: no island condenses out of nothing, none evaporates into nothing, and no entanglement is born from zero when an island appears. All three need a prior substrate, and that substrate is the reservoir.

Let us give it an operational definition and not just a poetic one, because otherwise it risks functioning as a piece that solves topological problems without being formalizable itself, a device that appears when the argument needs it and that no one can touch. The definition requires no new object; it is built entirely from what we already had. Let X be the total space of possible states of a system, everything that could in principle come to be integrated, and let \(\{E_i\}\) be the collection of proper closures existing in X at a given instant (closed sets other than X itself, sustained by a threshold of integration): the horizons already condensed, the islands already closed, each of which satisfies Kuratowski's four axioms. The reservoir is, precisely:

> \(R = X \setminus \bigcup_i E_i\)

the complement of the union of all those closures: everything that, at that instant, has not crossed any threshold of closure. It is, literally, what is left of the state space once all the islands already formed have been subtracted: not a separate place, not a substance, not a third kind of entity distinct from the sets we already know. That is why it can be, without contradiction, both the source from which the islands condense (it is enough for a region of R to crystallize, cross the threshold of section VI and become part of the union) and the destination to which they return when they evaporate (it is enough for an island to stop satisfying A = cl(A) for it, by definition, to become part of the complement again). The reservoir needs no special ontological status: it is an almost trivial definition of what remains outside, at each instant, of everything that has already closed.

In relation to condensation, the reservoir is the undifferentiated field from which the islands condense. In section VI we described supercooled water crystallizing all at once, but we did not say where the water came from: from a larger body, still without closed form, which is still there after the ice has formed. The ego is not created out of nothing; it condenses from a reservoir that was already present, without closure of its own, before there was any ego to condense.

As for evaporation, we must correct something section VII left imprecise. We said that the decreasing sequence of horizons, \(E_0 \supseteq E_1 \supseteq \ldots\), tends to the empty set. That is true for a black hole isolated in space, but it is not the right image for consciousness, and the book itself knows this better than that section did: when an ego dissolves, it dissolves not into nothing, but *back* into the reservoir it came from. The sequence converges not to ∅, but to reabsorption into the common substrate. Let us rewrite the filtration more carefully, then: what tends to disappear is the island, not what it contained. The island keeps shrinking toward \(\emptyset\), but everything that leaves it, \(E_0 \setminus E_t\), becomes part of R: it is not lost into nothing; it returns to the reservoir.

As for entanglement, the reservoir has an even more precise physical candidate than holographic entanglement entropy. The quantum vacuum of a field theory is not empty: even without any particles, the vacuum state is entangled with itself across any boundary drawn in space. This is what, in its most formal version, the Reeh-Schlieder theorem captures, the same machinery that lies behind the Unruh effect and, ultimately, behind Hawking radiation itself. This gives the reservoir a very precise role: the islands do not begin to become entangled from zero when they condense. The entanglement was already latent in the reservoir before any island existed. To condense is to carve a boundary within a correlation that was already there in the background. Each island inherits at birth a portion of the entanglement entropy of the sea it came from.

> **In physics this is called:** vacuum entanglement: even the emptiest possible state of a quantum field theory is internally correlated across any boundary drawn in it.

As a bonus, this gives a more precise answer to one of the questions we left pending in Chapter 21: what psychosis is. If the ego and the shadow are islands whose boundary filters a controlled entanglement with the reservoir, psychosis would be the failure of that filter precisely toward the sea: the membrane stops distinguishing between a tolerable correlation with the common background and a total flood, and the ego, instead of losing its closure little by little through an orderly evaporation, loses it all at once, because the reservoir itself, with all its latent correlation, comes in through a boundary that no longer knows how to filter. Three classic symptoms fit here without forcing the image: hallucination would be correlated content that crosses the boundary without the label of origin that normally marks it as "from inside" or "from outside" (the same failure psychiatry describes as a deficit of source monitoring); delusion, the ego's desperate attempt to close again by inventing a story that explains the leaked content before the closure collapses; and the loss of the sense of self, something like what in a topological space would be losing the Hausdorff property: the system can no longer maintain a neighborhood that distinguishes it from what it is not. The next chapter turns all this into concrete thought experiments, with predictions that could in principle be tested.

## X. The shadow: what topology says and what we are betting

With the four bridges built, let us return to the problem at hand. Let us think of consciousness as a horizon and call the ego the largest closure of that set of processes. And let us think of what the ego cannot admit without ceasing to be what it is: the shadow. The question is whether the shadow lives nested within the ego, like a smaller bubble floating inside another, or whether it has to be, structurally, something else.

Topology alone does not decide: a closed subset inside another closed set violates none of Kuratowski's four axioms, and the problem of inheritance and the fragile class we noted in section III is precisely an example of nested systems that work, sometimes for years, until they don't.

What decides between nesting and separation is the wager of the exclusion postulate, and thanks to the third bridge we now have a better reason to sustain it: if the boundary between two systems measures their entanglement, and entanglement is a resource that cannot be shared without limit, an ego maximally bound to its shadow through their common boundary cannot at the same time be equally bound to a third psychic complex as if that complex were also inside it. The shadow cannot be a nested horizon in the same sense as the ego. It has to be a *disjoint complex*, a neighboring island, and the boundary it shares with the ego is, literally, the measure of how much of what is repressed leaks into what is conscious.

## XI. An archipelago, not a Russian doll

This upsets the image of the Russian doll: the personal unconscious enveloping the self, the collective enveloping the personal, layers within layers. If we accept the exclusion postulate, that image is untenable: if the collective unconscious were a horizon containing the ego and the shadow, neither of them would be a true horizon, but only a denser zone within a single closure.

The model that remains is that of an archipelago floating on the reservoir: a *disconnected* space, divisible into pieces, none of which touches the interior of the others, although they can touch along the boundary and, as we now know, exchange across it a measurable amount of correlation, with each other and with the sea they came from. The ego is one island; the shadow, another. Each significant archetype may be one more island, with its own closure and its own boundary entropy shared with the neighboring islands and with the reservoir.

Integrating no longer means opening the shadow and putting it inside the ego, but deliberately increasing the entanglement across a boundary that continues to exist: more correlation, more exchange, without either system losing its closure.

## XII. The membrane that learns to filter

Let us return, to finish, to the cell we began with.

The immune system is, in essence, a machinery devoted to distinguishing one's own horizon from another's. When that recognition fails in one direction, the body attacks what is its own: an autoimmune disease, the ego attacking its own shadow after mistaking it for an invader. When it fails in the other, it tolerates what it should stop.

Neither total attack nor total tolerance is health. Health is a boundary that knows how to filter. And, with the four bridges built, we can say so precisely: a healthy boundary is not one that reduces the entanglement with the shadow to zero, which would be dissociation, the boundary both open and closed, the island that does not even share a coast; nor one that lets itself be invaded until it loses its closure, which would be the forced nesting the exclusion postulate forbids or the flooding from the reservoir we have called psychosis. It is a boundary that, like the horizon that evaporates without ceasing to be a horizon at every instant, can change size over a lifetime, widening or narrowing its exchange with what is repressed and with the common background, without ever, while it lasts, ceasing to be genuinely closed.

It is, almost word for word, what Jungian individuation asked of us in Chapter 21 when we spoke of a horizon that "becomes permeable without losing its coherence." Now we have, besides the metaphor, the mechanism: a mature boundary has better receptors. And, if the second bridge holds, it is also a boundary that has already crossed its own Page time: what it radiates outward has stopped being pure noise and begins to carry, entangled, a legible correlation with what it still keeps inside. It knows what to let through from the shadow (which projections to recognize as its own, which impulses to reintegrate without their threatening the identity of the ego) without needing to swallow it whole and turn it into undifferentiated tissue of its own. There are still two horizons; what changes is the quality of the customs post that joins them.

## XIII.

The limit that, closing upon itself, says for the first time "I am."

---

> **Note to Chapter 23**
>
> **What we do know:** That Kuratowski's four axioms exhaust all the pure topology this chapter needs, and that any other claim (the exclusion postulate, the psychic extension of entanglement entropy) is an added hypothesis and not a consequence of those axioms; that the idempotence of closure gives a precise name to the fact that a closure, once produced, admits no degrees; that a decreasing filtration of closed sets describes evaporation without contradicting idempotence, provided that what leaves the island ends up in the reservoir and not in nothing; that this evaporation is not uniform over time, but has an early phase of pure thermal loss and, after the Page time, another in which the radiation begins to carry entangled correlation, recoverable in principle, though never directly legible from outside; and that holographic entanglement entropy and vacuum entanglement are real physics, not loose analogies.
>
> **What we don't know:** Whether extending this physics, holographic and vacuum, from the geometry of spacetime to the architecture of consciousness is a fruitful structural hypothesis or a leap physics does not support outside its domain; whether the exclusion postulate is, at bottom, the same constraint as the monogamy of entanglement seen from another register; whether the reservoir, as this chapter needs it, is anything more than a useful image for what physics already knows about the vacuum; and whether a human life, or the evaporation of an ego, has anything like a Page time of its own, or whether that periodization belongs only to black hole thermodynamics and cannot be transferred to consciousness.
>
> **Open questions:** What observation would distinguish a universe in which the shadow were really nested from one in which it were a disjoint complex? What would distinguish, in a real life, an individuation that proceeds by gradual evaporation toward the reservoir from one that happens in a single sudden crystallization? And what would distinguish, clinically, an orderly evaporation from the sudden flooding we have called psychosis? And if an anti-reservoir, such as a mature AI, could also cross, in a purely thermodynamic sense, something like a Page time of its own, as this essay will later suggest, what would distinguish that crossing from the evaporation of a real horizon, apart from the fact that one has an inside to lose and the other does not?
>
> **If you take away only one idea:** You are not what lies within your limits; you are the very act of having closed them.
>
> **Further reading:** Kuratowski, K. (1922), "Sur l'opération Ā de l'Analysis Situs"; Page, D. N. (1993), "Information in black hole radiation"; Ryu, S. and Takayanagi, T. (2006), "Holographic derivation of entanglement entropy from AdS/CFT"; Van Raamsdonk, M. (2010), "Building up spacetime with quantum entanglement"; Oizumi, M., Albantakis, L. and Tononi, G. (2014), "From the phenomenology to the mechanisms of consciousness: Integrated Information Theory 3.0."
