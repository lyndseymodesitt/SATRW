import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

export default function QuestionText({ content, className }) {
  const text = String(content ?? "");
  
  // Check if the text starts with a title (ends with newline followed by content)
  const titleMatch = text.match(/^([^\n]+)\n\s*([\s\S]+)$/);
  
  if (titleMatch) {
    const [, title, passage] = titleMatch;
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
        </div>
      </div>
    );
  }
  
  // If no title detected, render normally with bullet point handling
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
