import type { ReactNode } from 'react'
import { CONTACT_FORM_URL } from '../config'

/** Highlighted placeholder the site owner must still replace. */
const Todo = ({ children }: { children: ReactNode }) => <mark className="todo">[{children}]</mark>

const EMAIL = 'adam.michael97@proton.me'
const Email = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

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
      <div className="help-body">{children}</div>
    </div>
  )
}

export function Impressum({ nav }: { nav: (h: string) => void }) {
  return (
    <Shell title="Impressum" nav={nav}>
      <h3>Angaben gemäß § 5 DDG</h3>
      <p>
        Michael Adam
        <br />
        Schlosserstraße 15
        <br />
        32051 Herford
        <br />
        Deutschland
      </p>

      <h3>Kontakt</h3>
      <p>
        E-Mail: <Email />
        <br />
        Kontaktformular:{' '}
        {CONTACT_FORM_URL ? (
          <a href={CONTACT_FORM_URL} rel="noopener noreferrer" target="_blank">
            Nachricht senden
          </a>
        ) : (
          <Todo>Link zum Kontaktformular — CONTACT_FORM_URL in src/config.ts setzen</Todo>
        )}
      </p>

      <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
      <p>Michael Adam, Anschrift wie oben</p>

      <h3>Verbraucherstreitbeilegung</h3>
      <p>
        Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h3>Haftung für Inhalte</h3>
      <p>
        Die Inhalte dieser Seite wurden mit Sorgfalt erstellt. Für ihre Richtigkeit, Vollständigkeit und
        Aktualität kann ich jedoch keine Gewähr übernehmen. Als Diensteanbieter bin ich nach den
        allgemeinen Gesetzen für eigene Inhalte verantwortlich.
      </p>
      <p>
        Alle Fälle, Personen, Namen und Handlungen in DEAD LETTERS sind frei erfunden. Ähnlichkeiten mit
        realen Personen oder Ereignissen sind zufällig und nicht beabsichtigt.
      </p>

      <h3>Haftung für Links</h3>
      <p>
        Diese Seite kann Links zu externen Websites Dritter enthalten, auf deren Inhalte ich keinen Einfluss
        habe. Für diese Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum
        Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Sollten mir Rechtsverletzungen
        bekannt werden, entferne ich die betreffenden Links umgehend.
      </p>
    </Shell>
  )
}

export function Datenschutz({ nav }: { nav: (h: string) => void }) {
  return (
    <Shell title="Datenschutzerklärung" nav={nav}>
      <h3>1. Verantwortlicher</h3>
      <p>
        Michael Adam
        <br />
        Schlosserstraße 15
        <br />
        32051 Herford
        <br />
        Deutschland
        <br />
        E-Mail: <Email />
      </p>

      <h3>2. Überblick</h3>
      <p>
        DEAD LETTERS läuft vollständig in Ihrem Browser. Es gibt kein Benutzerkonto und keinen eigenen
        Server; Ihr Spielstand bleibt auf Ihrem Gerät. DEAD LETTERS zeigt keine Werbung und verwendet
        keine Analyse- oder Tracking-Dienste. Welche Daten beim Hosting und bei Kontaktanfragen
        verarbeitet werden, erläutern die folgenden Abschnitte.
      </p>

      <h3>3. Hosting</h3>
      <p>
        Die Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub B.V., Prins
        Bernhardplein 200, 1097 JB Amsterdam, Niederlande, und der GitHub, Inc., 88 Colin P. Kelly Jr.
        Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet GitHub technisch
        notwendige Daten wie Ihre IP-Adresse, Datum und Uhrzeit des Abrufs, die abgerufene Datei und
        Informationen zu Ihrem Browser. GitHub speichert die IP-Adressen von Besuchern zu
        Sicherheitszwecken. Rechtsgrundlage ist mein berechtigtes Interesse an einer sicheren und
        zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Dabei können Daten in die USA übermittelt werden. GitHub, Inc. ist nach dem EU-US Data Privacy
        Framework zertifiziert; für die USA besteht insoweit ein Angemessenheitsbeschluss der
        EU-Kommission (Art. 45 DSGVO). Weitere Informationen:{' '}
        <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener noreferrer" target="_blank">
          Datenschutzerklärung von GitHub
        </a>
        .
      </p>

      <h3>4. Speicherung auf Ihrem Gerät</h3>
      <p>
        Spielfortschritt, Bestzeiten und Ihre Tages-Serie werden im lokalen Speicher (localStorage)
        Ihres Browsers abgelegt und nicht an mich oder Dritte übertragen. Für die Offline-Nutzung legt ein
        Service Worker die Dateien der App im Browser-Cache ab. Diese Speicherung ist unbedingt
        erforderlich, um das von Ihnen gewünschte Spiel bereitzustellen (§ 25 Abs. 2 Nr. 2 TDDDG). Sie
        können diese Daten jederzeit über die Einstellungen Ihres Browsers löschen; dabei geht Ihr
        Spielstand verloren.
      </p>

      <h3>5. Ergebnisse teilen</h3>
      <p>
        Wenn Sie Ihr Ergebnis teilen, wird ein Text an das Teilen-Menü Ihres Geräts oder die
        Zwischenablage übergeben. Ich erhalte dabei keine Daten.
      </p>

      <h3>6. Kontaktformular</h3>
      <p>
        Für Anfragen nutze ich ein Formular des Anbieters Tally BV, Sint-Pietersnieuwstraat 11, 9000
        Gent, Belgien. Das Formular öffnet sich auf einer Seite von Tally; erst dann verarbeitet Tally
        die von Ihnen eingegebenen Angaben (z. B. Name, E-Mail-Adresse und Nachricht) sowie technisch
        notwendige Verbindungsdaten in meinem Auftrag auf Servern in der Europäischen Union. Mit Tally
        besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO).
      </p>
      <p>
        Ich verwende Ihre Angaben ausschließlich, um Ihre Anfrage zu bearbeiten. Rechtsgrundlage ist
        mein berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
        Ich lösche die Daten, sobald die Anfrage erledigt ist und keine gesetzlichen
        Aufbewahrungspflichten entgegenstehen. Alternativ können Sie mir jederzeit eine E-Mail
        schreiben.
      </p>

      <h3>7. Werbung und Analyse</h3>
      <p>
        DEAD LETTERS zeigt derzeit keine Werbung an und setzt keine Cookies oder vergleichbaren
        Technologien zu Werbe- oder Analysezwecken ein. Sollte sich das ändern, wird diese
        Datenschutzerklärung vorher angepasst und Ihre Einwilligung eingeholt, wo sie erforderlich ist.
      </p>

      <h3>8. Ihre Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen
        Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine erteilte Einwilligung
        können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3). Wenden Sie sich
        dazu einfach per E-Mail an mich.
      </p>
      <p>
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für
        mich zuständig ist die Landesbeauftragte für Datenschutz und Informationsfreiheit
        Nordrhein-Westfalen, Postfach 20 04 44, 40102 Düsseldorf,{' '}
        <a href="https://www.ldi.nrw.de" rel="noopener noreferrer" target="_blank">
          www.ldi.nrw.de
        </a>
        .
      </p>

      <h3>9. Stand</h3>
      <p>25. September 2026</p>
    </Shell>
  )
}
