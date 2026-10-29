import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy", description: "What Still Here does and does not do with your words.", alternates: { canonical: "/privacy/" } };

export default function Privacy() {
  return (
    <main className="wrap page about">
      <div className="eyebrow"><b>Privacy</b></div>
      <h1>Your words stay with you.</h1>
      <p>This page covers the Still Here website, the installable web app, and the Android app. They are the same software. Last updated 29 October 2026.</p>

      <h2>What you write</h2>
      <p>
        Every answer, every sealed letter, every saved or hidden item is stored only on your own device, in the browser's or the app's local storage. It is never sent to us or to anyone else. We have no server that could receive it, and no account that could hold it. If you clear the site's data, uninstall the app, or lose the device, it is gone unless you made a backup.
      </p>

      <h2>Backups and sharing</h2>
      <p>
        You can export your answers as a text file or a backup file. Those files are created on your device and go only where you send them. The share and print features make an image on your device and hand it to the share sheet you choose. Nothing is uploaded by us.
      </p>

      <h2>Visit counts</h2>
      <p>
        We count visits with Umami, a privacy-focused analytics service. It records which pages are opened, the rough country, the browser type and screen size. It sets no cookies, stores no IP address, creates no profile, and never sees anything you type. We use it only to know whether anyone is here.
      </p>

      <h2>Permissions</h2>
      <p>
        The Android app asks for no permissions beyond what it needs to show the share sheet and save a backup file you asked for. No contacts, no location, no camera, no microphone, no notifications.
      </p>

      <h2>Children</h2>
      <p>Still Here is not directed at children under 13 and collects no personal information from anyone.</p>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, the date above changes with it. The code is open source at{" "}
        <a className="u" href="https://github.com/ashuthe1/still-here" target="_blank" rel="noopener noreferrer">github.com/ashuthe1/still-here</a>, so anything we say here can be checked. Questions go to the issues page there, or see <Link className="u" href="/about/">About</Link>.
      </p>
    </main>
  );
}
