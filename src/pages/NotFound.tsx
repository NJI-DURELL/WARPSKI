import { ErrorPage } from '@/components/ErrorBoundary';
import { Seo } from '@/components/Seo';

export function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" noindex />
      <ErrorPage
        code="404"
        title="Off the map"
        message="This page drifted out to sea. Let's get you back to shore."
      />
    </>
  );
}

export default NotFound;
