import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";          // allow our <span class="blank"> etc.
// NOTE: no remark-math, no rehype-katex

export default function MarkdownMath({ children, className }) {
  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          // Neutralize accidental italics entirely
          em: ({ children }) => <span style={{ fontStyle: "normal" }}>{children}</span>,
          i:  ({ children }) => <span style={{ fontStyle: "normal" }}>{children}</span>,
        }}
      >
        {String(children ?? "")}
      </ReactMarkdown>
    </div>
  );
}







