import React from "react";
import "./RichTextRenderer.css";
import { type Asset } from "../lib/hygraphClient";

interface RichTextRendererProps {
    content: {
        raw?: any;
        text?: string | null;
        references?: Asset[];
    } | null;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
    if (!content) return null;

    // Helper to find referenced asset by ID
    const findAsset = (id: string): Asset | undefined => {
        return content.references?.find(ref => ref.id === id);
    };

    const renderNode = (node: any, idx: number): React.ReactNode => {
        if (!node) return null;

        // Handle image nodes (direct images inserted via image tool, not embedded assets)
        if (node.type === "image") {
            return (
                <div key={idx} className="rich-text-image">
                    <img
                        src={node.src}
                        alt={node.title || "Embedded image"}
                        width={node.width}
                        height={node.height}
                        loading="lazy"
                    />
                    {node.title && <p className="image-caption">{node.title}</p>}
                </div>
            );
        }

        // Handle paragraph nodes
        if (node.type === "paragraph") {
            return (
                <p key={idx}>
                    {node.children?.map((child: any, childIdx: number) => {
                        if (!child) return null;

                        // Check for nested image directly in paragraph if it ever comes like that
                        if (child.type === "image") {
                            return renderNode(child, childIdx);
                        }

                        // Check for embedded entry/asset
                        if (child.type === "embed") {
                            return renderNode(child, childIdx);
                        }

                        // Check for link
                        if (child.type === "link") {
                            return renderNode(child, childIdx);
                        }

                        if (child.text === undefined) return null;

                        let text: React.ReactNode = child.text;
                        if (child.bold) text = <strong key={childIdx}>{text}</strong>;
                        if (child.italic) text = <em key={childIdx}>{text}</em>;
                        if (child.underline) text = <u key={childIdx}>{text}</u>;
                        return <React.Fragment key={childIdx}>{text}</React.Fragment>;
                    })}
                </p>
            );
        }

        // Handle headings
        if (node.type === "heading-one") return <h1 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h1>;
        if (node.type === "heading-two") return <h2 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h2>;
        if (node.type === "heading-three") return <h3 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h3>;
        if (node.type === "heading-four") return <h4 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h4>;
        if (node.type === "heading-five") return <h5 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h5>;
        if (node.type === "heading-six") return <h6 key={idx}>{node.children?.map((c: any, i: number) => renderNode(c, i))}</h6>;

        // Handle lists
        if (node.type === "bulleted-list" || node.type === "numbered-list") {
            const ListTag = node.type === "bulleted-list" ? "ul" : "ol";
            return (
                <ListTag key={idx}>
                    {node.children?.map((listItem: any, itemIdx: number) => (
                        <li key={itemIdx}>
                            {listItem.children?.map((itemChild: any, childIdx: number) => {
                                if (itemChild.type === "list-item-child") {
                                    return itemChild.children?.map((nested: any, nestedIdx: number) => renderNode(nested, nestedIdx));
                                }
                                return renderNode(itemChild, childIdx);
                            })}
                        </li>
                    ))}
                </ListTag>
            );
        }

        // Handle Links
        if (node.type === "link") {
            return (
                <a
                    key={idx}
                    href={node.href}
                    target={node.openInNewTab ? "_blank" : "_self"}
                    rel={node.openInNewTab ? "noopener noreferrer" : undefined}
                >
                    {node.children?.map((c: any, i: number) => renderNode(c, i))}
                </a>
            );
        }

        // Handle embeds
        if (node.type === "embed") {
            // Check if it's an Asset
            if (node.nodeType === "Asset") {
                const asset = findAsset(node.nodeId);
                if (asset) {
                    if (asset.mimeType?.startsWith('image/')) {
                        return (
                            <div key={idx} className="rich-text-image">
                                <img
                                    src={asset.url}
                                    alt={asset.altText || asset.title || "Embedded asset"}
                                    width={asset.width || undefined}
                                    height={asset.height || undefined}
                                    loading="lazy"
                                />
                                {(asset.caption || asset.title) && (
                                    <p className="image-caption">{asset.caption || asset.title}</p>
                                )}
                            </div>
                        );
                    }
                    // Handle other asset types e.g. video
                    if (asset.mimeType?.startsWith('video/')) {
                        return (
                            <div key={idx} className="rich-text-embed video">
                                <video controls width="100%">
                                    <source src={asset.url} type={asset.mimeType || "video/mp4"} />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        );
                    }
                }
            }

            return (
                <div key={idx} className="rich-text-embed unknown">
                    {/* Placeholder for unknown embeds */}
                </div>
            );
        }

        // Fallback for text nodes not wrapped (should be covered by paragraph children logic but just in case)
        if (node.text !== undefined) {
            let text: React.ReactNode = node.text;
            if (node.bold) text = <strong key={idx}>{text}</strong>;
            if (node.italic) text = <em key={idx}>{text}</em>;
            if (node.underline) text = <u key={idx}>{text}</u>;
            return <React.Fragment key={idx}>{text}</React.Fragment>;
        }

        return null;
    };

    // Try to render from raw structured data
    if (content.raw?.children) {
        return (
            <div className="rich-text">
                {content.raw.children.map((node: any, idx: number) => renderNode(node, idx))}
            </div>
        );
    }

    // Fallback to plain text
    if (content.text) {
        return (
            <div className="rich-text">
                {content.text.split("\n").map((line: string, idx: number) => (
                    <p key={idx}>{line}</p>
                ))}
            </div>
        );
    }

    return null;
};
