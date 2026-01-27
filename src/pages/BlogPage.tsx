import React from "react";
import { Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchBlogPosts, type BlogPost, fetchBlogPageData, type BlogPageData } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/BlogPage.css";

import { createPreviewAttributes } from "../lib/hygraphPreview";

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [pageData, setPageData] = React.useState<BlogPageData | null>(null);
  const { setIsLoading } = useLoading();
  const [error, setError] = React.useState<string | null>(null);
  const { locale } = useLocalization();

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [data, cmsPageData] = await Promise.all([
          fetchBlogPosts(),
          fetchBlogPageData(locale)
        ]);
        if (!cancelled) {
          setPosts(data);
          setPageData(cmsPageData);
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
  }, [locale]);

  // Global loader handles the loading screen

  if (error) {
    return (
      <div className="blog-page">
        <div className="page-header">
          <h1>Blog</h1>
          <p className="error">Failed to load posts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page fade-in">
      <div className="container">
        <div className="page-header">
          <h1 {...(pageData?.id ? createPreviewAttributes({ entryId: pageData.id, modelApiId: 'BlogPage', fieldApiId: 'title' }) : {})}>
            {pageData?.title}
          </h1>
          <p {...(pageData?.id ? createPreviewAttributes({ entryId: pageData.id, fieldApiId: 'subtitle' }) : {})}>
            {pageData?.subtitle}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="no-posts">No blog posts available.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <LocalizedLink
                key={post.id}
                to={`/blog/${post.blogSlug || post.id}`}
                className="blog-card"
                {...createPreviewAttributes({ entryId: post.id })}
              >
                {post.feturedImage && (
                  <div className="blog-image-wrapper">
                    <ProductImage
                      image={post.feturedImage}
                      alt={post.title || "Blog post image"}
                      fallbackText={post.title || "Blog post"}
                      {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'feturedImage' })}
                    />
                  </div>
                )}
                <h2 {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'title' })}>
                  {post.title || "Untitled Post"}
                </h2>
                {post.excerpt && (
                  <p
                    className="blog-excerpt"
                    {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'excerpt' })}
                  >
                    {post.excerpt}
                  </p>
                )}
                {post.taxonomies && post.taxonomies.length > 0 && (
                  <div className="blog-card-taxonomies">
                    {post.taxonomies.map((tax, i) => (
                      <TaxonomyBadge key={tax.value || i} label={tax.displayName} value={tax.value} clickable={false} />
                    ))}
                  </div>
                )}
                {(post.blogTime || post.createdAt) && (
                  <p
                    className="blog-date"
                    {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'blogTime' })}
                  >
                    {new Date(post.blogTime || post.createdAt || "").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                )}
                <span className="read-more">Read more →</span>
              </LocalizedLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

