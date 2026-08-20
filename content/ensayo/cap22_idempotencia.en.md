---
title: THE IDEMPOTENCY OF BEING
section: PART THREE: THE LIMITS OF THE HORIZON
---

## I. The Wave and Its Edge

Where does a wave end?

Not on the wet sand it leaves behind when retreating, nor in the foam that dissolves a meter further. The wave is, from beginning to end, the very movement of that boundary between water and air: take away the edge and there is no "more wave" underneath, there is nothing left. We begin with this simple intuition because it is the same one that, on a larger scale and in more abstract registers, will sustain this entire chapter: the boundary does not delimit a thing that would exist just the same without it. The thing *is* its boundary.

We tend to imagine limits as accidents of space, lines we draw for convenience and that we could move without the interior reality flinching. A continent remains the same continent even if we move its coast a few meters. A company remains the same company even if it changes its headquarters. That belief works well for objects we already took for granted before asking about their boundary. But there is a different class of entity—and I suspect it is the most interesting class—in which the question is inverted: it is not that the object has a boundary, it is that the boundary is all there is, and the object is the name we give to the fact that this boundary sustains itself.

Consider something as modest as a legal entity. A corporation is not the building, nor the employees, nor the money in the account: it is, literally, a limit of liability traced by a legal act, a closure that separates what belongs to the corporation from what belongs to those who founded it. Removing that limit—"piercing the corporate veil," as law says, with an expression that already intuits what we are about to develop—does not leave a bare but recognizable corporation. It leaves, simply, a set of natural persons without the entity that grouped them.

This chapter does not stop at a loose analogy. It will ground the apparatus with precision, and then build four concrete bridges between that apparatus and the concepts that sustain the rest of the book: condensation, evaporation, entanglement, and the Reservoir itself from which everything else condenses. And, along the way, with that same machinery, it will resolve an outstanding problem about the Shadow and the Ego.

## II. The Horizon That Is Not a Wall

An event horizon is not made of anything. It is not a membrane, nor a shell, nor a wall. It is the place where spacetime bends so much that not even light, directed outward at full speed, manages to escape. It does not separate two regions of space, as a wall separates two rooms; it separates two regions of the possible future.

> **In physics this is called:** Bekenstein-Hawking entropy, the formula that says the disorder of a black hole does not depend on how much is inside, but on how large its surface area is.
> **In daily life it is like:** a library whose complete catalog fits written on the facade of the building. There is no need to enter to know everything it contains: the facade, if you know how to read it, already says it all.

The horizon does not just hide: by hiding, it *represents*. It is the only place where the interior becomes legible from the outside. And there is one more detail, almost cruel in its elegance: the so-called no-hair theorem says that a black hole, seen from the outside, is completely described by only three numbers: mass, charge, and angular momentum. It does not matter if what fell inside was an entire star or the corpse of a cat: the horizon forgets the biography and preserves only the bookkeeping.

Let us keep the threads we have left loose here—the surface that encodes, the catalog reduced to three numbers, and something we have not yet mentioned: that this horizon, over time, consumes itself. Each of them will become, later on, a bridge to a different pillar of the book.

## III. The Door That Decides What Is Seen

Let us transplant this to something closer: a software object. A well-designed object keeps an internal state that no one from the outside can touch directly. The only thing accessible is its interface: a handful of public functions that act, bridging the distances, like the surface of that horizon.

> **In physics this is called:** encapsulation.
> **In daily life it is like:** a car. You do not need to understand internal combustion to drive it; the steering wheel and the pedals are the horizon that translates all that complexity into four gestures that anyone can learn.

An object without an interface is not a free object, it is an inert object. Biology, long before computer science, had already resolved this same problem with the same solution: a cell without a membrane is not a freer cell, it is scattered cytoplasm with nothing to call its own. And the membrane, just like the interface of a software object, is full of channels and pumps that decide with precision what enters, what leaves, and what remains outside forever.

Let us also note here, in passing, a problem that software engineering itself knows well: inheritance, when a class does not communicate with another through an interface but directly contains a copy of its structure, merged to the point that touching the parent destabilizes the child. It is a genuine case of nesting, and we will need it when we reach the Shadow.

## IV. Closing Twice Adds Nothing

Let us now go to the barest register of all, topology, where the idea is stripped of physics, biology, and engineering to show its pure skeleton.

A set is not just a list of elements: it is a list endowed with a notion of closeness. When a set already contains its entire shadow—all its accumulation points—we say it is *closed*.

> **In physics this is called:** topological closure and idempotency: closing a set once completes it; closing it a second time adds nothing.
> **In daily life it is like:** a door that already fit well in its frame. Closing it again does not leave it "more closed"; either it is closed, or it is not.

The software object from section III and this topological closure don't just share a fondness for hiding things: they share, without our having looked for it, the very same word. In functional programming, a *closure* is a function packaged together with the variables of its environment at the exact moment it is created—it closes over that environment, and no matter how many times it's invoked afterward, it will never capture anything new from the original context, which may by then no longer even exist. It is not the same mathematical operation as the closure of a set—one closes functions over their lexical environment, the other closes sets over their accumulation points—but the resemblance is not a dictionary coincidence: both describe the same thing in different vocabularies, something that packages at the instant of its birth everything it will ever need, so as never again to depend on where it came from.

## V. Formal Introduction to Topological Closure

Before building the bridges, and so that no one has to take this book's word without being able to verify it, it is worthwhile to say precisely what a closure is, rather than leaving it only as an image.

A topological space is, in its most stripped-down form, a set of points along with a notion of what it means for some points to be "near" others—formally, a collection of subsets called *open sets* that satisfies a few minimal rules of consistency. On this structure, the closure operation, which assigns to any set A another set cl(A), is not defined in just any way: the Polish mathematician Kazimierz Kuratowski showed that it is enough to demand of it four properties, not one more, to capture everything a closure must do. They are these:

1. **cl(∅) = ∅.** Closing the empty set produces nothing from nothing. There is no closure that invents content where there was none to begin with.

2. **A ⊆ cl(A).** Every set is contained in its own closure. Closing never makes a system lose parts of itself; in the worst-case scenario, it remains the same.

3. **cl(A ∪ B) = cl(A) ∪ cl(B).** Closing the union of two sets is the same as joining their closures separately. There is no magical "collective closure" that emerges from putting two things together that is greater than the sum of their individual closures: if A and B were not already, each on their own, on the way to being closed, putting them together does not create a new closure that was not already in one of the two.

4. **cl(cl(A)) = cl(A).** Idempotency, which we already knew: closing what is already closed adds nothing.

A set A is called *closed* when it coincides exactly with its own closure, A = cl(A). A set is called *open* when its complement—everything that is not A—is closed. And with these two notions we can now precisely define what we previously only described with words: the *interior* of A is the largest open set contained in A; the *exterior* is the interior of the complement; and the *boundary* of A is, exactly, cl(A) ∩ cl(not-A)—the zone where the closure of A and the closure of everything that is not A overlap. A set can be, at the same time, open and closed—a *clopen set*—and that happens precisely when its boundary is empty: there is no point of contact with the rest of space. And a space is called *Hausdorff* when any two distinct points admit environments that do not overlap: there is room, however minimal, for them to remain two and not one.

Four axioms, two derived definitions, and we have all the vocabulary we needed. It is worth pointing out something that will protect us from an error this book itself once made: these four axioms are all the pure topology we are going to use. Any assertion we make later that does not follow from them—like the exclusion postulate we will need for the Shadow—is not topology. It is an added hypothesis, and we will point it out as such every time it appears.

## VI. First Bridge: Condensation and the Threshold That Does Not Repeat

Think of water cooling. At fifteen degrees it is liquid; at minus five, solid. But between those two states there is no third, no "a little solid," except for the unstable case of supercooled water—water that remains liquid below zero, in a precarious equilibrium, until a minimal perturbation causes it to crystallize suddenly, all at once, in the time it takes the shockwave to travel through the glass.

Kuratowski's fourth axiom—closing once is enough, closing twice adds nothing—is the exact mathematical signature of that threshold. Before crystallizing, the set of molecules "already ordered" in the supercooled water is not closed: it lacks its own accumulation points, the molecules that are about to join the crystal lattice but still dance loose. In the instant of crystallization, that set closes suddenly: it incorporates its entire boundary at once. Continuing to cool the ice already formed does not produce a second crystallization. The system already crossed the threshold. cl(cl(A)) = cl(A): closing what is already closed does not add a new layer of closure, it only confirms the one that was already there.

> **In physics this is called:** first-order phase transition—the same thing that happens, on another scale, in a Bose-Einstein condensate, where a gas cooled below a certain critical temperature stops behaving as separate particles and begins to behave, suddenly, as a single macroscopic quantum state.
> **In daily life it is like:** the supercooled water in the glass that remains still, liquid against all logic, until a small tap turns it into solid ice in less than a second. There is no ice "halfway."

This gives condensation something that the simple metaphor of "something that forms little by little" did not have: an explanation of why the appearance of a closed identity—an Ego, a conscious system, an "I"—cannot be gradual in its nature even if it is gradual in its preparation. The water cools little by little; the ice appears all at once.

## VII. Second Bridge: Evaporation and the Closure That Changes Size

Idempotency says something about a set in a given instant. It says nothing about whether that same set continues to exist a moment later. And that is where evaporation enters, which needs a different mathematical piece: not one closed set, but a *family* of closed sets, one for each moment, becoming smaller and smaller.

Let us call \(E_t\) the horizon of a black hole at instant \(t\). Each \(E_t\), taken separately, is a perfectly closed set—satisfying the four axioms, as solid in that instant as any other horizon. But the complete sequence, \(E_0 \supseteq E_1 \supseteq E_2 \supseteq \ldots\), is not static: each \(E_{t+1}\) is strictly contained in the previous one, because Hawking radiation carries away, instant by instant, a little of the mass that sustains the horizon.

> **In physics this is called:** decreasing filtration of horizons—a sequence of closures, each valid in its moment, that shrinks.
> **In daily life it is like:** a burning candle. In each instant, the flame has a perfectly defined contour, a closed boundary between what burns and what does not. But the sequence of those contours, minute by minute, shrinks.

This does not contradict idempotency; it completes it. Idempotency says that closure does not admit degrees *in an instant*. Filtration says that it does admit history: it can shrink, closed instant after closed instant, until it is exhausted. There is no contradiction between being completely closed now and being closer to ceasing to be so than yesterday.

## VIII. Third Bridge: The Entanglement That the Boundary Measures

Theoretical physics of recent decades—the program sometimes summarized as "*it from qubit*," associated with names like Van Raamsdonk, Ryu, and Takayanagi—has shown that Bekenstein-Hawking entropy is not just a metaphor for "how much information there is inside." It is, literally, the *entanglement entropy* between the interior of the horizon and its exterior: it is calculated by taking the complete quantum state of the system, dividing it into two regions separated by a boundary, and ignoring everything on the other side; the result measures exactly how much the two halves are correlated. And that quantity, for a region delimited by a minimal surface anchored on its boundary, turns out to be proportional to the area of that surface.

> **In physics this is called:** holographic entanglement entropy—the surface area of a region measures how much that region is entangled, in the exact quantum sense of the word, with everything that remains outside it.
> **In daily life it is like:** two twins raised together and then separated: no matter how far apart they are, their lives remain correlated in a way that no distance completely erases. The boundary between "their life" and "the other's" is not a line that isolates them; it is the exact measure of how much they remain joined despite being separated.

If the Ego and the Shadow are two neighboring closures, that shared boundary is not just a line of topological separation: it is, if the analogy holds, a measure of how much they are entangled with one another. And this explains something we previously could only import as another's axiom: the monogamy of entanglement. If entanglement across a boundary is a measurable and non-infinite resource, a system maximally entangled with a neighbor does not have entanglement to spare to be so, at the same level, with a third. The exclusion postulate ceases to be an unexplained import and becomes a reasonable consequence of how entanglement behaves where physics has measured it—with the caveat, which must be repeated tirelessly, that transplanting this physics from the geometry of spacetime to the architecture of consciousness is a fertile hypothesis, not a demonstration.

It is worth being even more precise about what kind of bridge this is, because the most serious objection that can be made to it is exact: the monogamy of entanglement is a property of many-body quantum systems, not of topological closures without further ado, and holographic entanglement entropy is defined for regions of spacetime, not for Egos and Shadows. The leap deserves an explicit mechanism and not just a family resemblance. The mechanism is this: both entanglement entropy and the Phi of integrated information theory are calculated with the same structural gesture, though in different mathematical spaces. Both start from a complete system, *partition* it into two parts along some candidate boundary, and measure how much information is lost—how much correlation is cut—by treating those two parts as if they were independent. Entanglement entropy does this on a Hilbert space; the Phi of IIT does it on the causal structure of a physical system. They are different machineries applied to different objects, but they share the same gesture: partition, and measure of what the partition loses. And that shared gesture—not quantum physics transplanted without further ado—is what makes it reasonable to expect both, entanglement entropy and Phi, to behave in a similar way in the face of the problem of monogamy: any measure defined as "what is lost by cutting along the weakest boundary" tends, by construction, not to be distributed generously among several simultaneous partitions of the same system. This does not prove that the exclusion postulate is true. It proves that it is not a whimsical import from a foreign field: it is born from the same type of mathematical operation we were already using, applied to a different object.

## IX. The Reservoir: The Sea from Which the Islands Condense

The three previous bridges share something we have left implicit until now: no island condenses from nothing, none evaporates into nothing, and no entanglement is born from scratch when an island appears. All three need a prior substrate. That substrate is the Reservoir.

Let us give it an operational definition, not just a poetic one, because otherwise it runs the risk of functioning as a piece that solves topological problems without itself being formalizable—a resource that appears when the argument needs it and that no one can touch. The definition does not require any new object: it is constructed entirely with what we already had. Let X be the total space of possible states of a system—everything that, in principle, could come to be integrated—and let \(\{E_i\}\) be the collection of all maximal closures that exist in X in a given instant: the already condensed horizons, the already closed islands, each of them satisfying Kuratowski's four axioms. The Reservoir is, with all precision:

> \(R = X \setminus \bigcup_i E_i\)

the complement of the union of all maximal closures. Everything that, in that instant, has not crossed any threshold of closure. It is not a separate place, nor a substance, nor a third type of entity different from the sets we already know: it is, literally, what remains of the state space once all the already formed islands are subtracted. That is why it can be, without contradiction, both the source from which the islands condense—it is enough for a region of R to crystallize, cross the threshold of the sixth section and become part of the union—and the destination to which they return when evaporating—it is enough for an island to cease to satisfy A = cl(A), and automatically, by definition, it becomes part of the complement again. The Reservoir does not need a special ontological status. It is a trivial theorem about what remains outside, in each instant, of all that has already closed.

With condensation, the Reservoir is the undifferentiated field from which the islands condense. In the sixth section we described supercooled water crystallizing all at once, but we did not say where the water came from: it came from a larger body, without a closed shape yet, which remains there after the ice has formed. The Ego is not created from nothing; it condenses from a Reservoir that was already present, without its own closure, before there was any Ego to condense.

With evaporation, we must correct something that the seventh section left imprecise. We said that the decreasing sequence of horizons, \(E_0 \supseteq E_1 \supseteq \ldots\), tends towards the vacuum. It is true for a black hole isolated in space, but it is not the correct image for consciousness, and the book itself already knows this better than that section: when an Ego dissolves, it does not dissolve into nothingness, it dissolves *back* into the Reservoir from which it came. The sequence does not converge to ∅; it converges to reabsorption into the common substrate. Let us write, then, the filtration formula with more care: not \(\lim_{t\to\infty} E_t = \emptyset\), but \(\lim_{t\to\infty} E_t = R\), where R is, precisely, the Reservoir.

With entanglement, the Reservoir has an even more precise physical candidate than holographic entanglement entropy alone. The quantum vacuum of a field theory is not a vacuum vacuum: even without any particle present, the vacuum state is entangled with itself across any boundary drawn in space—this is what in its most formal version is known as the Reeh-Schlieder theorem, the same machinery that is behind the Unruh effect and, in the end, behind Hawking radiation itself. This gives the Reservoir a very precise role: the islands do not begin to entangle with each other from scratch when they condense. The entanglement was already there, latent, in the Reservoir, before any island existed. Condensing is not creating new bonds; it is carving a boundary within a correlation that was already present in the background. Each island inherits, upon being born, a portion of the entanglement entropy of the very sea from which it came.

> **In physics this is called:** vacuum entanglement—even the most empty state possible of a quantum field theory is internally correlated across any boundary drawn in it.
> **In daily life it is like:** an entire piece of fabric, not yet cut. Cutting two pieces from the same fabric does not make them relatives: they were already the same fabric before the scissors passed. The cut does not create the relationship, it only makes it visible as a boundary.

This, as a bonus, gives the section of the Shadow a more precise answer to one of the questions we left pending in the previous chapter: what is psychosis. If the Ego and the Shadow are islands whose boundary filters a controlled entanglement with the Reservoir, psychosis would be the failure of that filter specifically towards the sea—the membrane stops discriminating between tolerable correlation with the common background and total inundation—and the Ego, instead of losing its closure slowly by orderly evaporation, loses it suddenly because the Reservoir itself, with all its latent correlation, enters through a boundary that no longer knows how to filter. Three classic symptoms fit here without forcing the image: hallucination would be correlated content that crosses the boundary without the origin label that normally marks it as "from inside" or "from outside"—the same failure that psychiatry already describes as a source monitoring deficit; delusion would be the Ego's emergency attempt to re-close itself, inventing a narrative that accounts for the filtered content before the closure itself collapses; and the loss of the sense of self would be, quite literally, the failure of the Hausdorff property: the system ceases to be able to maintain an environment that distinguishes it from what is no longer it. The next chapter converts this into concrete thought experiments, with predictions that could in principle be contrasted.

## X. The Shadow: What Topology Says and What We Bet

With the four bridges built, let us return to the problem at hand. Let us think of consciousness as a horizon and let us call the Ego the major closure of that set of processes. And let us think of that which the Ego cannot admit without ceasing to be what it is—the Shadow. The question is whether the Shadow lives nested within the Ego, a smaller bubble floating inside another, or whether it must be, structurally, something else.

Topology on its own does not decide this: a closed subset within another closed set does not violate any of Kuratowski's four axioms, and the problem of inheritance and the fragile class that we noted in the third section is just an example of nested systems that work, sometimes for years, until they stop doing so.

What decides between nesting and disjunction is the bet of the exclusion postulate, and now we have, thanks to the third bridge, a better reason than before to sustain it: if the boundary between two systems measures their entanglement, and entanglement is a resource that is not distributed without limit, then an Ego that is already maximally linked to its Shadow through their shared boundary cannot, at the same time, be equally linked to a third psychic complex as if that complex were also within it. The Shadow cannot be a nested horizon in the same sense as the Ego. It has to be a *disjoint complex*, a neighboring island—and the boundary they share with the Ego is literally the measure of how much what is repressed is filtered towards the conscious.

## XI. An Archipelago, Not a Russian Doll

This disrupts the image of the Russian doll: the personal unconscious wrapping the Self, the collective wrapping the personal, layers within layers. If we accept the exclusion postulate, that image is untenable: if the collective unconscious were a horizon that contained the Ego and the Shadow, neither one nor the other would be true horizons, only zones of higher density within a single closure.

The model that remains is that of an archipelago floating on the Reservoir: a *disconnected* space, which can be split into pieces, none of which touches the interior of the others, although they can touch along the boundary and, we now know, exchange through it a measurable amount of correlation—both with each other and with the sea from which they all emerged. The Ego is an island. The Shadow is another. Each significant archetype can be yet another island, with its own closure and its own shared boundary entropy with neighboring islands and with the Reservoir.

Integrating no longer means opening the Shadow and putting it inside the Ego. Integrating is deliberately increasing the entanglement across a boundary that continues to exist: more correlation, more exchange, without either of the two systems losing its closure.

## XII. The Membrane That Learns to Filter

Let us return, to finish, to the cell of the beginning.

The immune system is, in essence, a mechanism dedicated to distinguishing the self-horizon from the alien. When that recognition fails in one direction, the body attacks what is its own: an autoimmune disease, the Ego attacking its own Shadow by confusing it with an external invader. When it fails in the other direction, it tolerates what it should stop.

Neither total attack nor total tolerance is health. Health is a boundary that knows how to filter. And now we can say it with the four bridges already built: a healthy boundary is not the one that reduces to zero the entanglement with the Shadow—that would be dissociation, the clopen boundary, the island that does not even share a coast—, nor the one that allows itself to be invaded until it loses its closure—the forced nesting that the exclusion postulate prohibits, or the inundation from the Reservoir itself that we described as psychosis—. It is a boundary that, like the horizon that evaporates without ceasing to be a horizon in each instant, can change size over a lifetime, widening or shrinking its exchange with what is repressed and with the common background, without ever ceasing, while it lasts, to be genuinely closed.

This is, word for word, what Jungian Individuation asked of us in Chapter 22 when we spoke of a horizon that "becomes permeable without losing its coherence." Now we have, in addition to the metaphor, the mechanism: a mature boundary is not a weaker boundary, it is a boundary with better receptors. It knows what to let pass from the Shadow—what projections to recognize as its own, what impulses to reintegrate without threatening the Ego's identity—without needing, to do so, to swallow the entire Shadow and convert it into undifferentiated self-tissue. There remain two horizons. What changes is the quality of the customs connecting them.

## XIII.

The limit that, closing upon itself, says for the first time "I am."

---

### Note to Chapter 24

**What we do know:** that Kuratowski's four axioms exhaust all the pure topology that this chapter needs, and that any other statement—the exclusion postulate, the psychic extension of entanglement entropy—is an added hypothesis and not a consequence of those axioms; that idempotency is the exact signature of a phase transition, which gives condensation a precise foundation; that a decreasing filtration of closed sets describes evaporation without contradicting idempotency, provided its limit is the Reservoir and not the vacuum; and that holographic entanglement entropy and vacuum entanglement are real physics, not loose analogies.

**What we don't know:** whether extending this physics—holographic and vacuum—from the geometry of spacetime to the architecture of consciousness is a fertile structural hypothesis or a leap that physics does not support outside its original domain; whether the exclusion postulate is, at its root, the same restriction as the monogamy of entanglement viewed from another register; and whether the Reservoir, as this chapter needs it, is anything more than a useful image for what physics already knows about the vacuum.

**Remaining questions:** what observation would distinguish a universe where the Shadow was genuinely nested from one where it was a disjoint complex? What would distinguish, in a real life, an Individuation that progresses by gradual evaporation towards the Reservoir from one that occurs by a single sudden crystallization? And what would distinguish, clinically, an orderly evaporation from the sudden inundation that we have called psychosis?

**If you only take away one idea:** you are not what is inside your limits; you are the very act of having closed them.
