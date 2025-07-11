import { useEffect, useRef, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

export function useNavigationBlocker(shouldBlock: () => boolean, onBlock: (nextPath: string, proceed: () => void) => void) {
  const router = useNextRouter();
  const shouldBlockRef = useRef(shouldBlock);
  const onBlockRef = useRef(onBlock);

  useEffect(() => {
    shouldBlockRef.current = shouldBlock;
    onBlockRef.current = onBlock;
  }, [shouldBlock, onBlock]);

  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;

    const customPush = (...args: Parameters<typeof originalPush>) => {
      const [path] = args;
      const proceed = () => originalPush(...args);
      if (shouldBlockRef.current()) {
        onBlockRef.current(path as string, proceed);
      } else {
        proceed();
      }
    };

    const customReplace = (...args: Parameters<typeof originalReplace>) => {
      const [path] = args;
      const proceed = () => originalReplace(...args);
      if (shouldBlockRef.current()) {
        onBlockRef.current(path as string, proceed);
      } else {
        proceed();
      }
    };

    // @ts-ignore
    router.push = customPush;
    // @ts-ignore
    router.replace = customReplace;

    return () => {
      // @ts-ignore
      router.push = originalPush;
      // @ts-ignore
      router.replace = originalReplace;
    };
  }, [router]);
}