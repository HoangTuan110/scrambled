/** @jsx h */
import { h } from "preact"
import fuzzysort from "fuzzysort"
import { nanoid } from "nanoid"
import { Handlers, PageProps } from "$fresh/server.ts";

// Constants

// Helper functions
const highlightRef = ref => `${fuzzysort.highlight(ref, '<mark>', '</mark>')}`
const formatNumber = n => Math.floor(n*100)/100
const getMs = () => performance.now()

// Handling input
interface Data {
  results: object[];
  query: string;
  duration: number;
}

export const handler: Handlers<Data> = {
  GET(req, ctx) {
    const url = new URL(req.url)
    let query = url.searchParams.get("q") || ""
    const startMs = getMs()
    const results = fuzzysort.go(query.toLowerCase(), docs)
    const duration = formatNumber(getMs() - startMs)
    return ctx.render({ results, query, duration })
  },
}

export default function Home({ data }: PageProps<Data>) {
  const { results, query, duration } = data
  console.log(results)
  return (
    <div>
      <h1 className="header">Search Test</h1>
      <p className="desc">
        This is a little search test. <br/>
        Format of the search results is <code>SCORE - RESULT WITH HIGHLIGHT</code> (Higher score = less relevancy)
      </p>
      <form action="/">
        <input className="search-input" type="text" placeholder="Enter some text to search..." value={query}
          name="q" />
        <button type="submit">Search</button>
      </form>
      <p>
        {results.total} matches in {duration} ms.
      </p>
      <ol>
        {results.map(ref =>
          <li key={ref.target} className="search-item">
            <p className="search-item-name">
              {formatNumber(Math.abs(ref.score))} - <code dangerouslySetInnerHTML={{__html: highlightRef(ref)}}/>
            </p>
          </li>)}
      </ol>
    </div>
  )
}
