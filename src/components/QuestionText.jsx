import React from "react";

export default function QuestionText({ content, className }) {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
