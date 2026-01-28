'use client';

import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreviewContext } from '../lib/PreviewContext';

// Dynamically load the preview component at runtime
const HygraphPreview = React.lazy(() =>
  import('@hygraph/preview-sdk/react').then((mod) => ({
    default: mod.HygraphPreview
  }))
);

type PreviewWrapperProps = {
  children: React.ReactNode;
};

export function PreviewWrapper({ children }: PreviewWrapperProps) {
  const navigate = useNavigate();
  const { isClickToEditEnabled } = usePreviewContext();

  // Use the base endpoint without token to prevent Studio URL issues
  const endpoint = import.meta.env.VITE_HYGRAPH_ENDPOINT;
  const studioUrl = import.meta.env.VITE_HYGRAPH_STUDIO_URL!;

  return (
    <Suspense fallback={null}>
      <HygraphPreview
        endpoint={endpoint}
        studioUrl={studioUrl}
        debug={false}
        overlayEnabled={isClickToEditEnabled}
        sync={{
          fieldFocus: true,
          fieldUpdate: true,
        }}
        onSave={() => {
          navigate(window.location.pathname, { replace: true });
        }}
      >
        {children}
      </HygraphPreview>
    </Suspense>
  );
}
