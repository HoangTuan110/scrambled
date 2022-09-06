/** @jsx h */
import { h } from "preact";
import { UnknownPageProps } from "$fresh/server.ts";

export default function NotFoundPage({ url }: UnknownPageProps) {
  return (
    <main>
      <h1>Page not found.</h1>
      <a href="/">Maybe go back?</a>
    </main>
  );
}
