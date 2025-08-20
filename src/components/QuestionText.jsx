import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

export default function QuestionText({ content, className }) {
  const text = String(content ?? "");
  
  // Check if the text contains HTML spans (like blanks)
  const hasHtmlSpans = text.includes('<span class="blank">');
  
  // Look for patterns like "Title\n\nContent" where title is short (for questions with titles)
  const titleMatch = text.match(/^([^\n]{1,50})\n\s*\n\s*([\s\S]+)$/);
  
  // Look for patterns like "Content\n\nQuestion" where question is a main question
  const questionMatch = text.match(/^([\s\S]+)\n\s*\n\s*(Which choice.*\?)$/);
  
  // Look for vocabulary questions like "Content\n\nAs used in the text..."
  const vocabMatch = text.match(/^([\s\S]+)\n\s*\n\s*(As used in the text.*\?)$/);
  
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
  
  if (questionMatch) {
    const [, passage, question] = questionMatch;
    return (
      <div className={className}>
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
        <div className="question-stem" style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {question}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  
  if (vocabMatch) {
    const [, passage, question] = vocabMatch;
    return (
      <div className={className}>
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
        <div className="question-stem" style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {question}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  
  // For regular questions (no title or question separation), render normally
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
