---
title: THE INSTANTIATION CYCLE
subtitle: (Or: Birth, death and garbage collection)
section: PART ONE: THE CYCLE OF THE HORIZON
chapterNumber: 8
illustrationId: il09_5
illustrationTitle: Instantiation
illustrationDescription: A continuous reserve of data lines flowing chaotically in shades of blue. From it, a circular region closes and encapsulates itself, ordering its internal data into a warm glow, while another sphere comes apart, releasing its golden circuits into the sea of data.
---

The dialogue between the reservoir, birth and the return to nothing gains an unexpected clarity if we leave quantum physics and Eastern metaphysics for a moment and enter a more pragmatic field: systems engineering and software design.

In modern computing, every time we open an application or load a web page we witness a miniature re-enactment of the complete cycle of the horizon.

---

### The *heap* as reservoir

In the architecture of any software, the memory of a running program is divided into two large zones: the *stack* (the call stack of immediate execution) and the **heap** (where dynamic memory lives).

The *heap* is the digital equivalent of the reservoir: a continuous, enormous, unstructured reserve of memory. Before a program requests resources, the *heap* is pure potential, an ocean of empty gigabytes with no objects, variables, functions or identities; only an undifferentiated flow of memory addresses waiting for someone to write in them. It is the *Hun Dun* of computing: a state of maximum symmetry in which nothing is delimited and everything is possible.

The *heap* has no inside or outside. It is a physical continuum (the silicon chips of the RAM) that lacks any internal logical structure until software intervenes.

---

### Birth as instantiation and encapsulation

The birth of a conscious system, of a horizon, corresponds to **instantiation**.

When the program executes an instruction such as `new Object()`, a phase transition takes place in the *heap*. The memory manager reserves a specific block of bytes from that undifferentiated mass and draws a logical boundary around it. At that instant, the class constructor writes the initial values and activates the most fundamental property of software design: **encapsulation** (or the principle of *information hiding*, formulated by David Parnas in 1972).

Encapsulation does something extraordinary: it divides the block of memory into two levels of visibility.

1. **The public interface (*public API*)**: the set of methods and signatures the object exposes to the rest of the system. It is the contact surface, the equivalent of the event horizon. The rest of the program can communicate with the object only by invoking those public methods.
2. **The private state (*private fields*)**: the internal state variables that the object jealously keeps inside.

Here access dualism appears in its purest form. From outside the object, its interior is a black hole: no code in the rest of the system can directly read or alter a variable declared `private`. The internal memory is inaccessible, and we know of it only what the public API lets us query. From inside the object itself, by contrast (through the self-reference `this`), access to that private state is total, immediate and natural.

Subjectivity, the inside, does not require a matter different from that of the rest of the computer. It is the perspective of the code running within the encapsulation boundary of the instance.

---

### Death as freeing memory and garbage collection

The life of an object consists in processing messages that cross its public API, modifying its private state and returning responses to the outside. But that cycle has an end, dictated by the system's resource management.

In programming, an object dies when no reference points to it any longer. If no variable in the program holds its address, the object is orphaned and the runtime environment can no longer reach it.

Then the **garbage collector** steps in, or the memory is freed explicitly (`free()` or `delete`).

Death is not the physical annihilation of the object's components. The garbage collector does not erase the electrons in the RAM cells; it merely dissolves the encapsulation boundary and declares that block of addresses available again in the common *heap*. Once the logical boundary breaks, the object's private state is no longer protected, and the information that defined its "identity" or its "internal memory" is reabsorbed into the undifferentiated mass of memory and quickly loses its structure.

The instance has ceased to exist, but the substrate that held it has returned intact to the reservoir.

---

### "Karma" in software systems

In the ideal world of the theory of computation, an object's return to the *heap* leaves no trace. But in real systems, every cycle of instantiation and release alters the environment permanently:

- **Side effects**: the object may have written data to a log file, sent packets over the network or modified global variables of the operating system.
- **Memory fragmentation**: even when the object's space is freed, the geography of the *heap* is no longer the same. Small gaps have been left between blocks of memory that condition where and how the next objects can be instantiated.
- **Memory leaks**: if the object held a hidden reference to an external resource, that portion of the *heap* stays blocked forever, even after the main object has been collected.

This structural conditioning that an object's existence and disappearance exert on the *heap* is the exact analogy of **karma**. The memory reserve does not return to its clean original state: it keeps the texture and fragmentation left by every system that existed in it. The next instance will not be born into a perfect vacuum, but into an environment shaped by the history of previous executions.

The identity of the object disappears, but the deformation it caused in the system persists.

---

> **Note to Chapter 8**
>
> **What we do know:** That encapsulation and information hiding divide a system into a public interface and a private state. That garbage collection returns resources to the *heap* without destroying physical memory. That fragmentation and side effects are unavoidable in real systems.
>
> **What we don't know:** Whether the biological brain implements mechanisms analogous to synaptic garbage collection beyond the homeostasis of sleep. Whether there is a global "garbage collector" for the information of the physical universe.
>
> **Open questions:** Is consciousness a single thread of execution or a distributed multithreaded system? Can mental memory leaks (traumas, repetitive patterns) be considered failures in the self's garbage collection?
>
> **If you take away only one idea:** To be born is to reserve memory and encapsulate it; to die is to release the boundary and return to the *heap*. The abyss between your mind and the outside world is the mark of a good architecture that protects its private state behind a public interface.
>
> **Further reading:** Parnas (1972), "On the criteria to be used in decomposing systems into modules"; Dijkstra (1968), "Go To Statement Considered Harmful" (on control structure); Knuth (1997), *The Art of Computer Programming* (dynamic memory management).
