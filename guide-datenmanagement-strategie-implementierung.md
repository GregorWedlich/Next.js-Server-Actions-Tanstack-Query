# Guideline: Datenmanagement in Next.js (App Router) – Strategie & Implementierung

Diese Guideline hilft dir bei der Entscheidung und Implementierung der passenden Strategie für das Datenmanagement (Lesen und Schreiben) in deinem Next.js App Router Projekt, insbesondere im Zusammenspiel mit Tanstack Query und Server Actions.

## Phase 1: Analyse & Strategieentscheidung

**Schritt 1: Was ist das Hauptziel deiner Komponente oder Seite?**

- **(A) Hauptsächlich Daten anzeigen:** Der primäre Fokus liegt auf der Darstellung von Informationen vom Server. Benutzerinteraktionen sind minimal oder nicht vorhanden bzw. ändern die angezeigten Daten nicht direkt.

  - **Beispiele:**
    - Blog-Post / Nachrichtenartikel
    - Produkt-Detailseite (Nur Ansicht)
    - Dashboard-Übersicht (Statistiken, Diagramme)
    - Dokumentationsseite
    - Benutzerprofil (Nur Ansicht eines _anderen_ Benutzers)
    - "Über uns"-Seite / Team-Seite
    - Wettervorhersage-Anzeige
  - ➡️ **Gehe zu [Schritt 2](#schritt-2-strategie-fuer-hauptsaechlich-daten-anzeigen).**

- **(B) Daten ändern/manipulieren:** Der primäre Fokus liegt auf einer spezifischen Aktion des Benutzers, die Daten auf dem Server verändert. Die Anzeige von Daten ist oft nebensächlich oder dient nur dem Kontext der Aktion.

  - **Beispiele:**
    - Login- / Registrierungsformular
    - Passwort-Zurücksetzen-Formular
    - Einfacher "Like"-Button (die Aktion steht im Vordergrund)
    - Newsletter-Anmeldeformular
    - Datei-Upload-Seite
    - Einzelner Konfigurationsschalter (z.B. Dark Mode Toggle)
  - ➡️ **Gehe zu [Schritt 3](#schritt-3-strategie-fuer-daten-aendernmanipulieren).**

- **(C) Eine Mischung aus beidem:** Die Komponente/Seite zeigt relevante Daten an UND ermöglicht dem Benutzer gleichzeitig signifikante Interaktionen, um diese oder zugehörige Daten zu ändern. Lesen und Schreiben sind eng miteinander verknüpft.
  - **Beispiele:**
    - Todo-Liste (Anzeigen + Hinzufügen/Abhaken/Löschen)
    - Warenkorb (Anzeigen + Menge ändern/Entfernen)
    - Einstellungsseite (Anzeigen + Ändern der Einstellungen)
    - CMS-Editor (Anzeigen + Bearbeiten des Inhalts)
    - Social-Media-Feed (Anzeigen + Liken/Kommentieren/Teilen)
    - Online-Shop mit Filtern (Anzeigen + Filter ändern)
    - Kanban-Board (Anzeigen + Karten verschieben)
    - Tabellen-Interface mit Inline-Bearbeitung (Anzeigen + Zellen bearbeiten)
  - ➡️ **Gehe zu [Schritt 4](#schritt-4-strategie-fuer-mischung-aus-daten-anzeigen-und-aendern-mutations).**

**<a id="schritt-2-strategie-fuer-hauptsaechlich-daten-anzeigen"></a>Schritt 2: Strategie für "Hauptsächlich Daten anzeigen"**

- **Frage:** Wie oft ändern sich die Daten? Benötigst du fortgeschrittenes Client-Caching/State-Management (Hintergrund-Updates, `isLoading`-Status etc.)?
  - **Selten / Nein:** Daten sind statisch oder Next.js Caching reicht. Client-JS minimieren.
    - ✅ **Strategie: Reiner RSC-Ansatz.**
      - **Implementierung:** Siehe **[Phase 2, Abschnitt A](#abschnitt-a-reiner-rsc-ansatz--hybrid-ansatz-basis)**.
  - **Häufig / Ja:** Daten ändern sich oft, Client-Features von Tanstack Query sind gewünscht.
    - ✅ **Strategie: Tanstack Query für Lesen.**
      - **Implementierung:** Siehe **[Phase 2, Abschnitt B (nur Muster 1: Lesen)](#abschnitt-b-kombinierter-ansatz-tanstack-query--server-actions)**. Für eventuelle Schreibvorgänge siehe **[Abschnitt B (Muster 2: Schreiben)](#2-daten-schreiben-mit-server-action--usemutation-1)**.

**<a id="schritt-3-strategie-fuer-daten-aendernmanipulieren"></a>Schritt 3: Strategie für "Daten ändern/manipulieren"**

- **Frage:** Wie wichtig sind nahtlose UI-Updates, Ladezustände, detaillierte Fehlerbehandlung im Client und ggf. Optimistic Updates?
  - **Sehr wichtig / Ja:** Sofortiges Feedback und Client-State-Management sind entscheidend.
    - ✅ **Strategie: Server Action + `useMutation`.**
      - **Implementierung:** Siehe **[Phase 2, Abschnitt B (Muster 2: Schreiben)](#2-daten-schreiben-mit-server-action--usemutation-1)**. Das Lesen der zugehörigen Daten erfolgt meist ebenfalls über Tanstack Query (siehe **[Abschnitt B, Muster 1: Lesen](#1-daten-lesen-mit-usequery-1)**).
  - **Weniger wichtig / Nein:** Einfache Bestätigung/Reload reicht.
    - ✅ **Strategie: Server Action + Form Action / `startTransition`.**
      - **Implementierung:** Siehe **[Phase 2, Abschnitt A (nur Schreiben)](#2-daten-schreiben-mit-server-actions--revalidierung)**. Das Lesen kann ebenfalls über den RSC-Ansatz erfolgen (**[Abschnitt A, Muster 1: Lesen](#1-daten-lesen-in-server-components)**).

**<a id="schritt-4-strategie-fuer-mischung-aus-daten-anzeigen-und-aendern-mutations"></a>Schritt 4: Strategie für "Mischung aus Daten Anzeigen und Ändern (Mutations)"**

- **Frage:** Überwiegt die Komplexität der Interaktionen und die Notwendigkeit für Client-seitiges State Management?
  - **Ja:** Interaktionen sind komplex, Vorteile von Tanstack Query sind signifikant.
    - ✅ **Strategie: Kombinierter Ansatz (Tanstack Query + Server Actions).**
      - **Implementierung:** Siehe **[Phase 2, Abschnitt B (Muster 1 & 2)](#abschnitt-b-kombinierter-ansatz-tanstack-query--server-actions)**. Dies ist oft der robusteste Ansatz für interaktive UIs.
  - **Nein:** Interaktionen überschaubar, Next.js-Mechanismen reichen, Komplexität gering halten.
    - ✅ **Strategie: Hybrid-Ansatz (RSC + Server Actions + Revalidierung).**
      - **Implementierung:** Primär **[Phase 2, Abschnitt A](#abschnitt-a-reiner-rsc-ansatz--hybrid-ansatz-basis)**. Für einzelne, hoch-interaktive Teile _könnte_ gezielt **[Abschnitt B](#abschnitt-b-kombinierter-ansatz-tanstack-query--server-actions)** eingesetzt werden.

---

## Phase 2: Implementierungs-Details

### <a id="abschnitt-a-reiner-rsc-ansatz--hybrid-ansatz-basis"></a>Abschnitt A: Reiner RSC-Ansatz / Hybrid-Ansatz (Basis)

**Ziel:** Maximale Server-seitige Logik, minimales Client-JS.

**<a id="1-daten-lesen-in-server-components"></a>1. Daten Lesen (in Server Components):**

- **Serverseitige Datenfunktion:** Definiert, WIE die Daten geholt werden.

  ```typescript
  // lib/queries/getItems.ts
  import { prisma } from "lib/prisma";
  export interface Item {
    id: string;
    name: string /* ... */;
  }

  // Diese Funktion läuft auf dem Server.
  export async function getItems(): Promise<Item[]> {
    // Hier könnten Caching-Optionen für Next.js' fetch hinzugefügt werden,
    // falls diese Funktion intern fetch nutzt.
    // Beispiel: return fetch('...', { next: { tags: ['items'] } }).then(res => res.json());
    // Wenn Prisma direkt genutzt wird, cached Next.js das Ergebnis des RSC-Renderns.
    return prisma.item.findMany();
  }
  ```

- **Datenabruf in RSC:** Ruft die Datenfunktion direkt auf und rendert das Ergebnis.

  ```typescript
  // app/items/page.tsx (Server Component)
  import { getItems, type Item } from "lib/queries/getItems";

  // Optional: Definiert, wie oft die *gesamte Seite* neu generiert werden soll (Zeit-basiert).
  // export const revalidate = 300; // z.B. alle 5 Minuten

  export default async function ItemsPage() {
    // Direkter Datenabruf beim Rendern der Seite auf dem Server.
    const items: Item[] = await getItems();

    // Kein Client-seitiger Lade-/Fehlerstatus hier, da die Seite erst ausgeliefert wird,
    // wenn die Daten (oder ein Fehler) vorhanden sind.
    // Fehlerbehandlung sollte in getItems oder hier mit try/catch erfolgen.

    return (
      <div>
        <h1>Items</h1>
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        {/* Formular zum Hinzufügen (oft eine Client Component) kann hier eingebunden werden */}
        {/* <AddItemFormRSC /> */}
      </div>
    );
  }
  ```

- **Caching/Revalidierung (Zusammenfassung für RSC-Lesen):**
  - **Initiales Caching:** Wird durch `fetch`-Optionen (wenn `fetch` genutzt wird) oder das Standard-Caching von RSC-Render-Ergebnissen durch Next.js bestimmt. `export const revalidate` in der Page setzt ein Zeitlimit.
  - **Aktualisierung nach Mutation:** Erfolgt durch Aufruf von `revalidatePath` oder `revalidateTag` _innerhalb_ der Server Action (siehe nächster Punkt).

**<a id="2-daten-schreiben-mit-server-actions--revalidierung"></a>2. Daten Schreiben (mit Server Actions & Revalidierung):**

- **Server Action:** Führt die Datenbankänderung aus und invalidiert den Cache der RSC.

  ```typescript
  // app/actions/itemActions.ts
  "use server"; // Markiert diese Funktionen als Server Actions
  import { prisma } from "lib/prisma";
  import { revalidatePath } from "next/cache"; // Funktion zur Cache-Invalidierung

  export interface ActionResult {
    success: boolean;
    error?: string;
  }

  // Diese Action wird vom Client aufgerufen, läuft aber auf dem Server.
  export async function addItemRSC(formData: FormData): Promise<ActionResult> {
    const name = formData.get("name") as string;
    // ... Führe hier serverseitige Validierung durch ...
    if (!name) return { success: false, error: "Name is required." };

    try {
      // Datenbankoperation
      await prisma.item.create({ data: { name } });

      // *** Wichtig für RSC-Update: ***
      // Weist Next.js an, den Cache für den angegebenen Pfad zu löschen.
      // Die ItemsPage wird beim nächsten Request neu gerendert.
      revalidatePath("/items");
      // Alternativ: revalidateTag('items'), wenn fetch mit Tags genutzt wurde.

      return { success: true }; // Erfolg melden
    } catch (error) {
      console.error("Error adding item:", error);
      return { success: false, error: "Database error." }; // Fehler melden
    }
  }
  ```

- **Aufruf aus Client Component (Variante mit `useTransition` für Feedback):**

  ```typescript
  // components/AddItemFormRSC.tsx
  "use client"; // Diese Komponente braucht Client-Interaktivität
  import { addItemRSC } from "app/actions/itemActions";
  import { useTransition, useRef } from "react"; // Hook für Pending-Status

  export function AddItemFormRSC() {
    // isPending zeigt an, ob die Action (in startTransition) noch läuft.
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null); // Für Formular-Reset

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      // startTransition sorgt dafür, dass die UI während der Action nicht blockiert
      // und setzt isPending entsprechend.
      startTransition(async () => {
        const result = await addItemRSC(formData); // Ruft die Server Action auf
        if (result.success) {
          formRef.current?.reset(); // Formular bei Erfolg zurücksetzen
        } else {
          // Einfache Fehleranzeige (könnte verbessert werden)
          alert(`Error: ${result.error}`);
        }
      });
    }

    return (
      <form onSubmit={handleSubmit} ref={formRef}>
        <input type="text" name="name" required disabled={isPending} />
        <button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Item"}
        </button>
      </form>
    );
  }
  ```

### <a id="abschnitt-b-kombinierter-ansatz-tanstack-query--server-actions"></a>Abschnitt B: Kombinierter Ansatz (Tanstack Query + Server Actions)

**Ziel:** Reichhaltige Client-Interaktivität mit Caching und nahtlosen UI-Updates durch Tanstack Query.

**Voraussetzungen:**

- Tanstack Query ist installiert (`@tanstack/react-query`, `@tanstack/react-query-devtools`).
- Ein `QueryProvider` ist im Root-Layout (`app/layout.tsx`) eingebunden.

**<a id="1-daten-lesen-mit-usequery-1"></a>1. Daten Lesen (mit `useQuery`):**

- **Serverseitige Datenfunktion:** (Identisch zu Abschnitt A)
  ```typescript
  // lib/queries/getItems.ts
  // ... (siehe oben) ...
  ```
- **API Route (Bridge):** Dient als Endpunkt für den Client-seitigen `fetch`.

  ```typescript
  // app/api/items/route.ts
  import { NextResponse } from "next/server";
  import { getItems } from "lib/queries/getItems";

  // Diese Route wird von useQuery's fetchFn aufgerufen.
  export async function GET() {
    try {
      const items = await getItems();
      return NextResponse.json(items); // Daten als JSON senden
    } catch (error) {
      // Fehler an den Client weitergeben
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 }
      );
    }
  }
  ```

- **Client Component mit `useQuery`:** Holt Daten über die API-Route und verwaltet den State.

  ```typescript
  // components/ItemList.tsx
  "use client"; // Benötigt Client-Hooks
  import { useQuery } from "@tanstack/react-query";
  import { type Item } from "lib/queries/getItems"; // Typ-Import

  // Client-seitige Funktion zum Abrufen der Daten von der API Route.
  async function fetchItems(): Promise<Item[]> {
    const res = await fetch("/api/items"); // Ruft app/api/items/route.ts auf
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({})); // Fehlerdetails extrahieren
      throw new Error(errorData.error || "Failed to fetch items from API");
    }
    return res.json();
  }

  export function ItemList() {
    // useQuery Hook von Tanstack Query
    const {
      data: items, // Die abgerufenen Daten (oder undefined)
      isLoading, // true, während der initiale Fetch läuft
      isError, // true, wenn fetchItems einen Fehler wirft
      error, // Das Fehlerobjekt
    } = useQuery<Item[], Error>({
      queryKey: ["items"], // Eindeutiger Schlüssel für diese Query im Cache
      queryFn: fetchItems, // Die Funktion, die die Daten holt
      // staleTime: 1000 * 60 * 5, // Optional: Wie lange Daten als "frisch" gelten (5 Min)
    });

    // Rendern basierend auf dem Status von useQuery
    if (isLoading) return <p>Loading items...</p>;
    if (isError) return <p>Error loading items: {error.message}</p>;

    return (
      <ul>
        {items?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
  ```

**<a id="2-daten-schreiben-mit-server-action--usemutation-1"></a>2. Daten Schreiben (mit Server Action + `useMutation`):**

- **Server Action:** Führt die Datenbankänderung aus. **Kein `revalidatePath` hier nötig**, da Tanstack Query die Aktualisierung übernimmt.

  ```typescript
  // app/actions/itemActions.ts
  "use server";
  import { prisma } from "lib/prisma";
  // Kein revalidatePath/Tag importieren oder aufrufen!

  export interface ActionResult {
    success: boolean;
    error?: string;
  }

  // Diese Action wird von useMutation aufgerufen.
  export async function addItem(formData: FormData): Promise<ActionResult> {
    const name = formData.get("name") as string;
    // ... Validierung ...
    if (!name) return { success: false, error: "Name is required." };
    try {
      await prisma.item.create({ data: { name } });
      return { success: true }; // Nur Erfolg/Misserfolg zurückgeben
    } catch (error) {
      console.error("Error adding item:", error);
      return { success: false, error: "Database error." };
    }
  }
  // ... weitere Actions (updateItem, deleteItem) ...
  ```

- **Client Component mit `useMutation`:** Löst die Server Action aus und invalidiert die `useQuery`-Daten bei Erfolg.

  ```typescript
  // components/AddItemForm.tsx
  "use client";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { addItem, type ActionResult } from "app/actions/itemActions";
  import { useState, useRef } from "react";

  export function AddItemForm() {
    // QueryClient-Instanz holen, um Caches zu manipulieren
    const queryClient = useQueryClient();
    const formRef = useRef<HTMLFormElement>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // useMutation Hook für die addItem Action
    const {
      mutate, // Funktion zum Auslösen der Mutation
      isPending, // true, während die Action läuft
    } = useMutation<
      ActionResult, // Typ des Rückgabewerts der mutationFn (von addItem)
      Error, // Typ des Fehlers, falls mutationFn fehlschlägt
      FormData // Typ der Variablen, die an mutationFn übergeben werden
    >({
      mutationFn: addItem, // Die Server Action, die ausgeführt werden soll
      onSuccess: (data) => {
        // Wird aufgerufen, wenn addItem *erfolgreich ausgeführt* wurde
        if (data.success) {
          // Prüfen, ob die Action *logisch* erfolgreich war
          console.log("Success!");
          // *** Der Schlüssel für die UI-Aktualisierung: ***
          // Invalidiert den Cache für den Query Key 'items'.
          // useQuery in ItemList wird die Daten neu fetchen.
          queryClient.invalidateQueries({ queryKey: ["items"] });
          formRef.current?.reset(); // Formular leeren
          setErrorMsg(null);
        } else {
          // Fehler aus der Server Action anzeigen
          setErrorMsg(data.error || "Unknown server error.");
        }
      },
      onError: (error) => {
        // Wird aufgerufen, wenn addItem selbst einen Fehler wirft (Netzwerk etc.)
        setErrorMsg(error.message || "Failed to submit the form.");
      },
    });

    // Handler für das Absenden des Formulars
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setErrorMsg(null); // Alten Fehler zurücksetzen
      const formData = new FormData(event.currentTarget);
      // Ruft die mutationFn (addItem) mit den Formulardaten auf.
      mutate(formData);
    }

    return (
      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="text" name="name" required disabled={isPending} />
        <button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Item"}
        </button>
        {/* Fehleranzeige */}
        {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
      </form>
    );
  }
  ```
