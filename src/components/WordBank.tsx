interface Props {
  words: string[]
  found: Set<string>
}

/** The book-style word bank: columns of words, struck through when found. */
export default function WordBank({ words, found }: Props) {
  return (
    <div className="bank">
      {words.map((w) => (
        <span key={w} className={found.has(w) ? 'bank-word hit' : 'bank-word'}>
          {w}
        </span>
      ))}
    </div>
  )
}
