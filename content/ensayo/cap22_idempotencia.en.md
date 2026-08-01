---
title: THE IDEMPOTENCY OF BEING
section: PART THREE: THE LIMITS OF THE HORIZON
---

## I. The Wave and Its Edge

Where does a wave end?

Not on the wet sand it leaves behind when retreating, nor in the foam that dissolves a meter further. The wave is, from beginning to end, the very movement of that boundary between water and air: take away the edge and there is no "more wave" underneath, there is nothing left. We begin with this simple intuition because it is the same one that, on a larger scale and in more abstract registers, will sustain this entire chapter: the boundary does not delimit a thing that would exist just the same without it. The thing *is* its boundary.

We tend to imagine limits as accidents of space, lines we draw for convenience and that we could move without the interior reality flinching. A continent remains the same continent even if we move its coast a few meters. A company remains the same company even if it changes its headquarters. That belief works well for objects we already took for granted before asking about their boundary. But there is a different class of entity—and I suspect it is the most interesting class—in which the question is inverted: it is not that the object has a boundary, it is that the boundary is all there is, and the object is the name we give to the fact that this boundary sustains itself.

Consider something as modest as a legal entity. A corporation is not the building, nor the employees, nor the money in the account: it is, literally, a limit of liability traced by a legal act, a closure that separates what belongs to the corporation from what belongs to those who founded it. Removing that limit—"piercing the corporate veil," as law says, with an expression that already intuits what we are about to develop—does not leave a bare but recognizable corporation. It leaves, simply, a set of natural persons without the entity that grouped them. The limit did not protect something that already existed underneath. It was the sole reason there was something there to protect.

There is a tradition that traverses the physics of black holes, software engineering, cell membrane biology, and the most abstract topology, and that sustains that same thesis in each of its registers: there are systems—perhaps all those that truly deserve to be called systems—in which the limit is not an addition, but the very act that constitutes them. The operation that converts a scattered handful of points into something with its own identity is what we call, in mathematics, *closure*.

We are going to follow this thread through several different registers because they will all help us with a very concrete question about the interior architecture of a person: whether that which deep psychology calls the Shadow can live nested within the Ego, like a bubble within another bubble, or whether it must, by force, be something else.

## II. The Horizon That Is Not a Wall

An event horizon is not made of anything. It is not a membrane, nor a shell, nor a wall. It is the place where spacetime bends so much that not even light, directed outward at full speed, manages to escape. It does not separate two regions of space, as a wall separates two rooms; it separates two regions of the possible future. Outside, the future is open: a photon emitted outward ends up reaching some distant observer. Inside, that same emission is a contradiction: all paths, even those pointing "outward," end up in the singularity.

And here something happens that seems like a sleight of hand but is serious physics.

> **In physics this is called:** Bekenstein-Hawking entropy, the formula that says the disorder of a black hole does not depend on how much is inside, but on how large its surface area is.
> **In daily life it is like:** a library whose complete catalog fits written on the facade of the building. There is no need to enter to know everything it contains: the facade, if you know how to read it, already says it all.

All the complexity that falls inside a black hole—every particle, every history—remains encoded on the surface of its horizon, not in its volume. The horizon does not just hide: by hiding, it *represents*. It is the only place where the interior becomes legible from the outside. Without that horizon, the collapsed matter would not be a black hole, a system with its own temperature and mass; it would be just a nameless jumble of particles. The limit is what imposes the coherence that gravity, on its own, does not grant.

There is one more detail, almost cruel in its elegance, that should be added here: the so-called no-hair theorem. It says that a black hole, seen from the outside, is completely described by only three numbers: its mass, its charge, and its angular momentum. Nothing else. It does not matter if what fell inside was an entire star, a library, or the corpse of a cat: the horizon forgets the biography and preserves only the bookkeeping. It is the most extreme version possible of what we said about the corporation: the interior, however rich it was, dissolves into three figures that the limit exhibits to the outside. We will return to this idea, under another name, when we reach the Jungian Persona.

And there is still a third piece we cannot keep quiet, because it is what gives the horizon its true destiny: it is not an eternal closure. Black holes evaporate. What Hawking discovered is that the quantum vacuum itself, right at the edge of the horizon, produces pairs of particles where one falls inward and the other escapes outward, and that this trickle, sustained over an unimaginably long time, ends up consuming the entire black hole. The most solid horizon that exists in the universe is not, on a cosmic scale, a life sentence: it is a loan. It guards while the closure lasts, and the closure, sooner or later, pays for itself.

## III. The Door That Decides What Is Seen

Let us transplant this to something closer: a software object. A well-designed object keeps an internal state—variables, structures, processes—that no one from the outside can touch directly. The only thing accessible is its interface: a handful of public functions that act, bridging the distances, like the surface of that horizon. You cannot read a private variable without going through the door that the object itself decided to leave open, just as you cannot see a photon that has already crossed the horizon.

> **In physics this is called:** encapsulation.
> **In daily life it is like:** a car. You do not need to understand internal combustion to drive it; the steering wheel and the pedals are the horizon that translates all that complexity into four gestures that anyone can learn.

What engineering discovered out of pure practical necessity, we formalize here as a principle: an object without an interface is not a free object, it is an inert object. Kant called it, for another matter, the *thing-in-itself*: something without a window to the outside is not more authentic for being closed shut; it simply does not participate in the world. The boundary is not the prison of the object. It is the condition for the object to exist socially, so that it can be touched, used, integrated into something larger than itself.

Biology, long before computer science, had already resolved this same problem with the same solution. A cell without a membrane is not a freer cell; it is scattered cytoplasm, with nothing to call "its own." The membrane does not enclose life: it makes it possible, because only within a selective limit can there be a difference in concentration, a gradient, a reaction that does not dissolve immediately into the surrounding chaos. And that limit, just like the interface of a software object, is not a blind wall: it is full of channels, receptors, and pumps that decide with extreme precision what enters, what leaves, and what remains outside forever. The cell, like the black hole, like the encapsulated object, is not what is inside. It is the admission policy that decides what can come to be inside.

Here it is worth noting, in passing, a problem that software engineering itself knows well and that will be useful to us later: that of inheritance. When a class "inherits" from another, it does not create two separate objects with a communication interface between them, but a single composite object, where the child class literally contains a copy of the structure of the parent. It is, in the vocabulary we are going to develop, a genuine case of nesting: a horizon within another horizon, merged to the point that modifying the parent class modifies, in cascade, all its children. Programmers have spent decades arguing whether this is a blessing or a trap—the problem, in the jargon of the trade, is sometimes called "the fragile base class problem"—precisely because deep nesting, when something fails, does not allow one to know clearly where one system ends and the other begins. Let us keep this concern. We are going to need it.

## IV. Closing Twice Adds Nothing

Let us now go to the barest register of all, topology, where the idea is stripped of physics, biology, and engineering to show its pure skeleton.

A set is not just a list of elements: it is a list endowed with a notion of closeness. There are points that, without belonging entirely to a set, are so close to it that no space separates them—they are its shadow on the outside, its limit points. When a set already contains its entire shadow, we say it is *closed*.

> **In physics this is called:** topological closure and idempotency: closing a set once completes it; closing it a second time adds nothing.
> **In daily life it is like:** a door that already fit well in its frame. Closing it again does not leave it "more closed"; either it is closed, or it is not.

That is the idea that really matters here: a closed system has no degrees. It does not become "more itself" over time nor accumulate identity by repetition. Either it has finished integrating its limits, or it remains a fuzzy set that is lost in the background. The horizon of a black hole does not become more opaque by having existed longer; a software object does not become more watertight by invoking its own methods more times. Closing is a leap, not an accumulation.

It is worth pausing a moment more on the vocabulary, because it will save us from confusion in what follows. Every topological space is divided, for any set A of interest, into three zones: the *interior* of A (the points that are inside A with room to spare, surrounded on all sides by other points of A), the *exterior* of A (the same, but outside), and the *boundary* of A, which is the zone of contact: the points that cannot be separated either from A or from what is not A, no matter how small the neighborhood we trace. The boundary, in this technical sense, is literally the place where A and its outside touch without merging. A set can even be, at the same time, open and closed—what the discipline calls, without much imagination, a *clopen set*—and when that happens it means something very precise: that this fragment of space has absolutely no point of contact with the rest, that it is completely disconnected from everything else, like an island that does not even share a coast with the sea surrounding it.

And there is one last piece of vocabulary we need: separation. A topological space is called *Hausdorff* if, given any two distinct points, one can always find a neighborhood around each that does not overlap with that of the other. It is a very dry way of saying something very intuitive: in a reasonable space, two different things can be as close as you want, but there is always a margin, however minimal, that keeps them identifiable as two and not as one. Without that property, the very notion of "individual"—of a system distinguishable from another system—becomes blurred to the point of losing meaning.

## V. The Shadow: What Topology Says and What We Bet

And with this we come to the problem at hand. Let us think of consciousness as a horizon—a closure over a certain relationship of integrated information—and let us call the Ego the major closure of that set of processes. And let us think of that which the Ego cannot admit without ceasing to be what it is—the repressed, the split-off, what the Jungian tradition calls the Shadow. The question is whether the Shadow lives nested within the Ego, a smaller bubble floating inside another, or whether it must be, structurally, something else.

We must be honest about what topology can answer here and what it cannot. Topology alone does not decide this. A subset S of a closed set E can, without any contradiction, have its own closure and be perfectly contained in E: there is no law of set theory that prohibits a nested closure within another. The problem of inheritance and the fragile base class we noted in section three is just an example of that: nested systems that work, sometimes for years, until they stop doing so. If we remained only with mathematics, the nested Shadow would remain a legitimate possibility.

What decides between that possibility and its opposite is not a theorem, it is a bet we bring from elsewhere: from integrated information theory, which postulates that in the same substrate and the same instant only one maximal closure can exist, a single integration center that counts as "conscious" in the full sense. We call this the exclusion postulate.

It is worth, before accepting this bet, looking for an ally in physics itself, because it is not as lonely as it might seem. Quantum mechanics has its own version of the same principle, and it is called *monogamy of entanglement*. Two particles can be maximally entangled with each other—sharing a bond so close that knowing the state of one instantly determines the state of the other—but if that happens, neither of them can, at the same time, be equally entangled with a third. Entanglement is not distributed for free among many: the more a system commits to another, the less capacity for bonding it has left for a third. It is, in the language of particles, exactly the same exclusion postulate we are applying to consciousness: there is no room for two centers of maximum integration competing for the same space. The monogamy of entanglement does not prove that the IIT exclusion postulate is correct—they are theories of different registers, and we have already promised not to confuse structural analogy with mathematical identity—but it does tell us that the underlying intuition, that maximum integration is a resource that cannot be distributed without losing it, has serious precedents in the physics we already know, and is not a whimsical occurrence invented to make the Shadow fit where we want.

If we accept the postulate, then something interesting does follow: if S is contained in E, its boundary is never an absolute boundary, because its "outside" always includes E itself; it only ceases to be traversed by the major closure if S is disjoint from E, if both share a border—Hausdorff, but neighbors—without either containing the other.

Accepting that bet—and I believe there are good reasons to accept it—forces us to a concrete conclusion: the Shadow cannot be a nested horizon in the same sense as the Ego. It has to be a *disjoint complex*, a neighboring island, not an interior bubble. What we call repression or projection would not be, then, the transit between one bubble and another within the same space, but the interaction between two different closures through the boundary they share.

It is best not to disguise this as mathematical necessity. It is a choice of model, supported by a hypothesis external to topology—and reinforced, though not proven, by an independent physical intuition—that is coherent and fertile. But it remains a choice, not an inevitable discovery.

## VI. An Archipelago, Not a Russian Doll

This disrupts the image, so dear to certain psychologies of the soul, of the Russian doll: the personal unconscious wrapping the Self, the collective wrapping the personal, layers within layers down to something divine in the center. If we accept the exclusion postulate, that image is untenable: if the collective unconscious were a horizon containing both the Ego and the Shadow, neither would be true horizons, just zones of higher density within a single closure. Their autonomy would be an illusion.

The model that remains is that of an archipelago: not an undifferentiated continuum, but a *disconnected* space, in the exact topological sense of the term—a space that can be split into pieces, none of which touch the interior of the others, though they may touch at the boundary. The Ego is an island. The Shadow is another, separate, perhaps joined to the first by an isthmus of projections. Each significant archetype—the parental complex, the anima, the wise old man—can be yet another island, with its own closure, its own surface of contact with the others.

And then "integrating" no longer means opening the Shadow and putting it inside the Ego—that would be to violate exclusion, forcing two closures to become one, and that only ends in the dissolution of one of the two, or in the "fragile base class problem" transplanted to the psyche: a system that inherits so deeply from another that one can no longer be touched without destabilizing the other. Integrating is building a stable bridge between two horizons, a protocol by which information travels without either of the two systems losing its closure. It is exactly what an impossible clopen set and a well-behaved Hausdorff space permit: closeness without fusion, contact without dissolution. It is the art of communication between horizons, not that of fusion. Anyone who has tried it the other way around—forcing fusion, putting an alien horizon inside their own instead of leaving it as a neighbor—tells a different story, and that story is not the one in this book.

## VII. The Membrane That Learns to Filter

Let us return, to finish, to the cell of the beginning, because it offers us the best possible image of what it means to mature without ceasing to be closed.

The immune system is, in essence, a mechanism dedicated entirely to a single problem: distinguishing the self-horizon from the alien. Every cell in the body carries, on its surface, a sort of molecular password—the major histocompatibility complex, to give it its technical name—that tells the immune system "this is mine, do not attack." When that recognition fails in one direction, the body attacks what is its own: that is an autoimmune disease, the Ego attacking its own Shadow because it confused it with an external invader. When it fails in the other direction, the body tolerates what it should not tolerate, and that is, in the medical register, how a body loses the ability to distinguish itself from what is invading it.

Neither total attack nor total tolerance is health. Health is a boundary that knows how to filter: that lets oxygen, food, and useful information pass, and selectively stops what threatens to dissolve the identity of the entire system. No one would describe a healthy immune system as one that has "eliminated its membrane" to stop discriminating between self and other; we would describe it, with good reason, as dead. Immunological maturity is not the disappearance of the boundary. It is its refinement.

This is, word for word, what Jungian Individuation asked of us in Chapter 21 when we spoke of a horizon that "becomes permeable without losing its coherence." Now we have, in addition to the metaphor, the mechanism: a mature boundary is not a weaker boundary, it is a boundary with better receptors. It knows what to let pass from the Shadow—what projections to recognize as its own, what impulses to reintegrate without threatening the Ego's identity—without needing, to do so, to swallow the entire Shadow and convert it into undifferentiated self-tissue. There remain two horizons. What changes is the quality of the customs connecting them.

## VIII.

The limit that, closing upon itself, says for the first time "I am."

---

### Note to Chapter 23

**What we do know:** that the event horizon, information encapsulation, the cell membrane, and topological closure share the same formal logic—the boundary does not separate, it constitutes—and that this logic, applied to the problem of the Shadow and the Ego, forces a choice between Shadow-nested and Shadow-disjoint, with no comfortable middle ground. We also know that quantum physics has, in the monogamy of entanglement, a serious precedent for the intuition that maximum integration is not distributed among several centers at once.

**What we don't know:** whether the analogy between physical horizon and psychic closure is a real mathematical identity or a fertile but unproven structural analogy; whether the exclusion postulate that decides in favor of disjunction is a fact about consciousness or a choice of model among other possible ones; and whether the monogamy of entanglement is, at its root, the same restriction as the exclusion postulate viewed from another register, or just a family resemblance without real kinship.

**Remaining questions:** what observation, in principle, would distinguish a universe where the Shadow was genuinely nested from one where it was a disjoint complex—if there is any. And, more uncomfortable still: if the "fragile base class problem" of software engineering has a clinical equivalent, what would a psyche look like that had attempted, and partly achieved, the forbidden nesting?

**If you only take away one idea:** you are not what is inside your limits; you are the very act of having closed them.
