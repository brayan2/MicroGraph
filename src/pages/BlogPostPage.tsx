import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchBlogPostWithVariants, type BlogPost } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { RichTextRenderer } from "../components/RichTextRenderer";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { usePersonalization } from "../lib/PersonalizationContext";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/BlogPostPage.css";


import { createPreviewAttributes } from "../lib/hygraphPreview";

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const { selectedSegment } = usePersonalization();
  const { locale } = useLocalization();

  useEffect(() => {
    if (!slug) {
      setError("Blog post slug is required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBlogPostWithVariants(slug, selectedSegment?.name);
        if (!cancelled) {
          if (data) {
            setPost(data);
          } else {
            setError("Blog post not found");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedSegment, locale]);

  // Global loader handles the loading screen

  if (error || !post) {
    return (
      <div className="blog-post-page">
        <p className="error">{error || "Blog post not found"}</p>
        <LocalizedLink to="/blog" className="btn btn-primary">
          Back to Blog
        </LocalizedLink>
      </div>
    );
  }

  // Apply personalization if a variant exists for the current segment
  const variant = post.variants?.[0];
  const displayTitle = variant?.title || post.title || "Untitled Post";
  const displayExcerpt = variant?.excerpt || post.excerpt;
  const displayImage = variant?.feturedImage || post.feturedImage;

  return (
    <div className="blog-post-page fade-in">
      <LocalizedLink to="/blog" className="back-link">
        ← Back to Blog
      </LocalizedLink>

      <article className="blog-post">
        {variant && (
          <div className="personalization-badge-blog">
            ✨ Personalized for <strong>{selectedSegment?.name}</strong>
          </div>
        )}
        <header className="post-header">
          <h1 {...createPreviewAttributes({ entryId: post.id, modelApiId: 'BlogPost', fieldApiId: 'title' })}>
            {displayTitle}
          </h1>
          {(post.blogTime || post.createdAt) && (
            <time
              className="post-date"
              {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'blogTime' })}
            >
              {new Date(post.blogTime || post.createdAt || "").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </time>
          )}
        </header>

        {displayImage && (
          <div
            className="post-featured-image"
            {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'feturedImage' })}
          >
            <ProductImage
              image={displayImage}
              alt={displayImage.altText || displayTitle || "Blog post featured image"}
              fallbackText={displayTitle || "Featured image"}
            />
            {displayImage.caption && (
              <p className="image-caption">{displayImage.caption}</p>
            )}
          </div>
        )}

        {displayExcerpt && (
          <p
            className="post-excerpt"
            {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'excerpt' })}
          >
            {displayExcerpt}
          </p>
        )}

        {post.blogAuthor && (
          <div
            className="post-author"
            {...createPreviewAttributes({ entryId: post.blogAuthor.id })}
          >
            {post.blogAuthor.authorImage && (
              <img
                src={post.blogAuthor.authorImage.url}
                alt={post.blogAuthor.authorName}
                className="author-image"
              />
            )}
            <div className="author-info">
              <span className="author-label">Written by:</span>
              <h4 {...createPreviewAttributes({ entryId: post.blogAuthor.id, fieldApiId: 'authorName' })}>
                {post.blogAuthor.authorName}
              </h4>
              {post.blogAuthor.authorAbout && (
                <p {...createPreviewAttributes({ entryId: post.blogAuthor.id, fieldApiId: 'authorAbout' })}>
                  {post.blogAuthor.authorAbout}
                </p>
              )}
            </div>
          </div>
        )}

        {post.taxonomies && post.taxonomies.length > 0 && (
          <div className="post-taxonomies">
            {post.taxonomies.map((tax, i) => (
              <TaxonomyBadge key={tax.value || i} label={tax.displayName} />
            ))}
          </div>
        )}

        {post.body && (
          <div
            className="post-content"
            {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'body', richTextFormat: 'html' })}
          >
            <RichTextRenderer content={post.body} />
          </div>
        )}
      </article>
    </div>
  );
};

