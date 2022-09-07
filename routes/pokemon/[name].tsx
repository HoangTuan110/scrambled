/** @jsx h */
import { h } from "preact";
import { PageProps } from "$fresh/server.ts";

// Helper functions
const fetchData = async (name: string) => {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
  if (resp.status === 404) {
    return null
  }
  return resp.json().then(data => data)
}

export default function Greet(props: PageProps) {
  return <div>Hello {props.params.name}</div>;
}
