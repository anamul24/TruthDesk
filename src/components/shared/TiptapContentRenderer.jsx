"use client";

import React from "react";

// Recursively renders Tiptap JSON nodes to React elements
function renderNode(node, index = 0) {
  if (!node) return null;

  switch (node.type) {
    case "doc":
      return (
        <div key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </div>
      );

    case "paragraph": {
      const children = node.content?.map((child, i) => renderInline(child, i));
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-700 text-base">
          {children?.length ? children : <br />}
        </p>
      );
    }

    case "heading": {
      const level = node.attrs?.level || 2;
      const children = node.content?.map((child, i) => renderInline(child, i));
      const className =
        level === 1
          ? "text-3xl font-black text-gray-900 mt-8 mb-4"
          : level === 2
          ? "text-2xl font-bold text-gray-900 mt-7 mb-3"
          : level === 3
          ? "text-xl font-bold text-gray-800 mt-6 mb-3"
          : "text-lg font-semibold text-gray-800 mt-5 mb-2";
      const Tag = `h${level}`;
      return (
        <Tag key={index} className={className}>
          {children}
        </Tag>
      );
    }

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-red-500 pl-4 my-5 italic text-gray-600"
        >
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-gray-700">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="list-decimal list-inside space-y-1 mb-4 text-gray-700">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto my-5 text-sm font-mono"
        >
          <code>
            {node.content?.map((child, i) => renderInline(child, i))}
          </code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} className="border-gray-200 my-6" />;

    case "image":
      return (
        <img
          key={index}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ""}
          className="rounded-xl max-w-full my-5 shadow-sm"
        />
      );

    default:
      // Fallback: render any text content
      if (node.content) {
        return (
          <div key={index}>
            {node.content.map((child, i) => renderNode(child, i))}
          </div>
        );
      }
      return null;
  }
}

function renderInline(node, index = 0) {
  if (!node) return null;

  if (node.type === "text") {
    let el = node.text;

    if (!node.marks || node.marks.length === 0) {
      return <React.Fragment key={index}>{el}</React.Fragment>;
    }

    for (const mark of node.marks) {
      switch (mark.type) {
        case "bold":
          el = <strong key={index}>{el}</strong>;
          break;
        case "italic":
          el = <em key={index}>{el}</em>;
          break;
        case "underline":
          el = <u key={index}>{el}</u>;
          break;
        case "strike":
          el = <s key={index}>{el}</s>;
          break;
        case "code":
          el = (
            <code
              key={index}
              className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {el}
            </code>
          );
          break;
        case "link":
          el = (
            <a
              key={index}
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 underline hover:text-red-700"
            >
              {el}
            </a>
          );
          break;
        default:
          break;
      }
    }
    return el;
  }

  if (node.type === "hardBreak") {
    return <br key={index} />;
  }

  // Handle inline nodes that may have block-level rendering
  return renderNode(node, index);
}

export default function TiptapContentRenderer({ content }) {
  if (!content) {
    return (
      <p className="text-gray-500 italic">No content available.</p>
    );
  }

  // If content is a string (plain text fallback)
  if (typeof content === "string") {
    return (
      <div className="prose max-w-none">
        {content.split("\n").map((line, i) => (
          <p key={i} className="mb-4 leading-relaxed text-gray-700">
            {line}
          </p>
        ))}
      </div>
    );
  }

  // Tiptap JSON format
  if (content.type === "doc") {
    return (
      <div className="prose-custom max-w-none">
        {content.content?.map((node, i) => renderNode(node, i))}
      </div>
    );
  }

  return <p className="text-gray-500 italic">Content format not supported.</p>;
}
