/** @jsx h */
import { h } from "preact"
import fuzzysort from "fuzzysort"
import { Handlers, PageProps } from "$fresh/server.ts";

// Constants
const options = {
  limit: 100,
  threshold: -15000,
  keys: ['title']
}
const PATH = '/home/firefly/.todo/drafts/'

// Helper functions
const highlightRef = ref => `${fuzzysort.highlight(ref, '<mark>', '</mark>')}`
const formatNumber = n => Math.floor(n*100)/100
const getMs = () => performance.now()
const search = (query, data) => fuzzysort.go(query, data, options)
// Get title in a Markdown document (without any dependencies!)
const headerMatch = /^#+(.*)$/
const getMarkdownTitle = text => {
    const lines = text.split("\n")
    const noEmptyLines = lines.filter(line => {
        return line.length > 0
    })
    if (noEmptyLines.length === 0) {
        throw new Error("no content")
    }
    const firstLine = noEmptyLines[0]
    const match = firstLine.match(headerMatch)
    if (match == null) {
        return
    }
    const title = match && match[1]
    return title.trim()
}
// Transforming Markdown notes into documents
const notesToDocuments = async () => {
  let documents: object[] = []
  for await (const fileEntry of Deno.readDir(PATH)) {
    if (fileEntry.isFile) {
      const content = await Deno.readTextFile(PATH + fileEntry.name)
      documents.push({
        name: fileEntry.name,
        title: getMarkdownTitle(content),
        content: content
      })
    }
  }
  return documents
}

// Handling input
interface Data {
  results: object[];
  query: string;
  duration: number;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url)
    const query = url.searchParams.get("q") || ""
    const startMs = getMs()
    const documents: object[] = await notesToDocuments()
    console.log(documents)
    const results = search(query.toLowerCase(), documents)
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
        {results.map(ref => {
          const item = (ref[0] === null ? ref[1] : ref[0])
          return (
            <li key={item.target} className="search-item">
              <a href="/">
                <span className="search-item-score">
                  {formatNumber(Math.abs(item.score))} -
                </span>
                <code className="seaarch-item-name" dangerouslySetInnerHTML={{__html: highlightRef(item)}} />
              </a>
            </li>
          )
        })
        }
      </ol>
    </div>
  )
}
