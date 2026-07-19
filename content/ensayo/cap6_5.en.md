---
title: THE CYCLE OF INSTANTIATION
subtitle: (Or: Birth, Death, and Garbage Collection)
section: PART ONE: THE CYCLE OF THE HORIZON
---

The dialogue between the reservoir, birth, and the return to nothingness acquires an unexpected clarity if we abandon quantum physics and Eastern metaphysics for a moment to enter a more pragmatic territory: systems engineering and software design.

In modern computing, every time we open an application or load a webpage, we are witnessing a micro-scale recreation of the full cycle of the horizon.

---

### The Heap as Reservoir

In the architecture of any software, dynamic memory is organized into two main structures: the *stack* (the call stack of immediate execution) and the **heap**.

The heap is the digital equivalent of the reservoir. It is a pool of continuous, massive, and unstructured memory. Before a program requests resources, the heap is pure potential: an ocean of empty gigabytes where there are no objects, no variables, no functions, and no identities. There is only an undifferentiated flow of memory addresses ready to be written. It is the *Hun Dun* of computing: a state of maximum symmetry and disorder where nothing is delineated, but everything is possible.

The heap has no "inside" or "outside." It is a physical continuum (the silicon chips of the RAM) that lacks internal logical structure until the software intervenes.

---

### Birth as Instantiation and Encapsulation

The birth of a conscious system—of a horizon—corresponds exactly to **instantiation**.

When the program executes an instruction like `new Object()`, a phase transition occurs in the heap. The memory manager reclaims a specific block of bytes from that undifferentiated pool and draws a logical boundary around it. In that instant, the class constructor writes the initial values and activates the most fundamental property of software design: **encapsulation** (or the principle of *information hiding*, formulated by David Parnas in 1972).

Encapsulation does something extraordinary: it divides the memory block into two levels of visibility:

1. **The public interface (public API)**: The set of methods and signatures that the object exposes to the rest of the system. It is the surface of contact, the equivalent of the event horizon. The exterior of the program can only communicate with the object by invoking these public methods.
2. **The private state (private fields)**: The internal state variables that the object jealously hides inside itself.

Here, the dualism of access manifests in its purest form. From "outside" the object, its interior is a black hole: there is no code in the rest of the system that can directly read or alter a variable declared as `private`. The internal memory is inaccessible; we only know what the public API allows us to interact with. However, from "inside" the object itself (through the self-reference `this`), access to that private state is total, immediate, and natural.

Subjectivity—the "inside"—does not require a different material than the rest of the computer. It is simply the perspective of the code executing within the encapsulation boundary of the instance.

---

### Death as Deallocation and Garbage Collection

The life of an object consists of processing messages that cross its public API, modifying its private state, and returning responses to the exterior. But this cycle has an end determined by the system's resource management.

In programming, the death of an object occurs when there are no longer any references pointing to it. If no variable in the program stores its address, the object is orphaned. To the execution environment, it becomes inaccessible.

That is when the **Garbage Collector** intervenes, or the system's destructor (`free()` or `delete`) is executed.

Death is not the physical annihilation of the object's components. The garbage collector does not physically erase the electrons from the RAM memory cells; it simply dissolves the encapsulation boundary. It declares that this block of addresses is once again available to the common heap. When the logical boundary is broken, the private state of the object is no longer protected. The information that previously defined its "identity" or its "internal memory" is reintegrated into the undifferentiated memory pool, losing its structure immediately.

The instance has ceased to exist, but the computing matter that sustained it has returned entirely to the reservoir.

---

### "Karma" in Software Systems

In an ideal world of computer science theory, the return of an object to the heap leaves no trace. But in real systems engineering, every cycle of instantiation and deallocation permanently alters the environment:

- **Side effects**: The object may have written data to a log file on the disk, sent packets over the network, or modified global state variables in the operating system.
- **Memory fragmentation**: Even if the object's space is freed, the geography of the heap is no longer the same. Small hollows and divisions have been created between memory blocks, which conditions where and how the next objects can be instantiated in the future.
- **Memory leaks**: If the object maintained a hidden reference to an external resource, that portion of the heap remains permanently blocked, even after the main object has been collected.

This structural conditioning that the existence and dissolution of an object exert on the heap is the exact analogy of **karma**. The memory reservoir does not return to its original clean state; it retains the texture and fragmentation left by every system that existed within it. The next instantiation will not be born in a perfect void, but in an environment configured by the history of previous executions.

The identity of the object disappears, but the deformation it caused in the system persists.

---

> **Note to Chapter 8**
>
> **What we do know:** That encapsulation and information hiding divide a system into a public interface and a private state. That garbage collection reallocates resources to the heap without destroying physical memory. That fragmentation and side effects are inevitable in real systems.
>
> **What we don't know:** Whether the biological brain implements mechanisms analogous to synaptic garbage collection beyond the homeostasis of sleep. Whether a global "garbage collector" exists for the information of the physical universe.
>
> **Remaining questions:** Is consciousness a single thread of execution or a distributed multithreaded system? Can mental memory leaks (traumas, repetitive patterns) be considered failures in the garbage collection of the self?
>
> **If you take away just one idea:** Birth is allocating memory and encapsulating; death is releasing the boundary and returning to the heap. The abyss between your mind and the outside world is not spiritual magic: it is the design of a good architecture that protects its private state through a public API called an interface.
>
> **Readings:** Parnas (1972), "On the criteria to be used in decomposing systems into modules"; Dijkstra (1968), "Go To Statement Considered Harmful" (on control structure); Knuth (1997), "The Art of Computer Programming" (dynamic memory management).