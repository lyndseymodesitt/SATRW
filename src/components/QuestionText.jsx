import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

export default function QuestionText({ content, className }) {
  const text = String(content ?? "");
  
  // Check if the text contains HTML spans (like blanks)
  const hasHtmlSpans = text.includes('<span class="blank">');
  
  // Only apply title formatting if there's a clear title pattern
  // Look for patterns like "Title\n\nContent" or "Title\nContent" where title is short
  const titleMatch = text.match(/^([^\n]{1,50})\n\s*\n\s*([\s\S]+)$/);
  
  if (titleMatch) {
    const [, title, passage] = titleMatch;
    // Only apply if the title is reasonably short and the passage is substantial
    if (title.length < 50 && passage.length > 100) {
      return (
        <div className={className}>
          <h3 className="question-title" style={{ 
            margin: "0 0 16px 0", 
            fontSize: "18px", 
            fontWeight: "600",
            color: "#E5E7EB"
          }}>
            {title}
          </h3>
          <div className="question-passage">
            {hasHtmlSpans ? (
              <div dangerouslySetInnerHTML={{ __html: passage }} />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  ul: ({ children, ...props }) => (
                    <ul style={{ 
                      textAlign: 'left', 
                      paddingLeft: '20px',
                      margin: '8px 0'
                    }} {...props}>
                      {children}
                    </ul>
                  ),
                  li: ({ children, ...props }) => (
                    <li style={{ 
                      textAlign: 'left',
                      margin: '4px 0'
                    }} {...props}>
                      {children}
                    </li>
                  )
                }}
              >
                {passage}
              </ReactMarkdown>
            )}
          </div>
        </div>
      );
    }
  }
  
  // For regular questions (no title), render normally
  if (hasHtmlSpans) {
    // If content has HTML spans, render directly to preserve them
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: text }} />
    );
  }
  
  // For regular questions without HTML, use ReactMarkdown with bullet point handling
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          ul: ({ children, ...props }) => (
            <ul style={{ 
              textAlign: 'left', 
              paddingLeft: '20px',
              margin: '8px 0'
            }} {...props}>
              {children}
            </ul>
          ),
          li: ({ children, ...props }) => (
            <li style={{ 
              textAlign: 'left',
              margin: '4px 0'
            }} {...props}>
              {children}
            </li>
          )
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
