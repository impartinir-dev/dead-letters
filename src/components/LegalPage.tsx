import type { ReactNode } from 'react'

/** Highlighted placeholder the site owner must replace. */
const Todo = ({ children }: { children: ReactNode }) => <mark className="todo">[{children}]</mark>

function Shell({ title, nav, children }: { title: string; nav: (h: string) => void; children: ReactNode }) {
  return (
    <div className="page help legal" lang="de">
      <header className="browser-head">
        <button className="btn-ghost" onClick={() => nav('#/')} aria-label="Zurück">
          ←
        </button>
        <h2>{title}</h2>
        <span />
      </header>
      <div className="help-body">
        <p className="legal-note">
          Entwurf mit Platzhaltern — <mark className="todo">[markierte Stellen]</mark> vor dem Start ersetzen
          und rechtlich prüfen lassen.
        </p>
        {children}
      </div>
    </div>
  )
}

export function Impressum({ nav }: { nav: (h: string) => void }) {
  return (
    <Shell title="Impressum" nav={nav}>
      <h3>Angaben gemäß § 5 DDG</h3>
      <p>
        <Todo>Vorname Nachname / Firma</Todo>
        <br />
        <Todo>Straße Hausnummer</Todo>
        <br />
        <Todo>PLZ Ort</Todo>
        <br />
        Deutschland
      </p>

      <h3>Kontakt</h3>
      <p>
        E-Mail: <Todo>E-Mail-Adresse</Todo>
        <br />
        Telefon: <Todo>Telefonnummer oder zweiter schneller Kontaktweg</Todo>
      </p>

      <h3>Umsatzsteuer-ID</h3>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: <Todo>USt-IdNr., falls vorhanden — sonst Abschnitt löschen</Todo>
      </p>

      <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
      <p>
        <Todo>Name, Anschrift</Todo>
      </p>

      <h3>Verbraucherstreitbeilegung</h3>
      <p>
        <Todo>
          Hinweis nach § 36 VSBG prüfen, z. B.: „Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.“
        </Todo>
      </p>

      <h3>Haftung für Inhalte und Links</h3>
      <p>
        <Todo>optionaler Haftungshinweis</Todo>
      </p>
    </Shell>
  )
}

export function Datenschutz({ nav }: { nav: (h: string) => void }) {
  return (
    <Shell title="Datenschutzerklärung" nav={nav}>
      <h3>1. Verantwortlicher</h3>
      <p>
        <Todo>Name, Anschrift, E-Mail-Adresse</Todo>
      </p>

      <h3>2. Überblick</h3>
      <p>
        DEAD LETTERS läuft vollständig in Ihrem Browser. Es gibt kein Benutzerkonto, keinen eigenen
        Server und kein Tracking. <Todo>Stand prüfen, sobald Werbung oder Statistik hinzukommt</Todo>
      </p>

      <h3>3. Hosting</h3>
      <p>
        Die Website wird bereitgestellt von <Todo>Hoster, z. B. GitHub Pages — GitHub, Inc., USA</Todo>.
        Beim Aufruf verarbeitet der Hoster technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit,
        abgerufene Datei, Browser-Informationen) in Server-Logfiles, um die Seite auszuliefern und
        abzusichern. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.{' '}
        <Todo>Speicherdauer und Drittlandübermittlung (z. B. EU-US Data Privacy Framework) ergänzen</Todo>
      </p>

      <h3>4. Speicherung auf Ihrem Gerät</h3>
      <p>
        Spielfortschritt, Bestzeiten und Ihre Tages-Serie werden im lokalen Speicher (localStorage)
        Ihres Browsers abgelegt und verlassen Ihr Gerät nicht. Für die Offline-Nutzung legt ein Service
        Worker die App-Dateien im Browser-Cache ab. Diese Speicherung ist für den von Ihnen gewünschten
        Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können die Daten jederzeit über
        die Einstellungen Ihres Browsers löschen. <Todo>prüfen</Todo>
      </p>

      <h3>5. Ergebnisse teilen</h3>
      <p>
        Wenn Sie Ihr Ergebnis teilen, wird ein Text an das Teilen-Menü Ihres Geräts oder die
        Zwischenablage übergeben. Wir erhalten dabei keine Daten.
      </p>

      <h3>6. Werbung und Einwilligung</h3>
      <p>
        Derzeit wird keine Werbung angezeigt.{' '}
        <Todo>
          Bei Aktivierung: Werbepartner, Zwecke, eingesetzte Consent-Management-Plattform,
          Rechtsgrundlage (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), Speicherdauer,
          Drittlandübermittlung und Widerrufsmöglichkeit beschreiben
        </Todo>
      </p>

      <h3>7. Ihre Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch
        (Art. 21). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft
        widerrufen (Art. 7 Abs. 3). Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde
        beschweren (Art. 77), z. B. bei <Todo>zuständige Landesdatenschutzbehörde</Todo>.
      </p>

      <h3>8. Stand</h3>
      <p>
        <Todo>Datum</Todo>
      </p>
    </Shell>
  )
}
